// Jednoduchá sdílená autentizace přes PIN (rodinné použití, žádné účty).
// Session cookie obsahuje SHA-256 otisk PIN+secret, nikdy samotný PIN.
export const SESSION_COOKIE = "recipe_session";

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function computeSessionToken(pin: string, secret: string): Promise<string> {
  const data = new TextEncoder().encode(`${pin}:${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(digest);
}

export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const pin = process.env.APP_PIN;
  const secret = process.env.SESSION_SECRET;
  if (!pin || !secret) return false;
  const expected = await computeSessionToken(pin, secret);
  return token === expected;
}
