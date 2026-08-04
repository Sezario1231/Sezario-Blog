import type { APIRoute } from "astro";
import { getSupabase } from "@/lib/supabase";
import { verifyAdminRequest, unauthorized, json, jsonError } from "@/lib/admin-auth";

export const prerender = false;

export const GET: APIRoute = async () => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("site_settings").select("*");

  if (error) return jsonError("获取设置失败", 500);

  const settings: Record<string, any> = {};
  for (const row of data || []) {
    settings[row.key] = row.value;
  }
  return json(settings);
};

export const PUT: APIRoute = async ({ request }) => {
  if (!verifyAdminRequest(request)) return unauthorized();

  let body: Record<string, any>;
  try {
    body = await request.json();
  } catch {
    return jsonError("请求体解析失败");
  }

  const supabase = getSupabase();
  const updates = Object.entries(body).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("site_settings")
    .upsert(updates, { onConflict: "key" });

  if (error) {
    console.error("[settings] upsert error:", error.message);
    return jsonError("更新设置失败", 500);
  }
  return json({ ok: true });
};
