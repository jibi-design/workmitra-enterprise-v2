/** Durable shift retry queue — replayable ops only; non-replayable → dead letter (Wave-2) */

const KEY = "wm_retry_queue_v1";
const DEAD_LETTER_KEY = "wm_retry_queue_dead_letter_v1";
const MAX_ITEMS = 200;
const MAX_DEAD_LETTER = 100;

export type ShiftRetryOp =
  | "notify_cross_role"
  | "plan_enroll"
  | "plan_unenroll"
  | "workspace_broadcast"
  | "rating_points"
  | "post_complete_side_effect"
  | "direct_invite_side_effect"
  | "availability_sync"
  | "favorites_sync"
  /** Planner cancel — pending-app / confirmed-worker notification fan-out */
  | "planner_cancel_notify"
  /** Planner cancel — mark confirmed workspace cancelled */
  | "planner_workspace_cancel"
  /** Planner crew BCC broadcast delivery */
  | "planner_crew_broadcast"
  /** P1-FIX-4 — Shift Ops site_memberships auto provision */
  | "site_membership_provision";

/**
 * Ops with enough context for a real drain replay.
 * Everything else is audited to the dead-letter store (never soft-acked as success).
 */
export const SHIFT_RETRY_REPLAYABLE_OPS: ReadonlySet<ShiftRetryOp> = new Set([
  "site_membership_provision",
  "rating_points",
  "plan_enroll",
  "planner_workspace_cancel",
  "planner_cancel_notify",
  "planner_crew_broadcast",
]);

export type ShiftRetryQueueItem = {
  id: string;
  op: ShiftRetryOp;
  context: Record<string, string>;
  createdAt: number;
  attempts: number;
  lastError?: string;
};

export type ShiftRetryDeadLetterItem = ShiftRetryQueueItem & {
  abandonedAt: number;
  abandonReason: string;
};

export type ShiftRetryDrainHandler = (
  item: ShiftRetryQueueItem,
) => Promise<{ ok: true } | { ok: false; error: string }>;

function readAll(): ShiftRetryQueueItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ShiftRetryQueueItem[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: ShiftRetryQueueItem[]): void {
  localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
}

function readDeadLetter(): ShiftRetryDeadLetterItem[] {
  try {
    const raw = localStorage.getItem(DEAD_LETTER_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ShiftRetryDeadLetterItem[]) : [];
  } catch {
    return [];
  }
}

function writeDeadLetter(items: ShiftRetryDeadLetterItem[]): void {
  try {
    localStorage.setItem(DEAD_LETTER_KEY, JSON.stringify(items.slice(0, MAX_DEAD_LETTER)));
  } catch {
    /* demo-safe */
  }
}

export function isShiftRetryOpReplayable(op: ShiftRetryOp): boolean {
  return SHIFT_RETRY_REPLAYABLE_OPS.has(op);
}

export function appendShiftRetryDeadLetter(item: ShiftRetryQueueItem, abandonReason: string): void {
  const entry: ShiftRetryDeadLetterItem = {
    ...item,
    abandonedAt: Date.now(),
    abandonReason,
  };
  writeDeadLetter([entry, ...readDeadLetter()].slice(0, MAX_DEAD_LETTER));
}

/**
 * Enqueue for heal/drain. Non-replayable ops go to dead letter only
 * (no false "zero-loss" claim on soft side-effects).
 */
export function enqueueShiftRetry(
  op: ShiftRetryOp,
  context: Record<string, string> = {},
  lastError?: string,
): void {
  const item: ShiftRetryQueueItem = {
    id: `retry_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`,
    op,
    context,
    createdAt: Date.now(),
    attempts: 0,
    lastError,
  };

  try {
    if (!isShiftRetryOpReplayable(op)) {
      appendShiftRetryDeadLetter(
        item,
        lastError ? `non_replayable:${lastError}` : "non_replayable_op",
      );
      return;
    }
    writeAll([item, ...readAll()]);
  } catch {
    // Fail-silent: queue must never break primary saga success path.
  }
}

export function peekShiftRetryQueue(): readonly ShiftRetryQueueItem[] {
  return readAll();
}

export function peekShiftRetryDeadLetter(): readonly ShiftRetryDeadLetterItem[] {
  return readDeadLetter();
}

export function clearShiftRetryQueue(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function clearShiftRetryDeadLetter(): void {
  try {
    localStorage.removeItem(DEAD_LETTER_KEY);
  } catch {
    // ignore
  }
}

export const SHIFT_RETRY_QUEUE_KEY = KEY;
export const SHIFT_RETRY_DEAD_LETTER_KEY = DEAD_LETTER_KEY;

/**
 * Auto-drain queue after connectivity heals.
 * Successful items are removed; failures stay with incremented attempts.
 * Exhausted / non-replayable items move to dead letter (counted as `lost`).
 */
export async function drainShiftRetryQueue(
  handler: ShiftRetryDrainHandler,
): Promise<{ drained: number; remaining: number; lost: number }> {
  const pending = readAll();
  if (pending.length === 0) return { drained: 0, remaining: 0, lost: 0 };

  const remaining: ShiftRetryQueueItem[] = [];
  let drained = 0;
  let lost = 0;

  for (const item of pending) {
    if (!isShiftRetryOpReplayable(item.op)) {
      appendShiftRetryDeadLetter(item, "non_replayable_on_drain");
      lost += 1;
      continue;
    }

    try {
      const result = await handler(item);
      if (result.ok) {
        drained += 1;
        continue;
      }
      const nextAttempts = item.attempts + 1;
      if (nextAttempts >= 8) {
        appendShiftRetryDeadLetter(
          { ...item, attempts: nextAttempts, lastError: result.error },
          "max_attempts",
        );
        lost += 1;
        continue;
      }
      remaining.push({ ...item, attempts: nextAttempts, lastError: result.error });
    } catch (error) {
      const nextAttempts = item.attempts + 1;
      const lastError = error instanceof Error ? error.message : "drain_error";
      if (nextAttempts >= 8) {
        appendShiftRetryDeadLetter({ ...item, attempts: nextAttempts, lastError }, "max_attempts");
        lost += 1;
        continue;
      }
      remaining.push({
        ...item,
        attempts: nextAttempts,
        lastError,
      });
    }
  }

  writeAll(remaining);
  return { drained, remaining: remaining.length, lost };
}
