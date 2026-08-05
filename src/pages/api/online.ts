import type { APIRoute } from "astro";
import { getSupabase } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";

export const prerender = false;

const STALE_THRESHOLD_MS = 90_000;
const RATE_LIMIT_COUNT = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

export const POST: APIRoute = async ({ request, clientAddress, locals }) => {
  const ip = request.headers.get("cf-connecting-ip") || clientAddress || "unknown";
  if (await checkRateLimit(locals, "online", ip, RATE_LIMIT_COUNT, RATE_LIMIT_WINDOW_MS)) {
    return new Response(JSON.stringify({ error: "too many requests" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json().catch(() => null);
  if (!body?.session_id) {
    return new Response(JSON.stringify({ error: "session_id required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = getSupabase();

  const { error: upsertError } = await supabase
    .from("visitor_sessions")
    .upsert(
      { session_id: body.session_id, last_seen: new Date().toISOString() },
      { onConflict: "session_id" }
    );

  if (upsertError) {
    console.error("[online] upsert error:", upsertError.message);
    return new Response(JSON.stringify({ error: "db error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const cutoff = new Date(Date.now() - STALE_THRESHOLD_MS).toISOString();
  await supabase
    .from("visitor_sessions")
    .delete()
    .lt("last_seen", cutoff);

  const { count } = await supabase
    .from("visitor_sessions")
    .select("*", { count: "exact", head: true });

  return new Response(JSON.stringify({ count: count ?? 0 }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
