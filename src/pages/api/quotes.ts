import type { APIRoute } from "astro";
import { getSupabase } from "@/lib/supabase";
import { verifyAdminRequest, unauthorized, json, jsonError } from "@/lib/admin-auth";

export const prerender = false;

export const GET: APIRoute = async () => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return jsonError("获取名言失败", 500);
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

  const { text, author } = body;
  if (!text) return jsonError("名言内容为必填项");

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("quotes")
    .insert({ text, author: author || "Unknown" })
    .select()
    .single();

  if (error) {
    console.error("[quotes] insert error:", error.message);
    return jsonError("添加名言失败", 500);
  }
  return json(data, 201);
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
  const { error } = await supabase.from("quotes").delete().eq("id", id);
  if (error) {
    console.error("[quotes] delete error:", error.message);
    return jsonError("删除名言失败", 500);
  }
  return json({ ok: true });
};
