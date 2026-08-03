import { useState, useEffect, useCallback, useRef } from "react";
import MDEditor, { commands, type ICommand } from "@uiw/react-md-editor";

/* ── Image upload helper ── */
async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  const pwd = sessionStorage.getItem("admin_password") || "";
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "x-admin-password": pwd },
    body: formData,
  });
  const body = await res.json().catch(() => ({ error: "无法解析响应" }));
  if (!res.ok) throw new Error(body.error || `上传失败 (${res.status})`);
  if (!body.url) throw new Error("服务器未返回图片 URL");
  return body.url;
}

/* ── Props ── */
interface MarkdownEditorProps {
  onChange?: (value: string) => void;
}

/* ── Component ── */
export default function MarkdownEditor({ onChange }: MarkdownEditorProps) {
  const [value, setValue] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [uploading, setUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const editorRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  /* ── Sync from hidden textarea on mount / edit ── */
  useEffect(() => {
    const ta = document.getElementById("pe-body") as HTMLTextAreaElement | null;
    if (ta) setValue(ta.value);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const v = (e as CustomEvent).detail || "";
      setValue(v);
    };
    window.addEventListener("editor-setvalue", handler);
    return () => window.removeEventListener("editor-setvalue", handler);
  }, []);

  /* ── Push value back to hidden textarea ── */
  const handleChange = useCallback(
    (val?: string) => {
      const v = val || "";
      setValue(v);
      const ta = document.getElementById("pe-body") as HTMLTextAreaElement | null;
      if (ta) {
        ta.value = v;
        ta.dispatchEvent(new Event("input", { bubbles: true }));
      }
      onChange?.(v);
    },
    [onChange]
  );

  /* ── Auto-draft save ── */
  useEffect(() => {
    setSaveStatus("idle");
    const timer = setTimeout(() => {
      const id = (document.getElementById("pe-id") as HTMLInputElement)?.value;
      if (id && value) {
        try {
          localStorage.setItem(`md-draft-${id}`, value);
          setSaveStatus("saved");
        } catch {
          setSaveStatus("error");
        }
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [value]);

  /* ── Theme observer ── */
  useEffect(() => {
    const check = () =>
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  /* ── Upload logic ── */
  const doUpload = useCallback(
    (file: File) => {
      setUploading(true);
      setUploadCount((c) => c + 1);
      const placeholder = `![上传中...](uploading)`;
      const cur = valueRef.current;
      const sep = cur.endsWith("\n") ? "" : "\n";
      handleChange(cur + sep + placeholder + "\n");

      uploadImage(file)
        .then((url) => {
          handleChange(valueRef.current.replace(placeholder, `![${file.name}](${url})`));
        })
        .catch((err: any) => {
          handleChange(
            valueRef.current.replace(placeholder, `> 图片上传失败: ${err?.message || file.name}`)
          );
        })
        .finally(() => {
          setUploadCount((c) => {
            const next = c - 1;
            if (next <= 0) setUploading(false);
            return Math.max(0, next);
          });
        });
    },
    [handleChange]
  );

  /* ── File picker ── */
  const handleFileInput = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = () => {
      if (!input.files) return;
      for (const file of Array.from(input.files)) doUpload(file);
    };
    input.click();
  }, [doUpload]);

  /* ── Paste images ── */
  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) doUpload(file);
        }
      }
    },
    [doUpload]
  );

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    el.addEventListener("paste", handlePaste);
    return () => el.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  /* ── Drag & drop ── */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      const files = e.dataTransfer.files;
      if (!files) return;
      for (const file of Array.from(files)) {
        if (file.type.startsWith("image/")) doUpload(file);
      }
    },
    [doUpload]
  );

  /* ── Word count ── */
  const wordCount = value
    ? value.replace(/[#*`>\[\]!\-_|~]/g, "").split(/\s+/).filter(Boolean).length
    : 0;
  const charCount = value.length;

  /* ── Custom image command (insert at cursor) ── */
  const imageUploadCommand: ICommand = {
    name: "image-upload",
    keyCommand: "image-upload",
    buttonProps: { title: "上传图片" },
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    ),
    execute: () => handleFileInput(),
  };

  return (
    <div ref={editorRef} data-color-mode={theme} className="relative">
      {/* ── Status bar ── */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFileInput}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/40 bg-card/50 text-xs font-medium text-muted-foreground/70 hover:bg-muted/30 hover:text-primary transition-colors disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            {uploading ? `上传中 (${uploadCount})...` : "上传图片"}
          </button>
          <span className="text-[11px] text-muted-foreground/40 hidden sm:inline">
            支持 Ctrl+V 粘贴 / 拖拽上传
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground/40">
          {saveStatus === "saved" && <span className="text-green-500/70">已自动保存</span>}
          {saveStatus === "error" && <span className="text-red-500/70">保存失败</span>}
          <span>{charCount} 字符</span>
          <span>{wordCount} 词</span>
        </div>
      </div>

      {/* ── Editor with drag overlay ── */}
      <div
        className="relative rounded-xl overflow-hidden"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <MDEditor
          value={value}
          onChange={handleChange}
          height={520}
          visibleDragbar={true}
          commands={[
            commands.bold,
            commands.italic,
            commands.strikethrough,
            commands.divider,
            commands.title1,
            commands.title2,
            commands.title3,
            commands.divider,
            commands.unorderedListCommand,
            commands.orderedListCommand,
            commands.checkedListCommand,
            commands.divider,
            commands.code,
            commands.codeBlock,
            commands.divider,
            commands.link,
            commands.image,
            imageUploadCommand,
            commands.divider,
            commands.table,
            commands.quote,
            commands.horizontalRule,
          ]}
          extraCommands={[
            commands.codeEdit,
            commands.codePreview,
            commands.codeLive,
            commands.divider,
            commands.fullscreen,
          ]}
        />

        {/* ── Drag overlay ── */}
        {dragging && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-primary/10 border-2 border-dashed border-primary/40 rounded-xl backdrop-blur-sm pointer-events-none">
            <div className="flex flex-col items-center gap-2 text-primary">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="text-sm font-medium">松开以上传图片</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
