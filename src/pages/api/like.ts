import type { APIRoute } from "astro";
import { getLikeState, toggleLike } from "../../lib/db";
import { getVisitorId } from "../../lib/visitor";

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export const GET: APIRoute = async ({ cookies }) => {
  try {
    return json(await getLikeState(getVisitorId(cookies)));
  } catch (error) {
    console.error("[api/like] GET", error);
    return json({ error: "No se pudo consultar los likes." }, 500);
  }
};

export const POST: APIRoute = async ({ cookies }) => {
  try {
    return json(await toggleLike(getVisitorId(cookies)));
  } catch (error) {
    console.error("[api/like] POST", error);
    return json({ error: "No se pudo registrar tu like." }, 500);
  }
};
