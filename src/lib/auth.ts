import type { AstroCookies } from "astro";

export const ADMIN_COOKIE = "ddp_admin";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 horas

function getPassword(): string | null {
  const value = import.meta.env.DASHBOARD_PASSWORD;
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** Token derivado de la contraseña; no guardamos la contraseña en la cookie. */
async function sessionToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`ddp::${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Comparación en tiempo constante para evitar filtrar información por timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function isPasswordConfigured(): boolean {
  return getPassword() !== null;
}

export async function isAuthenticated(cookies: AstroCookies): Promise<boolean> {
  const password = getPassword();
  if (!password) return false;

  const token = cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return false;

  return safeEqual(token, await sessionToken(password));
}

/** Valida la contraseña recibida y, si es correcta, abre la sesión. */
export async function login(
  cookies: AstroCookies,
  attempt: string,
): Promise<boolean> {
  const password = getPassword();
  if (!password || !safeEqual(attempt, password)) return false;

  cookies.set(ADMIN_COOKIE, await sessionToken(password), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: import.meta.env.PROD,
    maxAge: SESSION_MAX_AGE,
  });
  return true;
}

export function logout(cookies: AstroCookies): void {
  cookies.delete(ADMIN_COOKIE, { path: "/" });
}
