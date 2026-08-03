/**
 * Job Mitra | csrf.store.ts
 * HIGH-1 — CSRF tokens in shared store (memory or Upstash via getRateLimitStore).
 * Keys are hashed session fingerprints — raw session cookie never stored as Redis key.
 */

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { getRateLimitStore } from "../../adapters/rateLimitStore.js";
import { SESSION_ABSOLUTE_TTL_SEC } from "./constants.js";

function csrfStoreKey(sessionToken: string): string {
  const fp = createHash("sha256").update(sessionToken).digest("hex").slice(0, 32);
  return `csrf:${fp}`;
}

export async function issueCsrfToken(sessionToken: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const ttlMs = Math.max(60_000, SESSION_ABSOLUTE_TTL_SEC * 1000);
  await getRateLimitStore().setKv(csrfStoreKey(sessionToken), token, ttlMs);
  return token;
}

export async function clearCsrfToken(sessionToken: string): Promise<void> {
  await getRateLimitStore().delKv(csrfStoreKey(sessionToken));
}

export async function validateCsrfToken(
  sessionToken: string,
  headerToken: string | undefined,
): Promise<boolean> {
  if (!sessionToken || !headerToken) return false;
  const expected = await getRateLimitStore().getKv(csrfStoreKey(sessionToken));
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
