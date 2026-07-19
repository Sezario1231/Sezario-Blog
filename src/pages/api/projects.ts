import type { APIRoute } from "astro";
import { getSupabase } from "@/lib/supabase";
import { verifyAdmin, unauthorized, json, jsonError } from "@/lib/admin-auth";

export const prerender = false;

export const GET: APIRoute = async () => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return jsonError("获取项目失败", 500);
  return json(data);
};

export const POST: APIRoute = async ({ request }) => {
  if (!verifyAdmin(request)) return unauthorized();

  let body: any;
  try {
    body = await request.json();
  } catch {
    return jsonError("请求体解析失败");
  }

  const { name, description, tech_stack, github, demo, sort_order } = body;
  if (!name) return jsonError("项目名称为必填项");

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      name,
      description: description || "",
      tech_stack: tech_stack || [],
      github: github || null,
      demo: demo || null,
      sort_order: sort_order ?? 0,
    })
    .select()
    .single();

  if (error) {
    console.error("[projects] insert error:", error.message);
    return jsonError("创建项目失败", 500);
  }
  return json(data, 201);
};
