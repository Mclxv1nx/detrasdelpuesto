import type { APIRoute } from "astro";
import { recordVisit } from "../../lib/db";
import { getVisitorId } from "../../lib/visitor";

export const prerender = false;

/**
 * Registro manual de visitas. La página principal ya registra la visita
 * durante el render SSR; este endpoint sirve para páginas adicionales o
 * navegaciones del lado del cliente.
 */
export const POST: APIRoute = async ({ request, cookies, url }) => {
  try {
    let path = url.searchParams.get("path") ?? "/";
    try {
      const body = (await request.json()) as { path?: string };
      if (body?.path) path = body.path;
    } catch {
      /* cuerpo vacío: se usa el valor por defecto */
    }

    await recordVisit(
      getVisitorId(cookies),
      path.slice(0, 200),
      request.headers.get("referer"),
    );
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[api/visit] POST", error);
    return new Response(null, { status: 500 });
  }
};
