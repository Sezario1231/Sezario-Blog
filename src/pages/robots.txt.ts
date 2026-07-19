import type { APIRoute } from "astro";

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.origin || "https://your-domain.com";

  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    "Sitemap: " + siteUrl + "/sitemap.xml",
    "",
    "# 禁止抓取 API 路由",
    "Disallow: /api/",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
