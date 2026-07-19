import type { APIRoute } from "astro";
import { getSupabase } from "@/lib/supabase";
import { verifyAdmin, unauthorized, json, jsonError } from "@/lib/admin-auth";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return jsonError("文章不存在", 404);
  return json(data);
};

export const PUT: APIRoute = async ({ request, params }) => {
  if (!verifyAdmin(request)) return unauthorized();

  const { id } = params;
  let body: any;
  try {
    body = await request.json();
  } catch {
    return jsonError("请求体解析失败");
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("posts")
    .update({
      title: body.title,
      description: body.description,
      category: body.category,
      tags: body.tags,
      body: body.body,
      cover_image: body.cover_image || null,
      password: body.password || null,
      draft: body.draft ?? false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[posts] update error:", error.message);
    return jsonError("更新文章失败", 500);
  }
  return json(data);
};

export const DELETE: APIRoute = async ({ request, params }) => {
  if (!verifyAdmin(request)) return unauthorized();

  const { id } = params;
  const supabase = getSupabase();

  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) {
    console.error("[posts] delete error:", error.message);
    return jsonError("删除文章失败", 500);
  }
  return json({ ok: true });
};
