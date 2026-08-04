import type { APIRoute } from "astro";
import { getSupabase } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";

export const prerender = false;

const SLUG_MAX = 200;
const SESSION_MAX = 128;
const RATE_LIMIT_COUNT = 30;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

interface LikeBody {
  slug?: unknown;
  session_id?: unknown;
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

function validSlug(slug: string): boolean {
  return slug.length > 0 && slug.length <= SLUG_MAX && !/\s/.test(slug);
}

function validSession(sessionId: string): boolean {
  return sessionId.length > 0 && sessionId.length <= SESSION_MAX && !/\s/.test(sessionId);
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function jsonError(message: string, status = 400): Response {
  return json({ error: message }, status);
}

export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get("slug") || "";
  if (!validSlug(slug)) return jsonError("缺少或无效的 slug 参数", 400);
  const sessionId = url.searchParams.get("session_id") || "";

  try {
    const supabase = getSupabase();
    const { count } = await supabase
      .from("post_likes")
      .select("session_id", { count: "exact", head: true })
      .eq("post_slug", slug);

    let liked = false;
    if (validSession(sessionId)) {
      const { count: mine } = await supabase
        .from("post_likes")
        .select("session_id", { count: "exact", head: true })
        .eq("post_slug", slug)
        .eq("session_id", sessionId);
      liked = (mine ?? 0) > 0;
    }

    return json({ count: count ?? 0, liked });
  } catch (err) {
    console.error("[likes] query error:", err);
    return jsonError("服务暂时不可用", 500);
  }
};

export const POST: APIRoute = async ({ request, clientAddress, locals }) => {
  if (request.headers.get("content-type")?.includes("application/json") === false) {
    return jsonError("请求格式不正确", 400);
  }

  let body: LikeBody;
  try {
    body = await request.json();
  } catch {
    return jsonError("请求体解析失败", 400);
  }

  const slug = typeof body.slug === "string" ? body.slug : "";
  const sessionId = typeof body.session_id === "string" ? body.session_id : "";
  if (!validSlug(slug)) return jsonError("缺少或无效的 slug 参数", 400);
  if (!validSession(sessionId)) return jsonError("缺少或无效的 session_id 参数", 400);

  if (await checkRateLimit(locals, "likes", getClientIp(request, clientAddress), RATE_LIMIT_COUNT, RATE_LIMIT_WINDOW_MS)) {
    return jsonError("操作过于频繁，请稍后再试", 429);
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("post_likes")
      .upsert(
        { post_slug: slug, session_id: sessionId },
        { onConflict: "post_slug,session_id", ignoreDuplicates: true }
      );

    if (error) {
      console.error("[likes] upsert error:", error.message);
      return jsonError("操作失败，请稍后再试", 500);
    }

    const { count } = await supabase
      .from("post_likes")
      .select("session_id", { count: "exact", head: true })
      .eq("post_slug", slug);

    return json({ count: count ?? 0, liked: true });
  } catch (err) {
    console.error("[likes] unexpected error:", err);
    return jsonError("服务暂时不可用", 500);
  }
};

export const DELETE: APIRoute = async ({ request, clientAddress, locals }) => {
  if (request.headers.get("content-type")?.includes("application/json") === false) {
    return jsonError("请求格式不正确", 400);
  }

  let body: LikeBody;
  try {
    body = await request.json();
  } catch {
    return jsonError("请求体解析失败", 400);
  }

  const slug = typeof body.slug === "string" ? body.slug : "";
  const sessionId = typeof body.session_id === "string" ? body.session_id : "";
  if (!validSlug(slug)) return jsonError("缺少或无效的 slug 参数", 400);
  if (!validSession(sessionId)) return jsonError("缺少或无效的 session_id 参数", 400);

  if (await checkRateLimit(locals, "likes", getClientIp(request, clientAddress), RATE_LIMIT_COUNT, RATE_LIMIT_WINDOW_MS)) {
    return jsonError("操作过于频繁，请稍后再试", 429);
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_slug", slug)
      .eq("session_id", sessionId);

    if (error) {
      console.error("[likes] delete error:", error.message);
      return jsonError("操作失败，请稍后再试", 500);
    }

    const { count } = await supabase
      .from("post_likes")
      .select("session_id", { count: "exact", head: true })
      .eq("post_slug", slug);

    return json({ count: count ?? 0, liked: false });
  } catch (err) {
    console.error("[likes] unexpected error:", err);
    return jsonError("服务暂时不可用", 500);
  }
};
