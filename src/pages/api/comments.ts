import type { APIRoute } from "astro";
import { getSupabase } from "@/lib/supabase";
import { escapeHtml, normalizeWhitespace, maskIp } from "@/lib/sanitize";

export const prerender = false;

const AUTHOR_MAX = 50;
const AUTHOR_MIN = 1;
const CONTENT_MAX = 2000;
const CONTENT_MIN = 1;
const RATE_LIMIT_COUNT = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CommentBody {
  post_slug?: unknown;
  author?: unknown;
  email?: unknown;
  content?: unknown;
  parent_id?: unknown;
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

export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get("slug");
  if (!slug) {
    return new Response(JSON.stringify({ success: false, message: "缺少 slug 参数" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("comments")
      .select("id, post_slug, author, content, parent_id, created_at")
      .eq("post_slug", slug)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[comments] query error:", error.message);
      return new Response(JSON.stringify({ success: false, message: "获取评论失败" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, comments: data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[comments] unexpected error:", err);
    return new Response(JSON.stringify({ success: false, message: "服务暂时不可用" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (request.headers.get("content-type")?.includes("application/json") === false) {
    return jsonError("请求格式不正确", 400);
  }

  let body: CommentBody;
  try {
    body = await request.json();
  } catch {
    return jsonError("请求体解析失败", 400);
  }

  const rawSlug = typeof body.post_slug === "string" ? body.post_slug : "";
  const rawAuthor = typeof body.author === "string" ? body.author : "";
  const rawEmail = typeof body.email === "string" ? body.email : "";
  const rawContent = typeof body.content === "string" ? body.content : "";
  const rawParentId = typeof body.parent_id === "string" ? body.parent_id : null;

  const postSlug = normalizeWhitespace(rawSlug);
  const author = normalizeWhitespace(rawAuthor);
  const email = normalizeWhitespace(rawEmail);
  const content = normalizeWhitespace(rawContent);
  const parentId = rawParentId;

  if (!postSlug) return jsonError("缺少文章标识", 400);
  if (postSlug.length > 200) return jsonError("文章标识过长", 400);

  if (!author) return jsonError("请输入昵称", 400);
  if (author.length < AUTHOR_MIN) return jsonError("昵称至少 1 个字符", 400);
  if (author.length > AUTHOR_MAX) return jsonError(`昵称不能超过 ${AUTHOR_MAX} 个字符`, 400);

  if (email && !EMAIL_REGEX.test(email)) return jsonError("邮箱格式不正确", 400);
  if (email && email.length > 100) return jsonError("邮箱不能超过 100 个字符", 400);

  if (!content) return jsonError("请输入评论内容", 400);
  if (content.length < CONTENT_MIN) return jsonError("评论内容至少 1 个字符", 400);
  if (content.length > CONTENT_MAX) return jsonError(`评论内容不能超过 ${CONTENT_MAX} 个字符`, 400);

  try {
    const ip = maskIp(getClientIp(request, clientAddress));
    const supabase = getSupabase();

    if (parentId) {
      const { data: parent } = await supabase
        .from("comments")
        .select("id")
        .eq("id", parentId)
        .single();

      if (!parent) return jsonError("回复的评论不存在", 404);
    }

    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count, error: countError } = await supabase
      .from("comments")
      .select("id", { count: "exact", head: true })
      .eq("ip_address", ip)
      .gte("created_at", since);

    if (countError) {
      console.error("[comments] rate-limit query error:", countError.message);
      return jsonError("服务暂时不可用，请稍后再试", 500);
    }

    if ((count ?? 0) >= RATE_LIMIT_COUNT) {
      return jsonError("提交过于频繁，请 10 分钟后再试", 429);
    }

    const { error: insertError } = await supabase.from("comments").insert({
      post_slug: postSlug,
      author: escapeHtml(author),
      email: email ? escapeHtml(email) : null,
      content: escapeHtml(content),
      parent_id: parentId || null,
      ip_address: ip,
    });

    if (insertError) {
      console.error("[comments] insert error:", insertError.message);
      return jsonError("提交失败，请稍后再试", 500);
    }
  } catch (err) {
    console.error("[comments] unexpected error:", err);
    return jsonError("服务暂时不可用，请稍后再试", 500);
  }

  return new Response(
    JSON.stringify({ success: true, message: "评论已提交！" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ success: false, message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
