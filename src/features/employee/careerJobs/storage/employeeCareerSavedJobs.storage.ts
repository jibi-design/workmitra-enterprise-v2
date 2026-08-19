// App name: Job Mitra
// File name: employeeCareerSavedJobs.storage.ts
// P1: worker-scoped wm_employee_{workerMlId}_career_saved_v1

import {
  EMPLOYEE_CAREER_SAVED_JOBS_CHANGED,
  notifyEmployeeCareerSavedJobsChanged,
  safeRead,
  safeWrite,
} from "../../../career/helpers/careerStoragePublic";
import { resolveCareerEmployeeScopedKey } from "../../../shared/career/careerEmployeeScope";

export type EmployeeCareerSavedJobRecord = {
  postId: string;
  savedAt: number;
};

const MAX_SAVED_JOBS = 50;
const MAX_POST_ID_LENGTH = 120;

function savedJobsKey(): string {
  return resolveCareerEmployeeScopedKey("career_saved_v1");
}

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
  return parseSavedJobs(safeRead(savedJobsKey()));
}

function writeAll(records: EmployeeCareerSavedJobRecord[]): void {
  safeWrite(savedJobsKey(), normalizeRecords(records));
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
    void import("./employeeCareerSavedJobs.sync").then((mod) => {
      mod.queueCareerSavedJobSync(cleanId, false);
    });
    return { saved: false };
  }

  writeAll([{ postId: cleanId, savedAt: Date.now() }, ...existing]);
  void import("./employeeCareerSavedJobs.sync").then((mod) => {
    mod.queueCareerSavedJobSync(cleanId, true);
  });
  return { saved: true };
}

function replaceAll(records: EmployeeCareerSavedJobRecord[]): void {
  writeAll(records);
}

function getSnapshotKey(): string {
  return safeRead(savedJobsKey()) ?? "";
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
  replaceAll,
  getSnapshotKey,
  subscribe,
};
