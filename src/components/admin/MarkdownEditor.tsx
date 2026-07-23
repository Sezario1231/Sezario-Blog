import { useState, useEffect, useCallback, useRef } from "react";
import MDEditor, { commands, type ICommand } from "@uiw/react-md-editor";

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.url;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const imageUploadCommand: ICommand = {
  name: "image",
  keyCommand: "image",
  buttonProps: { "aria-label": "上传图片", title: "上传图片" },
  icon: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  ),
  execute: (state, api) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const loadingId = generateId();
      api.replaceSelection(`![Uploading ${file.name}](${loadingId})`);
      try {
        const url = await uploadImage(file);
        const text = api.getState()?.text || "";
        const updated = text.replace(`![Uploading ${file.name}](${loadingId})`, `![](${url})`);
        api.setSelection({ start: 0, end: text.length });
        api.replaceSelection(updated);
      } catch {
        api.replaceSelection(`*图片上传失败: ${file.name}*`);
      }
    };
    input.click();
  },
};

interface MarkdownEditorProps {
  onChange?: (value: string) => void;
}

export default function MarkdownEditor({ onChange }: MarkdownEditorProps) {
  const [value, setValue] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ta = document.getElementById("pe-body") as HTMLTextAreaElement | null;
    if (ta) {
      textareaRef.current = ta;
      setValue(ta.value);
    }
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      setValue((e as CustomEvent).detail || "");
    };
    window.addEventListener("editor-setvalue", handler);
    return () => window.removeEventListener("editor-setvalue", handler);
  }, []);

  const handleChange = useCallback(
    (val?: string) => {
      const v = val || "";
      setValue(v);
      if (textareaRef.current) {
        textareaRef.current.value = v;
        textareaRef.current.dispatchEvent(new Event("input", { bubbles: true }));
      }
      onChange?.(v);
    },
    [onChange]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const id = (document.getElementById("pe-id") as HTMLInputElement)?.value;
      if (id && value) {
        localStorage.setItem(`md-draft-${id}`, value);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    const check = () => {
      setTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light"
      );
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;
        const loadingId = generateId();
        const ta = textareaRef.current;
        if (ta) {
          const start = ta.selectionStart;
          const end = ta.selectionEnd;
          const before = value.slice(0, start);
          const after = value.slice(end);
          const placeholder = `![Uploading ${file.name}](${loadingId})`;
          handleChange(before + placeholder + after);
        }
        try {
          const url = await uploadImage(file);
          const updated = value.replace(
            `![Uploading ${file.name}](${loadingId})`,
            `![](${url})`
          );
          handleChange(updated);
        } catch {
          const failed = value.replace(
            `![Uploading ${file.name}](${loadingId})`,
            `*图片上传失败: ${file.name}*`
          );
          handleChange(failed);
        }
      }
    }
  }, [value, handleChange]);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    el.addEventListener("paste", handlePaste);
    return () => el.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  return (
    <div ref={editorRef} data-color-mode={theme}>
      <MDEditor
        value={value}
        onChange={handleChange}
        height={520}
        visibleDragbar={false}
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
          imageUploadCommand,
          commands.divider,
          commands.table,
        ]}
        extraCommands={[
          commands.codeEdit,
          commands.codePreview,
          commands.codeLive,
          commands.divider,
          commands.fullscreen,
        ]}
      />
    </div>
  );
}
