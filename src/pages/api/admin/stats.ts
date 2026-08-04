import type { APIRoute } from "astro";
import { getSupabase } from "@/lib/supabase";
import { verifyAdminRequest, unauthorized, json } from "@/lib/admin-auth";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  if (!verifyAdminRequest(request)) return unauthorized();

  const supabase = getSupabase();

  const { count: posts } = await supabase.from("posts").select("*", { count: "exact", head: true }).eq("draft", false);
  const { count: drafts } = await supabase.from("posts").select("*", { count: "exact", head: true }).eq("draft", true);
  const { count: projects } = await supabase.from("projects").select("*", { count: "exact", head: true });
  const { count: quotes } = await supabase.from("quotes").select("*", { count: "exact", head: true });
  const { count: contacts } = await supabase.from("contact_messages").select("*", { count: "exact", head: true });
  const { count: comments } = await supabase.from("comments").select("*", { count: "exact", head: true });
  const { count: visitors } = await supabase.from("visitor_sessions").select("*", { count: "exact", head: true });

  const { data: recentPosts } = await supabase
    .from("posts").select("id, title, slug, created_at, draft")
    .order("created_at", { ascending: false }).limit(5);

  const { data: recentComments } = await supabase
    .from("comments").select("id, author, content, post_slug, created_at")
    .order("created_at", { ascending: false }).limit(5);

  return json({
    posts: posts ?? 0,
    drafts: drafts ?? 0,
    projects: projects ?? 0,
    quotes: quotes ?? 0,
    contacts: contacts ?? 0,
    unreadContacts: 0,
    comments: comments ?? 0,
    onlineVisitors: visitors ?? 0,
    recentPosts: recentPosts || [],
    recentComments: recentComments || [],
  });
};
