/**
 * Job Mitra | csrf.store.ts
 * HIGH-01 — CSRF tokens in shared store (memory or Upstash via getRateLimitStore).
 * Keys are hashed session fingerprints — raw session cookie never stored as Redis key.
 * Store errors fail closed (validate → false; issue → throw).
 *
 * Grace after process restart (single-node memory): double-submit cookie match in
 * middleware/csrf.ts still accepts wm_csrf === X-CSRF-Token when the session-bound
 * store entry is gone.
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
  try {
    await getRateLimitStore().setKv(csrfStoreKey(sessionToken), token, ttlMs);
  } catch (err) {
    console.error(
      "[Job Mitra API] CSRF store issue failed (fail-closed):",
      err instanceof Error ? err.message : "unknown",
    );
    throw new Error("CSRF_STORE_UNAVAILABLE");
  }
  return token;
}

export async function clearCsrfToken(sessionToken: string): Promise<void> {
  try {
    await getRateLimitStore().delKv(csrfStoreKey(sessionToken));
  } catch (err) {
    console.error(
      "[Job Mitra API] CSRF store clear failed:",
      err instanceof Error ? err.message : "unknown",
    );
  }
}

export async function validateCsrfToken(
  sessionToken: string,
  headerToken: string | undefined,
): Promise<boolean> {
  if (!sessionToken || !headerToken) return false;
  let expected: string | null;
  try {
    expected = await getRateLimitStore().getKv(csrfStoreKey(sessionToken));
  } catch (err) {
    console.error(
      "[Job Mitra API] CSRF store validate failed (fail-closed):",
      err instanceof Error ? err.message : "unknown",
    );
    return false;
  }
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
