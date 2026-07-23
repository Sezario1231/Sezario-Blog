import type { APIRoute } from "astro";
import { getSupabase } from "@/lib/supabase";
import { verifyAdminRequest, unauthorized } from "@/lib/admin-auth";

export const prerender = false;

const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml",
]);
const MAX_SIZE = 5 * 1024 * 1024;

export const POST: APIRoute = async ({ request }) => {
  if (!verifyAdminRequest(request)) return unauthorized();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(JSON.stringify({ error: "invalid form data" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const file = formData.get("image") as File | null;
  if (!file) {
    return new Response(JSON.stringify({ error: "no image provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return new Response(JSON.stringify({ error: "不支持的文件类型，仅允许 JPG/PNG/WebP/GIF/SVG" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (file.size > MAX_SIZE) {
    return new Response(JSON.stringify({ error: "文件大小不能超过 5MB" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const supabase = getSupabase();
  const { error: uploadError } = await supabase.storage
    .from("blog-images")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("[upload] storage error:", uploadError.message);
    return new Response(JSON.stringify({ error: "upload failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: publicUrlData } = supabase.storage
    .from("blog-images")
    .getPublicUrl(fileName);

  return new Response(
    JSON.stringify({ url: publicUrlData.publicUrl }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
