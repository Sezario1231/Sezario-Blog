import type { APIRoute } from "astro";
import { getSupabase } from "@/lib/supabase";
import { verifyAdminRequest, unauthorized, json, jsonError } from "@/lib/admin-auth";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const supabase = getSupabase();
  const showDrafts = url.searchParams.get("drafts") === "true";

  let query = supabase.from("posts").select("*").order("created_at", { ascending: false });
  if (!showDrafts) {
    query = query.eq("draft", false);
  }

  const { data, error } = await query;
  if (error) return jsonError("获取文章失败", 500);
  return json(data);
};

export const POST: APIRoute = async ({ request }) => {
  if (!verifyAdminRequest(request)) return unauthorized();

  let body: any;
  try {
    body = await request.json();
  } catch {
    return jsonError("请求体解析失败");
  }

  const { title, description, category, tags, body: content, cover_image, password, draft } = body;

  if (!title || !description) {
    return jsonError("标题和描述为必填项");
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "") + "-" + Date.now().toString(36);

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("posts")
    .insert({
      title,
      slug,
      description,
      category: category || "未分类",
      tags: tags || [],
      body: content || "",
      cover_image: cover_image || null,
      password: password || null,
      draft: draft ?? false,
    })
    .select()
    .single();

  if (error) {
    console.error("[posts] insert error:", error.message);
    return jsonError("创建文章失败", 500);
  }
  return json(data, 201);
};
