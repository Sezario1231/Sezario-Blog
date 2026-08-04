import type { APIRoute } from "astro";
import { getSupabase } from "@/lib/supabase";
import { verifyAdminRequest, unauthorized, json, jsonError } from "@/lib/admin-auth";

export const prerender = false;

export const DELETE: APIRoute = async ({ request, params }) => {
  if (!verifyAdminRequest(request)) return unauthorized();

  const { id } = params;
  if (!id) return jsonError("缺少 id");

  const supabase = getSupabase();

  const { error: delReplies } = await supabase.from("comments").delete().eq("parent_id", id);
  if (delReplies) {
    console.error("[admin/comments] delete replies error:", delReplies.message);
  }

  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) {
    console.error("[admin/comments] delete error:", error.message);
    return jsonError("删除评论失败", 500);
  }
  return json({ ok: true });
};
