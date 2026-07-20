// App name: Job Mitra
// File name: employeeCareerRecentlyViewedJobs.storage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\storage\employeeCareerRecentlyViewedJobs.storage.ts

import {
  EMPLOYEE_CAREER_RECENT_JOBS_CHANGED,
  EMPLOYEE_CAREER_RECENT_JOBS_KEY,
  notifyEmployeeCareerRecentJobsChanged,
  safeRead,
  safeWrite,
} from "../../../employer/careerJobs/helpers/careerStorageUtils";

const MAX_RECENT_JOBS = 3;
const MAX_POST_ID_LENGTH = 120;

export type EmployeeCareerRecentJobRecord = {
  postId: string;
  viewedAt: number;
};

function normalizePostId(value: string): string | null {
  const cleanId = value.trim();

  if (!cleanId || cleanId.length > MAX_POST_ID_LENGTH) return null;

  return cleanId;
}

function normalizeTimestamp(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
}

function normalizeRecords(
  records: EmployeeCareerRecentJobRecord[],
): EmployeeCareerRecentJobRecord[] {
  const byPostId = new Map<string, EmployeeCareerRecentJobRecord>();

  for (const record of records) {
    const postId = normalizePostId(record.postId);
    if (!postId) continue;

    const existing = byPostId.get(postId);
    const viewedAt = normalizeTimestamp(record.viewedAt);

    if (!existing || viewedAt > existing.viewedAt) {
      byPostId.set(postId, { postId, viewedAt });
    }
  }

  return Array.from(byPostId.values())
    .sort((a, b) => b.viewedAt - a.viewedAt)
    .slice(0, MAX_RECENT_JOBS);
}

function parseRecentJobs(raw: string | null): EmployeeCareerRecentJobRecord[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    const records = parsed
      .filter(
        (item): item is Record<string, unknown> =>
          typeof item === "object" && item !== null && !Array.isArray(item),
      )
      .map((item) => {
        const postId = typeof item.postId === "string" ? item.postId : "";
        const viewedAt = normalizeTimestamp(item.viewedAt);

        return {
          postId,
          viewedAt,
        };
      });

    return normalizeRecords(records);
  } catch {
    return [];
  }
}

function getAll(): EmployeeCareerRecentJobRecord[] {
  return parseRecentJobs(safeRead(EMPLOYEE_CAREER_RECENT_JOBS_KEY));
}

function writeAll(records: EmployeeCareerRecentJobRecord[]): void {
  safeWrite(EMPLOYEE_CAREER_RECENT_JOBS_KEY, normalizeRecords(records));
  notifyEmployeeCareerRecentJobsChanged();
}

function markViewed(postId: string): void {
  const cleanId = normalizePostId(postId);
  if (!cleanId) return;

  writeAll([{ postId: cleanId, viewedAt: Date.now() }, ...getAll()]);
}

function getIds(): string[] {
  return getAll().map((item) => item.postId);
}

function getSnapshotKey(): string {
  return safeRead(EMPLOYEE_CAREER_RECENT_JOBS_KEY) ?? "";
}

function subscribe(cb: () => void): () => void {
  const handler = () => cb();
  const events = ["storage", "focus", EMPLOYEE_CAREER_RECENT_JOBS_CHANGED];

  for (const eventName of events) {
    window.addEventListener(eventName, handler);
  }

  document.addEventListener("visibilitychange", handler);

  return () => {
    for (const eventName of events) {
      window.removeEventListener(eventName, handler);
    }

    document.removeEventListener("visibilitychange", handler);
  };
}

export const employeeCareerRecentlyViewedJobsStorage = {
  getAll,
  getIds,
  markViewed,
  getSnapshotKey,
  subscribe,
};
