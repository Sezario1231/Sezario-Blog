import { getSupabase } from "./supabase";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: Date;
  category: string;
  tags: string[];
  coverImage?: string;
  draft: boolean;
  body: string;
  password?: string;
}

interface SupabasePost {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string | string[];
  cover_image?: string;
  draft: boolean;
  body: string;
  password?: string;
  created_at: string;
}

function mapPost(row: SupabasePost): BlogPost {
  let tags: string[];
  if (Array.isArray(row.tags)) {
    tags = row.tags;
  } else if (typeof row.tags === "string") {
    try {
      tags = JSON.parse(row.tags);
    } catch {
      tags = row.tags ? [row.tags] : [];
    }
  } else {
    tags = [];
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    date: new Date(row.created_at),
    category: row.category,
    tags,
    coverImage: row.cover_image || undefined,
    draft: row.draft,
    body: row.body,
    password: row.password || undefined,
  };
}

export async function getPosts(options?: { includeDrafts?: boolean }): Promise<BlogPost[]> {
  const supabase = getSupabase();
  let query = supabase.from("posts").select("*").order("created_at", { ascending: false });
  if (!options?.includeDrafts) {
    query = query.eq("draft", false);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapPost);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("posts").select("*").eq("slug", slug).single();
  if (error || !data) return null;
  return mapPost(data);
}

export async function getPostCount(): Promise<number> {
  const supabase = getSupabase();
  const { count } = await supabase.from("posts").select("*", { count: "exact", head: true });
  return count || 0;
}

export async function getDraftCount(): Promise<number> {
  const supabase = getSupabase();
  const { count } = await supabase.from("posts").select("*", { count: "exact", head: true }).eq("draft", true);
  return count || 0;
}

export async function getProjectCount(): Promise<number> {
  const supabase = getSupabase();
  const { count } = await supabase.from("projects").select("*", { count: "exact", head: true });
  return count || 0;
}

export async function getQuoteCount(): Promise<number> {
  const supabase = getSupabase();
  const { count } = await supabase.from("quotes").select("*", { count: "exact", head: true });
  return count || 0;
}
