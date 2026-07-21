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

export function upsertPlannerCheckIn(
  record: PlannerDailyCheckInRecord,
): { ok: true } | { ok: false; reason: "storage_error" } {
  const key = recordKey(record.planId, record.slotDate, record.workerMlId);
  const existing = readRaw().filter((r) => recordKey(r.planId, r.slotDate, r.workerMlId) !== key);
  const next = [record, ...existing].slice(0, 500);
  try {
    localStorage.setItem(PLANNER_DAILY_CHECKINS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(PLANNER_DAILY_CHECKINS_CHANGED));
    return { ok: true };
  } catch {
    return { ok: false, reason: "storage_error" };
  }
}
