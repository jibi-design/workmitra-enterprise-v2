// Job Mitra | plannerCommitmentStreak.storage.ts | Section 6.10.3

export type PlannerCommitmentStreakRecord = {
  workerWmId: string;
  planId: string;
  planApplyBatchId: string;
  consecutiveDaysCount: number;
  badgeEarnedAt?: number;
  schemaVersion: 1;
};

const KEY = "wm_planner_commitment_streaks_v1";
const CHANGED = "wm:planner-commitment-streak-changed";

function readAll(): PlannerCommitmentStreakRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PlannerCommitmentStreakRecord[]) : [];
  } catch {
    return [];
  }
}

function writeAll(records: PlannerCommitmentStreakRecord[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent(CHANGED));
  } catch {
    /* safe */
  }
}

export const plannerCommitmentStreakStorage = {
  CHANGED_EVENT: CHANGED,

  subscribe(callback: () => void): () => void {
    const handler = () => callback();
    window.addEventListener(CHANGED, handler);
    return () => window.removeEventListener(CHANGED, handler);
  },

  getAll(): PlannerCommitmentStreakRecord[] {
    return readAll();
  },

  upsert(record: PlannerCommitmentStreakRecord): void {
    const list = readAll();
    const idx = list.findIndex(
      (r) => r.workerWmId === record.workerWmId && r.planApplyBatchId === record.planApplyBatchId,
    );
    if (idx >= 0) list[idx] = record;
    else list.push(record);
    writeAll(list);
  },

  hasStreakForPlan(workerWmId: string, planId: string): boolean {
    return readAll().some(
      (r) => r.workerWmId === workerWmId && r.planId === planId && (r.badgeEarnedAt ?? 0) > 0,
    );
  },

  hasStreakForBatch(workerWmId: string, planApplyBatchId: string): boolean {
    return readAll().some(
      (r) =>
        r.workerWmId === workerWmId &&
        r.planApplyBatchId === planApplyBatchId &&
        (r.badgeEarnedAt ?? 0) > 0,
    );
  },
};
