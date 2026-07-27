/** Durable shift retry queue — capture, peek, drain (zero-loss heal path) */

const KEY = "wm_retry_queue_v1";
const MAX_ITEMS = 200;

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

export type ShiftRetryQueueItem = {
  id: string;
  op: ShiftRetryOp;
  context: Record<string, string>;
  createdAt: number;
  attempts: number;
  lastError?: string;
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
    writeAll([item, ...readAll()]);
  } catch {
    // Fail-silent: queue must never break primary saga success path.
  }
}

export function peekShiftRetryQueue(): readonly ShiftRetryQueueItem[] {
  return readAll();
}

export function clearShiftRetryQueue(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

/**
 * Auto-drain queue after connectivity heals.
 * Successful items are removed; failures stay with incremented attempts.
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
    try {
      const result = await handler(item);
      if (result.ok) {
        drained += 1;
        continue;
      }
      const nextAttempts = item.attempts + 1;
      if (nextAttempts >= 8) {
        lost += 1;
        continue;
      }
      remaining.push({ ...item, attempts: nextAttempts, lastError: result.error });
    } catch (error) {
      const nextAttempts = item.attempts + 1;
      if (nextAttempts >= 8) {
        lost += 1;
        continue;
      }
      remaining.push({
        ...item,
        attempts: nextAttempts,
        lastError: error instanceof Error ? error.message : "drain_error",
      });
    }
  }

  writeAll(remaining);
  return { drained, remaining: remaining.length, lost };
}
