/** Job Mitra | plannerCheckIn.ledger.ts | Planner-owned check-in ledger (pairs with Shift adapter) */

export const PLANNER_DAILY_CHECKINS_KEY = "wm_planner_daily_checkins_v1";
export const PLANNER_DAILY_CHECKINS_CHANGED = "wm:planner-daily-checkins-changed";

export type PlannerDailyCheckInRecord = {
  readonly planId: string;
  readonly slotDate: string;
  readonly workerMlId: string;
  readonly checkedInAt: number;
  readonly applicationId?: string;
  readonly workspaceId?: string;
  readonly postId?: string;
};

const UPSERT_ATTEMPTS = 4;

function recordKey(planId: string, slotDate: string, workerMlId: string): string {
  return `${planId}::${slotDate}::${workerMlId}`;
}

function readRaw(): PlannerDailyCheckInRecord[] {
  try {
    const raw = localStorage.getItem(PLANNER_DAILY_CHECKINS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is PlannerDailyCheckInRecord => {
      if (typeof item !== "object" || item === null) return false;
      const rec = item as Record<string, unknown>;
      return (
        typeof rec.planId === "string" &&
        typeof rec.slotDate === "string" &&
        typeof rec.workerMlId === "string" &&
        typeof rec.checkedInAt === "number"
      );
    });
  } catch {
    return [];
  }
}

export function readPlannerCheckIns(): PlannerDailyCheckInRecord[] {
  return readRaw();
}

export function findPlannerCheckIn(
  planId: string,
  slotDate: string,
  workerMlId: string,
): PlannerDailyCheckInRecord | null {
  const key = recordKey(planId, slotDate, workerMlId);
  return readRaw().find((r) => recordKey(r.planId, r.slotDate, r.workerMlId) === key) ?? null;
}

/**
 * P0-5 — merge-by-key with retry so concurrent check-ins do not clobber each other.
 * Last write still wins per worker key; other workers' rows are preserved on collision.
 *
 * Wave-2: these timestamps are device-local only — see clientPunchSync.policy.ts.
 * Do not POST ledger rows as server SoT.
 */
export function upsertPlannerCheckIn(
  record: PlannerDailyCheckInRecord,
): { ok: true } | { ok: false; reason: "storage_error" } {
  const key = recordKey(record.planId, record.slotDate, record.workerMlId);

  for (let attempt = 0; attempt < UPSERT_ATTEMPTS; attempt += 1) {
    const existing = readRaw();
    const byKey = new Map<string, PlannerDailyCheckInRecord>();
    for (const row of existing) {
      byKey.set(recordKey(row.planId, row.slotDate, row.workerMlId), row);
    }
    byKey.set(key, record);
    const next = [...byKey.values()].sort((a, b) => b.checkedInAt - a.checkedInAt).slice(0, 500);

    try {
      localStorage.setItem(PLANNER_DAILY_CHECKINS_KEY, JSON.stringify(next));
      const verified = readRaw().find(
        (r) =>
          recordKey(r.planId, r.slotDate, r.workerMlId) === key &&
          r.checkedInAt === record.checkedInAt,
      );
      if (verified) {
        window.dispatchEvent(new Event(PLANNER_DAILY_CHECKINS_CHANGED));
        return { ok: true };
      }
    } catch {
      return { ok: false, reason: "storage_error" };
    }
  }

  return { ok: false, reason: "storage_error" };
}
