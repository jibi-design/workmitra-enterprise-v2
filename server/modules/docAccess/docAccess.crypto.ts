/**
 * Doc Access session HMAC (server) — mirrors client docAccessSessionCrypto.
 * Pepper: DOC_ACCESS_SESSION_PEPPER || VITE_DOC_ACCESS_SESSION_PEPPER || default.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_PEPPER = "wm_doc_access_session_v1_pepper_enterprise";

export type DocAccessSessionSignPayload = {
  id: string;
  employerScopeId: string;
  workerMlId: string;
  domain: "shift" | "career";
  startedAt: number;
  expiresAt: number;
  challengeHash: string;
  /** Auth UUID bound into HMAC when AUTH backend is on (STEP 2 ACL). */
  authUserId?: string;
};

function sessionPepper(): string {
  const fromEnv =
    process.env.DOC_ACCESS_SESSION_PEPPER?.trim() ||
    process.env.VITE_DOC_ACCESS_SESSION_PEPPER?.trim();
  return fromEnv || DEFAULT_PEPPER;
}

export function canonicalizeDocAccessSessionPayload(payload: DocAccessSessionSignPayload): string {
  const base = [
    payload.id,
    payload.employerScopeId,
    payload.workerMlId,
    payload.domain,
    String(payload.startedAt),
    String(payload.expiresAt),
    payload.challengeHash,
  ].join("|");
  const authUserId = payload.authUserId?.trim();
  return authUserId ? `${base}|${authUserId}` : base;
}

export function signDocAccessSession(payload: DocAccessSessionSignPayload): string {
  const keyMaterial = `${sessionPepper()}|${payload.challengeHash}`;
  return createHmac("sha256", keyMaterial)
    .update(canonicalizeDocAccessSessionPayload(payload))
    .digest("hex");
}

export function verifyDocAccessSessionSignature(
  payload: DocAccessSessionSignPayload,
  signature: string,
): boolean {
  if (!signature.trim() || !payload.challengeHash.trim()) return false;
  const expected = signDocAccessSession(payload);
  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(signature, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
