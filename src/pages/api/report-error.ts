import type { APIRoute } from "astro";
import { getSupabase } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";

export const prerender = false;

const MSG_MAX = 500;
const STACK_MAX = 4000;
const PAGE_MAX = 300;

interface ReportBody {
  page?: unknown;
  message?: unknown;
  stack?: unknown;
}

export const POST: APIRoute = async ({ request, clientAddress, locals }) => {
  const ip = clientAddress || "unknown";

  const limited = await checkRateLimit(locals, "report-error", ip, 10, 10 * 60 * 1000);
  if (limited) {
    return new Response(JSON.stringify({ ok: false }), { status: 429 });
  }

  let body: ReportBody;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 400 });
  }

  const page = typeof body.page === "string" ? body.page.slice(0, PAGE_MAX) : "";
  const message = typeof body.message === "string" ? body.message.slice(0, MSG_MAX) : "";
  const stack = typeof body.stack === "string" ? body.stack.slice(0, STACK_MAX) : "";

  if (!message) {
    return new Response(JSON.stringify({ ok: false }), { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("frontend_errors")
      .insert({ page, message, stack });

    if (error) {
      console.error("[report-error] insert error:", error.message);
      return new Response(JSON.stringify({ ok: false }), { status: 500 });
    }
  } catch (err) {
    console.error("[report-error] unexpected error:", err);
    return new Response(JSON.stringify({ ok: false }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
