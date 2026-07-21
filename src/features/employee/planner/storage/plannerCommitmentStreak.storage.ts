// Job Mitra | plannerCommitmentStreak.storage.ts | Section 6.10.3

export type PlannerCommitmentStreakRecord = {
  workerMlId: string;
  planId: string;
  planApplyBatchId: string;
  consecutiveDaysCount: number;
  badgeEarnedAt?: number;
  schemaVersion: 1;
};

const KEY = "wm_planner_commitment_streaks_v1";
const CHANGED = "wm:planner-commitment-streak-changed";

function normalizeStreak(raw: unknown): PlannerCommitmentStreakRecord | null {
  if (typeof raw !== "object" || raw === null) return null;
  const rec = raw as Record<string, unknown>;
  // Dual-read: prefer workerMlId; accept legacy workerWmId from older localStorage JSON.
  const workerMlId =
    typeof rec.workerMlId === "string"
      ? rec.workerMlId
      : typeof rec.workerWmId === "string"
        ? rec.workerWmId
        : "";
  if (!workerMlId) return null;
  return { ...(raw as PlannerCommitmentStreakRecord), workerMlId };
}

function readAll(): PlannerCommitmentStreakRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeStreak)
      .filter((r): r is PlannerCommitmentStreakRecord => r !== null);
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
      (r) => r.workerMlId === record.workerMlId && r.planApplyBatchId === record.planApplyBatchId,
    );
    if (idx >= 0) list[idx] = record;
    else list.push(record);
    writeAll(list);
  },

  hasStreakForPlan(workerMlId: string, planId: string): boolean {
    return readAll().some(
      (r) => r.workerMlId === workerMlId && r.planId === planId && (r.badgeEarnedAt ?? 0) > 0,
    );
  },

  hasStreakForBatch(workerMlId: string, planApplyBatchId: string): boolean {
    return readAll().some(
      (r) =>
        r.workerMlId === workerMlId &&
        r.planApplyBatchId === planApplyBatchId &&
        (r.badgeEarnedAt ?? 0) > 0,
    );
  },
};
