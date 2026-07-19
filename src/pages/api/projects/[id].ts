import type { APIRoute } from "astro";
import { getSupabase } from "@/lib/supabase";
import { verifyAdmin, unauthorized, json, jsonError } from "@/lib/admin-auth";

export const prerender = false;

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
    .from("projects")
    .update({
      name: body.name,
      description: body.description,
      tech_stack: body.tech_stack,
      github: body.github,
      demo: body.demo,
      sort_order: body.sort_order,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[projects] update error:", error.message);
    return jsonError("更新项目失败", 500);
  }
  return json(data);
};

export const DELETE: APIRoute = async ({ request, params }) => {
  if (!verifyAdmin(request)) return unauthorized();

  const { id } = params;
  const supabase = getSupabase();

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) {
    console.error("[projects] delete error:", error.message);
    return jsonError("删除项目失败", 500);
  }
  return json({ ok: true });
};
