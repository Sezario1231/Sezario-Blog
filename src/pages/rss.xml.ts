import type { APIRoute } from "astro";
import { getPosts } from "@/lib/posts";

export const prerender = false;

export const GET: APIRoute = async ({ site }) => {
  const posts = await getPosts();

  if (!site) {
    return new Response("Site URL not configured", { status: 500 });
  }

  const siteUrl = site.origin;
  const items = posts
    .map(
      (post) => `
  <item>
    <guid isPermaLink="true">${siteUrl}/posts/${post.slug}</guid>
    <title>${escapeXml(post.title)}</title>
    <description>${escapeXml(post.description)}</description>
    <link>${siteUrl}/posts/${post.slug}</link>
    <pubDate>${post.date.toUTCString()}</pubDate>
    <category>${escapeXml(post.category)}</category>
  </item>`
    )
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Sezario的个人小屋</title>
    <description>尝试了解AI｜喜欢折腾｜记录学习日常</description>
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
