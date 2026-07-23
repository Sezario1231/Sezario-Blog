import type { APIRoute } from "astro";
import { getSupabase } from "@/lib/supabase";
import { verifyAdminRequest, unauthorized, jsonError } from "@/lib/admin-auth";

export const prerender = false;

const VALID_TYPES = new Set(["posts", "projects", "quotes", "comments", "contacts", "settings"]);

export const GET: APIRoute = async ({ request, params, url }) => {
  if (!verifyAdminRequest(request)) return unauthorized();

  const type = params.type;
  if (!type || !VALID_TYPES.has(type)) return jsonError("不支持的导出类型", 400);

  const format = url.searchParams.get("format") || "json";
  if (format !== "json") return jsonError("仅支持 JSON 格式", 400);

  const supabase = getSupabase();
  const { data, error } = await supabase.from(type).select("*").order("created_at", { ascending: false });

  if (error) {
    console.error(`[admin/export] ${type} error:`, error.message);
    return jsonError("导出失败", 500);
  }

  const filename = `${type}-${new Date().toISOString().split("T")[0]}.json`;

  return new Response(JSON.stringify(data || [], null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
};
