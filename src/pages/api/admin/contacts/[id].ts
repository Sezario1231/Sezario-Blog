import type { APIRoute } from "astro";
import { getSupabase } from "@/lib/supabase";
import { verifyAdminRequest, unauthorized, json, jsonError } from "@/lib/admin-auth";

export const prerender = false;

export const DELETE: APIRoute = async ({ request, params }) => {
  if (!verifyAdminRequest(request)) return unauthorized();

  const { id } = params;
  if (!id) return jsonError("缺少 id");

  const supabase = getSupabase();
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) {
    console.error("[admin/contacts] delete error:", error.message);
    return jsonError("删除留言失败", 500);
  }
  return json({ ok: true });
};

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) return jsonError("缺少 id");

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return jsonError("留言不存在", 404);
  return json(data);
};
