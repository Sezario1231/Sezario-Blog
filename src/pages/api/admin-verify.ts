import type { APIRoute } from "astro";
import { checkRateLimit } from "@/lib/rate-limit";

const RATE_LIMIT_COUNT = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

function getClientIp(request: Request, clientAddress: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return clientAddress || "unknown";
}

export const POST: APIRoute = async ({ request, clientAddress, locals }) => {
  const ip = getClientIp(request, clientAddress);

  const limited = await checkRateLimit(locals, "admin-verify", ip, RATE_LIMIT_COUNT, RATE_LIMIT_WINDOW_MS);
  if (limited) {
    return new Response(JSON.stringify({ ok: false, error: "尝试过于频繁，请 15 分钟后再试" }), { status: 429 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 400 });
  }

  const { password } = body;

  if (password === import.meta.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }
  return new Response(JSON.stringify({ ok: false }), { status: 401 });
};
