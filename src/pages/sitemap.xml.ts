import type { APIRoute } from "astro";
import { getPosts } from "@/lib/posts";

export const prerender = false;

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.origin || "https://your-domain.com";
  const posts = await getPosts();

  const staticPages = [
    { loc: "", priority: "1.0", changefreq: "daily" },
    { loc: "posts", priority: "0.9", changefreq: "daily" },
    { loc: "projects", priority: "0.8", changefreq: "weekly" },
    { loc: "archive", priority: "0.7", changefreq: "weekly" },
    { loc: "about", priority: "0.6", changefreq: "monthly" },
    { loc: "contact", priority: "0.5", changefreq: "monthly" },
  ];

  const postUrls = posts.map(
    (post) => `  <url>
    <loc>${siteUrl}/posts/${post.slug}</loc>
    <lastmod>${post.date.toISOString()}</lastmod>
    <priority>0.7</priority>
  </url>`
  );

  const staticUrls = staticPages.map(
    (p) => `  <url>
    <loc>${siteUrl}/${p.loc}</loc>
    <priority>${p.priority}</priority>
    <changefreq>${p.changefreq}</changefreq>
  </url>`
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.join("\n")}
${postUrls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
