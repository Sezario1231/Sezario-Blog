import { defineMiddleware } from "astro/middleware";

const siteUrl = import.meta.env.PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:4321";

const csp = [
  "default-src 'self'",
  "script-src 'self' https://giscus.app https://cdn.jsdelivr.net 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.supabase.co https://api.github.com",
  "frame-src https://giscus.app",
  "font-src 'self' data:",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
].join("; ");

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();

  if (!response.headers.has("X-Frame-Options")) {
    response.headers.set("X-Frame-Options", "DENY");
  }
  if (!response.headers.has("X-Content-Type-Options")) {
    response.headers.set("X-Content-Type-Options", "nosniff");
  }
  if (!response.headers.has("Strict-Transport-Security")) {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  if (!response.headers.has("Referrer-Policy")) {
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  }
  if (!response.headers.has("Permissions-Policy")) {
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  }
  if (!response.headers.has("Content-Security-Policy")) {
    response.headers.set("Content-Security-Policy", csp);
  }

  return response;
});
