import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { password } = body;

  if (password === import.meta.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }
  return new Response(JSON.stringify({ ok: false }), { status: 401 });
};
