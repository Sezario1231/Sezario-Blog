import type { APIRoute } from "astro";
import { getPosts } from "@/lib/posts";

export const prerender = false;

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const searchData = posts.map((p) => ({
    title: p.title,
    description: p.description,
    slug: p.slug,
    category: p.category,
    tags: p.tags,
    date: p.date.toISOString(),
  }));

  return new Response(JSON.stringify(searchData), {
    headers: { "Content-Type": "application/json" },
  });
};
