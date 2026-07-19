import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const prerender = true;

export const GET: APIRoute = async () => {
  const allPosts = await getCollection("posts");
  const posts = allPosts
    .filter((p) => !p.data.draft)
    .map((p) => ({
      title: p.data.title,
      description: p.data.description,
      slug: p.slug,
      category: p.data.category,
      tags: p.data.tags,
      date: p.data.date.toISOString(),
    }));

  return new Response(JSON.stringify(posts), {
    headers: { "Content-Type": "application/json" },
  });
};
