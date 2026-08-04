const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD;
const SITE_URL = (import.meta.env.PUBLIC_SITE_URL || "http://localhost:4321").replace(/\/$/, "");

export function verifyAdmin(request: Request): boolean {
  const authHeader = request.headers.get("x-admin-password");
  return authHeader === ADMIN_PASSWORD;
}

export function verifyOrigin(request: Request): boolean {
  const origin = request.headers.get("Origin");
  const referer = request.headers.get("Referer");
  const source = origin || referer;
  if (!source) return false;
  try {
    const url = new URL(source);
    return url.origin === SITE_URL || url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname.endsWith(".pages.dev");
  } catch {
    return false;
  }
}

export function verifyAdminRequest(request: Request): boolean {
  return verifyAdmin(request) && verifyOrigin(request);
}

export function unauthorized(): Response {
  return new Response(JSON.stringify({ error: "未授权" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function jsonError(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
