// App name: Job Mitra
// File name: employeeCareerSavedJobs.storage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\storage\employeeCareerSavedJobs.storage.ts

import {
  EMPLOYEE_CAREER_SAVED_JOBS_CHANGED,
  EMPLOYEE_CAREER_SAVED_JOBS_KEY,
  notifyEmployeeCareerSavedJobsChanged,
  safeRead,
  safeWrite,
} from "../../../career/helpers/careerStoragePublic";

export type EmployeeCareerSavedJobRecord = {
  postId: string;
  savedAt: number;
};

const MAX_SAVED_JOBS = 50;
const MAX_POST_ID_LENGTH = 120;

function normalizePostId(value: string): string | null {
  const cleanId = value.trim();

  if (!cleanId || cleanId.length > MAX_POST_ID_LENGTH) return null;

  return cleanId;
}

function normalizeTimestamp(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
}

function normalizeRecords(records: EmployeeCareerSavedJobRecord[]): EmployeeCareerSavedJobRecord[] {
  const byPostId = new Map<string, EmployeeCareerSavedJobRecord>();

  for (const record of records) {
    const postId = normalizePostId(record.postId);
    if (!postId) continue;

    const existing = byPostId.get(postId);
    const savedAt = normalizeTimestamp(record.savedAt);

    if (!existing || savedAt > existing.savedAt) {
      byPostId.set(postId, { postId, savedAt });
    }
  }

  return Array.from(byPostId.values())
    .sort((a, b) => b.savedAt - a.savedAt)
    .slice(0, MAX_SAVED_JOBS);
}

function parseSavedJobs(raw: string | null): EmployeeCareerSavedJobRecord[] {
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
        const savedAt = normalizeTimestamp(item.savedAt);

        return {
          postId,
          savedAt,
        };
      });

    return normalizeRecords(records);
  } catch {
    return [];
  }
}

function getAll(): EmployeeCareerSavedJobRecord[] {
  return parseSavedJobs(safeRead(EMPLOYEE_CAREER_SAVED_JOBS_KEY));
}

function writeAll(records: EmployeeCareerSavedJobRecord[]): void {
  safeWrite(EMPLOYEE_CAREER_SAVED_JOBS_KEY, normalizeRecords(records));
  notifyEmployeeCareerSavedJobsChanged();
}

function getIds(): string[] {
  return getAll().map((item) => item.postId);
}

function isSaved(postId: string): boolean {
  const cleanId = normalizePostId(postId);
  if (!cleanId) return false;

  return getIds().includes(cleanId);
}

function toggle(postId: string): { saved: boolean } {
  const cleanId = normalizePostId(postId);
  if (!cleanId) return { saved: false };

  const existing = getAll();

  if (existing.some((item) => item.postId === cleanId)) {
    writeAll(existing.filter((item) => item.postId !== cleanId));
    return { saved: false };
  }

  writeAll([{ postId: cleanId, savedAt: Date.now() }, ...existing]);
  return { saved: true };
}

function getSnapshotKey(): string {
  return safeRead(EMPLOYEE_CAREER_SAVED_JOBS_KEY) ?? "";
}

function subscribe(cb: () => void): () => void {
  const handler = () => cb();
  const events = ["storage", "focus", EMPLOYEE_CAREER_SAVED_JOBS_CHANGED];

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

export const employeeCareerSavedJobsStorage = {
  getAll,
  getIds,
  isSaved,
  toggle,
  getSnapshotKey,
  subscribe,
};
