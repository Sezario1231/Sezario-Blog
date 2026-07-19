import type { APIRoute } from "astro";
import { getSupabase } from "@/lib/supabase";
import { escapeHtml, normalizeWhitespace, maskIp } from "@/lib/sanitize";

export const prerender = false;

const NAME_MAX = 50;
const EMAIL_MAX = 100;
const MESSAGE_MAX = 1000;
const NAME_MIN = 2;
const MESSAGE_MIN = 10;
const RATE_LIMIT_COUNT = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactBody {
  name?: unknown;
  email?: unknown;
  message?: unknown;
}

function getClientIp(request: Request, clientAddress: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return clientAddress || "unknown";
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (request.headers.get("content-type")?.includes("application/json") === false) {
    return new Response(
      JSON.stringify({ success: false, message: "请求格式不正确" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: ContactBody;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: "请求体解析失败" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const rawName = typeof body.name === "string" ? body.name : "";
  const rawEmail = typeof body.email === "string" ? body.email : "";
  const rawMessage = typeof body.message === "string" ? body.message : "";

  const name = normalizeWhitespace(rawName);
  const email = normalizeWhitespace(rawEmail);
  const message = normalizeWhitespace(rawMessage);

  // ---- 服务端校验 ----
  if (!name) {
    return jsonError("请输入姓名", 400);
  }
  if (name.length < NAME_MIN) {
    return jsonError("姓名至少 2 个字符", 400);
  }
  if (name.length > NAME_MAX) {
    return jsonError(`姓名不能超过 ${NAME_MAX} 个字符`, 400);
  }

  if (!email) {
    return jsonError("请输入邮箱", 400);
  }
  if (email.length > EMAIL_MAX) {
    return jsonError(`邮箱不能超过 ${EMAIL_MAX} 个字符`, 400);
  }
  if (!EMAIL_REGEX.test(email)) {
    return jsonError("邮箱格式不正确", 400);
  }

  if (!message) {
    return jsonError("请输入留言内容", 400);
  }
  if (message.length < MESSAGE_MIN) {
    return jsonError(`留言内容至少 ${MESSAGE_MIN} 个字符`, 400);
  }
  if (message.length > MESSAGE_MAX) {
    return jsonError(`留言内容不能超过 ${MESSAGE_MAX} 个字符`, 400);
  }

  // ---- 限流检查（基于 IP，10 分钟内最多 3 次）----
  try {
    const ip = maskIp(getClientIp(request, clientAddress));
    const supabase = getSupabase();
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

    const { count, error } = await supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("ip_address", ip)
      .gte("created_at", since);

    if (error) {
      console.error("[contact] rate-limit query error:", error.message);
      return jsonError("服务暂时不可用，请稍后再试", 500);
    }

    if ((count ?? 0) >= RATE_LIMIT_COUNT) {
      return jsonError("提交过于频繁，请 10 分钟后再试", 429);
    }

    // ---- XSS 转义后写入 ----
    const { error: insertError } = await supabase
      .from("contact_messages")
      .insert({
        name: escapeHtml(name),
        email: escapeHtml(email),
        message: escapeHtml(message),
        ip_address: ip,
      });

    if (insertError) {
      console.error("[contact] insert error:", insertError.message);
      return jsonError("提交失败，请稍后再试", 500);
    }
  } catch (err) {
    console.error("[contact] unexpected error:", err);
    return jsonError("服务暂时不可用，请稍后再试", 500);
  }

  return new Response(
    JSON.stringify({ success: true, message: "留言已收到，我会尽快回复你！" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ success: false, message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
