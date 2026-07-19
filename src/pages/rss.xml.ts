import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const posts = await getCollection("posts", ({ data }) => !data.draft);

  if (!site) {
    return new Response("Site URL not configured", { status: 500 });
  }

  const siteUrl = site.origin;
  const items = posts
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .map(
      (post) => `
  <item>
    <guid isPermaLink="true">${siteUrl}/posts/${post.slug}</guid>
    <title>${escapeXml(post.data.title)}</title>
    <description>${escapeXml(post.data.description)}</description>
    <link>${siteUrl}/posts/${post.slug}</link>
    <pubDate>${post.data.date.toUTCString()}</pubDate>
    <category>${escapeXml(post.data.category)}</category>
  </item>`
    )
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Sezario. Blog</title>
    <description>关于技术、设计与开发的个人博客</description>
    <link>${siteUrl}</link>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
