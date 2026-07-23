import type { APIRoute } from "astro";
import { getSupabase } from "@/lib/supabase";
import { verifyAdminRequest, unauthorized, json, jsonError } from "@/lib/admin-auth";

export const prerender = false;

export const GET: APIRoute = async ({ request, url }) => {
  if (!verifyAdminRequest(request)) return unauthorized();

  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = Math.min(parseInt(url.searchParams.get("pageSize") || "20"), 100);
  const offset = (page - 1) * pageSize;
  const postSlug = url.searchParams.get("slug") || "";

  const supabase = getSupabase();

  let countQuery = supabase.from("comments").select("*", { count: "exact", head: true });
  let dataQuery = supabase.from("comments").select("*").order("created_at", { ascending: false });

  if (postSlug) {
    countQuery = countQuery.eq("post_slug", postSlug);
    dataQuery = dataQuery.eq("post_slug", postSlug);
  }

  const { count } = await countQuery;

  const { data, error } = await dataQuery.range(offset, offset + pageSize - 1);

  if (error) return jsonError("获取评论失败", 500);
  return json({ data, total: count ?? 0, page, pageSize });
};

export const DELETE: APIRoute = async ({ request }) => {
  if (!verifyAdminRequest(request)) return unauthorized();

  let body: any;
  try {
    body = await request.json();
  } catch {
    return jsonError("请求体解析失败");
  }

  const { id } = body;
  if (!id) return jsonError("缺少 id");

  const supabase = getSupabase();
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) {
    console.error("[admin/comments] delete error:", error.message);
    return jsonError("删除评论失败", 500);
  }
  return json({ ok: true });
};
