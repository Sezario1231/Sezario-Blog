import type { APIRoute } from "astro";
import { getSupabase } from "@/lib/supabase";
import { verifyAdminRequest, unauthorized, json, jsonError } from "@/lib/admin-auth";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!verifyAdminRequest(request)) return unauthorized();

  let body: any;
  try {
    body = await request.json();
  } catch {
    return jsonError("请求体解析失败");
  }

  const { ids } = body;
  if (!Array.isArray(ids) || ids.length === 0) return jsonError("请选择至少一项");

  const supabase = getSupabase();
  const { error } = await supabase.from("quotes").delete().in("id", ids);
  if (error) return jsonError("批量删除失败", 500);
  return json({ ok: true, count: ids.length });
};
