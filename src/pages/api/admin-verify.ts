import type { APIRoute } from "astro";

const RATE_LIMIT_COUNT = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

const attemptMap = new Map<string, number[]>();

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

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const attempts = attemptMap.get(ip)?.filter((t) => t > windowStart) || [];
  attemptMap.set(ip, attempts);
  return attempts.length >= RATE_LIMIT_COUNT;
}

function recordAttempt(ip: string): void {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const attempts = attemptMap.get(ip)?.filter((t) => t > windowStart) || [];
  attempts.push(now);
  attemptMap.set(ip, attempts);
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const ip = getClientIp(request, clientAddress);

  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ ok: false, error: "尝试过于频繁，请 15 分钟后再试" }), { status: 429 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 400 });
  }

  recordAttempt(ip);

  const { password } = body;

  if (password === import.meta.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }
  return new Response(JSON.stringify({ ok: false }), { status: 401 });
};
