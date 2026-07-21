import type { AstroCookies } from "astro";

export const VISITOR_COOKIE = "ddp_vid";
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Devuelve el identificador anónimo del visitante, creándolo si no existe.
 * No contiene datos personales: sólo un UUID aleatorio para no contar
 * dos veces el mismo like y para medir visitantes únicos.
 */
export function getVisitorId(cookies: AstroCookies): string {
  const existing = cookies.get(VISITOR_COOKIE)?.value;
  if (existing) return existing;

  const id = crypto.randomUUID();
  cookies.set(VISITOR_COOKIE, id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: import.meta.env.PROD,
    maxAge: ONE_YEAR,
  });
  return id;
}
