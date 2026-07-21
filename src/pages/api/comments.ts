import type { APIRoute } from "astro";
import { addComment, getComments } from "../../lib/db";
import { getVisitorId } from "../../lib/visitor";

export const prerender = false;

const MAX_AUTHOR = 60;
const MAX_BODY = 1000;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

/** Normaliza el texto: recorta, colapsa saltos de línea excesivos y limita. */
function clean(value: unknown, max: number) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

export const GET: APIRoute = async () => {
  try {
    return json({ comments: await getComments(100) });
  } catch (error) {
    console.error("[api/comments] GET", error);
    return json({ error: "No se pudieron cargar los comentarios." }, 500);
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  let payload: Record<string, unknown>;

  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      payload = await request.json();
    } else {
      payload = Object.fromEntries(await request.formData());
    }
  } catch {
    return json({ error: "Petición inválida." }, 400);
  }

  const author = clean(payload.author, MAX_AUTHOR);
  const body = clean(payload.body, MAX_BODY);

  if (author.length < 2) {
    return json({ error: "Escribe tu nombre (mínimo 2 caracteres)." }, 400);
  }
  if (body.length < 3) {
    return json({ error: "Tu comentario es demasiado corto." }, 400);
  }
  // Filtro anti-spam básico: bloquea comentarios llenos de enlaces.
  if ((body.match(/https?:\/\//gi) ?? []).length > 2) {
    return json({ error: "Tu comentario contiene demasiados enlaces." }, 400);
  }

  try {
    const comment = await addComment(author, body, getVisitorId(cookies));
    return json({ comment }, 201);
  } catch (error) {
    console.error("[api/comments] POST", error);
    return json({ error: "No pudimos guardar tu comentario." }, 500);
  }
};
