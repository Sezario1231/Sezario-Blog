import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

type FormStatus = "idle" | "loading" | "success" | "error";

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
  form?: string;
}

function validate(name: string, email: string, message: string): FormErrors {
  const errors: FormErrors = {};
  if (!name.trim()) errors.name = "请输入姓名";
  else if (name.trim().length < 2) errors.name = "姓名至少 2 个字符";
  if (!email.trim()) errors.email = "请输入邮箱";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "邮箱格式不正确";
  if (!message.trim()) errors.message = "请输入留言内容";
  else if (message.trim().length < 10) errors.message = "留言内容至少 10 个字符";
  return errors;
}

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<FormStatus>("idle");

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const newErrors = validate(name, email, message);
    setErrors(newErrors);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate(name, email, message);
    setErrors(newErrors);
    setTouched({ name: true, email: true, message: true });

    if (Object.keys(newErrors).length > 0) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });
      const data = await res.json().catch(() => ({ success: false, message: "响应解析失败" }));
      if (!res.ok || !data.success) {
        setStatus("error");
        setErrors((prev) => ({
          ...prev,
          form: data.message || "提交失败，请稍后再试",
        }));
        setTouched((prev) => ({ ...prev, form: true }));
        return;
      }
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
      setErrors({});
      setTouched({});
    } catch {
      setStatus("error");
      setErrors((prev) => ({ ...prev, form: "网络异常，请检查连接后重试" }));
      setTouched((prev) => ({ ...prev, form: true }));
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">消息已发送</h3>
        <p className="text-sm text-muted-foreground mb-6">感谢你的留言，我会尽快回复。</p>
        <Button variant="outline" onClick={() => setStatus("idle")} className="active:scale-[0.97]">
          再发一条
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          姓名 <span className="text-destructive">*</span>
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => handleBlur("name")}
          placeholder="你的姓名"
          className={touched.name && errors.name ? "border-destructive focus-visible:ring-destructive/20" : ""}
        />
        {touched.name && errors.name && (
          <p className="text-xs text-destructive animate-fade-in">{errors.name}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          邮箱 <span className="text-destructive">*</span>
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleBlur("email")}
          placeholder="your@email.com"
          className={touched.email && errors.email ? "border-destructive focus-visible:ring-destructive/20" : ""}
        />
        {touched.email && errors.email && (
          <p className="text-xs text-destructive animate-fade-in">{errors.email}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="message" className="text-sm font-medium">
          留言 <span className="text-destructive">*</span>
        </label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onBlur={() => handleBlur("message")}
          placeholder="分享你的想法、项目，或打个招呼..."
          rows={5}
          className={touched.message && errors.message ? "border-destructive focus-visible:ring-destructive/20" : ""}
        />
        {touched.message && errors.message && (
          <p className="text-xs text-destructive animate-fade-in">{errors.message}</p>
        )}
      </div>

      {touched.form && errors.form && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive animate-fade-in">
          {errors.form}
        </div>
      )}

      <Button
        type="submit"
        disabled={status === "loading"}
        className="w-full active:scale-[0.97]"
      >
        {status === "loading" ? (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            发送中...
          </span>
        ) : (
          "发送留言"
        )}
      </Button>
    </form>
  );
}
