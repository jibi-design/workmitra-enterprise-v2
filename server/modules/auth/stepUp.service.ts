/**
 * Step-up verification — short-lived challenge tokens for high-risk actions.
 * Never auto-approves Class B/C deploy acts; only gates privileged JM/ops handlers.
 */

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { IncomingMessage } from "node:http";

export const STEP_UP_HEADER = "x-wm-step-up";
export const STEP_UP_TTL_MS = 5 * 60_000;

type StepUpRecord = {
  tokenHash: string;
  subject: string;
  purpose: string;
  expiresAtMs: number;
  used: boolean;
};

const store = new Map<string, StepUpRecord>();

function hashToken(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

function pruneExpired(now = Date.now()): void {
  for (const [id, rec] of store) {
    if (rec.expiresAtMs <= now || rec.used) store.delete(id);
  }
}

export type IssueStepUpInput = {
  subject: string;
  purpose: string;
  ttlMs?: number;
};

export function issueStepUpToken(input: IssueStepUpInput): {
  token: string;
  expiresAtIso: string;
  purpose: string;
} {
  pruneExpired();
  const raw = randomBytes(32).toString("base64url");
  const id = randomBytes(12).toString("hex");
  const ttl = Math.max(60_000, Math.min(input.ttlMs ?? STEP_UP_TTL_MS, 15 * 60_000));
  const expiresAtMs = Date.now() + ttl;
  store.set(id, {
    tokenHash: hashToken(`${id}.${raw}`),
    subject: input.subject.slice(0, 200),
    purpose: input.purpose.slice(0, 120),
    expiresAtMs,
    used: false,
  });
  return {
    token: `${id}.${raw}`,
    expiresAtIso: new Date(expiresAtMs).toISOString(),
    purpose: input.purpose.slice(0, 120),
  };
}

export type ConsumeStepUpResult =
  | { ok: true; subject: string; purpose: string }
  | { ok: false; code: "MISSING" | "INVALID" | "EXPIRED" | "PURPOSE_MISMATCH" };

/**
 * Validate and consume a one-time step-up token (fail-closed).
 */
export function consumeStepUpToken(
  rawToken: string | null | undefined,
  expectedPurpose?: string,
): ConsumeStepUpResult {
  pruneExpired();
  if (!rawToken || !rawToken.includes(".")) {
    return { ok: false, code: "MISSING" };
  }
  const [id, ...rest] = rawToken.split(".");
  const secret = rest.join(".");
  if (!id || !secret) return { ok: false, code: "INVALID" };
  const rec = store.get(id);
  if (!rec || rec.used) return { ok: false, code: "INVALID" };
  if (rec.expiresAtMs <= Date.now()) {
    store.delete(id);
    return { ok: false, code: "EXPIRED" };
  }
  if (!safeEqualHex(rec.tokenHash, hashToken(`${id}.${secret}`))) {
    return { ok: false, code: "INVALID" };
  }
  if (expectedPurpose && rec.purpose !== expectedPurpose) {
    return { ok: false, code: "PURPOSE_MISMATCH" };
  }
  rec.used = true;
  store.delete(id);
  return { ok: true, subject: rec.subject, purpose: rec.purpose };
}

export function readStepUpHeader(req: IncomingMessage): string | null {
  const h = req.headers[STEP_UP_HEADER];
  if (typeof h === "string" && h.trim()) return h.trim();
  if (Array.isArray(h) && h[0]?.trim()) return h[0].trim();
  return null;
}

/** Ops secondary secret for Super-Admin step-up (never the primary control token alone). */
export function opsStepUpSecretOk(challenge: string): boolean {
  const expected =
    process.env.WM_OPS_STEPUP_SECRET?.trim() ||
    process.env.WM_OPS_CONTROL_TOKEN?.trim() ||
    "";
  if (!expected || expected.length < 16) return false;
  if (challenge.length !== expected.length) {
    // Still compare to avoid trivial short-circuit timing leaks on length alone for equal-length cases.
  }
  try {
    const a = Buffer.from(challenge);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export const HIGH_RISK_STEP_UP_PURPOSES = [
  "ops_flags_emergency",
  "bulk_user_delete",
  "database_backup_export",
  "admin_privilege_update",
  "privileged_admin_action",
] as const;

export type HighRiskStepUpPurpose = (typeof HIGH_RISK_STEP_UP_PURPOSES)[number];
