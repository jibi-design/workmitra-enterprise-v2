/**
 * Job Mitra | Phase 3 Calling — no-answer fallback job
 * Path: server/jobs/callNoAnswerFallback.job.ts
 *
 * Finds ringing call_sessions older than threshold.
 * If a destination E.164 can be resolved → Twilio masked proxy dial.
 * Else → mark session failed (no-answer, no PII stored on session row).
 *
 * Do NOT auto-start from API listen — invoke via npm script / external cron.
 */

import {
  listRingingOlderThan,
  updateCallSessionStatus,
} from "../modules/calling/callSession.service.js";
import { isTwilioConfigured } from "../modules/calling/calling.env.js";
import { initiatePhoneCallFallback } from "../modules/calling/twilioFallback.service.js";
import type { CallSession } from "../modules/calling/calling.types.js";

export const CALL_NO_ANSWER_DEFAULT_MS = 30_000;

export type CallNoAnswerFallbackResult = {
  ok: true;
  job_name: "call_no_answer_fallback";
  run_at: string;
  older_than_ms: number;
  scanned: number;
  twilio_attempted: number;
  twilio_ok: number;
  marked_failed: number;
  skipped: number;
  dry_run: boolean;
};

export type CallFallbackDestResolver = (
  session: CallSession,
) => Promise<string | null> | string | null;

/**
 * Optional JSON map in env: {"ML-RECEIVER":"+44..."} — server-only, never log values.
 */
export function resolveDestFromEnvMap(receiverMl: string): string | null {
  const raw = process.env.CALL_FALLBACK_DEST_JSON?.trim() ?? "";
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
    const map = parsed as Record<string, unknown>;
    const key = receiverMl.trim().toUpperCase();
    const direct = map[key] ?? map[receiverMl.trim()];
    if (typeof direct !== "string") return null;
    const to = direct.trim();
    return to.startsWith("+") && to.length >= 8 ? to : null;
  } catch {
    return null;
  }
}

function getOlderThanMs(override?: number): number {
  if (typeof override === "number" && Number.isFinite(override) && override >= 5_000) {
    return Math.floor(override);
  }
  const fromEnv = Number(process.env.CALL_NO_ANSWER_MS ?? CALL_NO_ANSWER_DEFAULT_MS);
  if (Number.isFinite(fromEnv) && fromEnv >= 5_000) return Math.floor(fromEnv);
  return CALL_NO_ANSWER_DEFAULT_MS;
}

export async function runCallNoAnswerFallback(options?: {
  olderThanMs?: number;
  dryRun?: boolean;
  resolveDestination?: CallFallbackDestResolver;
}): Promise<CallNoAnswerFallbackResult> {
  const olderThanMs = getOlderThanMs(options?.olderThanMs);
  const dryRun = options?.dryRun === true || process.env.CALL_FALLBACK_DRY_RUN === "true";
  const resolveDestination =
    options?.resolveDestination ??
    ((session: CallSession) => resolveDestFromEnvMap(session.receiverMl));

  const ringing = await listRingingOlderThan(olderThanMs);
  let twilioAttempted = 0;
  let twilioOk = 0;
  let markedFailed = 0;
  let skipped = 0;

  for (const session of ringing) {
    const dest = await resolveDestination(session);
    if (dest && isTwilioConfigured()) {
      twilioAttempted += 1;
      if (dryRun) {
        skipped += 1;
        continue;
      }
      const result = await initiatePhoneCallFallback({
        toE164: dest,
        callSessionId: session.id,
        workspaceId: session.workspaceId,
      });
      if (result.ok) {
        twilioOk += 1;
      } else {
        await updateCallSessionStatus(session.id, "failed");
        markedFailed += 1;
      }
      continue;
    }

    // No destination or Twilio not configured — close as failed no-answer
    if (dryRun) {
      skipped += 1;
      continue;
    }
    await updateCallSessionStatus(session.id, "failed");
    markedFailed += 1;
  }

  return {
    ok: true,
    job_name: "call_no_answer_fallback",
    run_at: new Date().toISOString(),
    older_than_ms: olderThanMs,
    scanned: ringing.length,
    twilio_attempted: twilioAttempted,
    twilio_ok: twilioOk,
    marked_failed: markedFailed,
    skipped,
    dry_run: dryRun,
  };
}
