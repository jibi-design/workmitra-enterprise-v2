/** Job Mitra | csrf.store.ts | In-memory CSRF tokens keyed by session cookie value */

import { randomBytes, timingSafeEqual } from "node:crypto";

const csrfBySessionToken = new Map<string, string>();

export function issueCsrfToken(sessionToken: string): string {
  const token = randomBytes(32).toString("hex");
  csrfBySessionToken.set(sessionToken, token);
  return token;
}

export function clearCsrfToken(sessionToken: string): void {
  csrfBySessionToken.delete(sessionToken);
}

export function validateCsrfToken(sessionToken: string, headerToken: string | undefined): boolean {
  if (!sessionToken || !headerToken) return false;
  const expected = csrfBySessionToken.get(sessionToken);
  if (!expected) return false;
  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(headerToken, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
