// src/features/employer/hrManagement/storage/hrStorage.core.ts
//
// Core storage layer: read/write, ID generation, status history, basic CRUD.

import type {
  HRCandidateRecord,
  HRCandidateStatus,
  StatusChangeEntry,
} from "../types/hrManagement.types";

/* ------------------------------------------------ */
/* Constants                                        */
/* ------------------------------------------------ */
const STORAGE_KEY = "wm_hr_management_v1";
export const HR_CHANGED_EVENT = "wm:hr-management-changed";
export const DEFAULT_PROBATION_DAYS = 90;

/* ------------------------------------------------ */
/* Internal helpers (exported for sibling modules)  */
/* ------------------------------------------------ */
export function readAll(): HRCandidateRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HRCandidateRecord[]) : [];
  } catch {
    return [];
  }
}

export function writeAll(records: HRCandidateRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event(HR_CHANGED_EVENT));
}

export function genId(): string {
  return "hr_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

export function genItemId(): string {
  return "obi_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

export function pushStatusChange(
  record: HRCandidateRecord,
  from: string,
  to: string,
  changedBy: "employer" | "system",
  note?: string,
): StatusChangeEntry[] {
  const entry: StatusChangeEntry = {
    id: genId(),
    from,
    to,
    changedAt: Date.now(),
    changedBy,
    note,
  };
  return [...(record.statusHistory ?? []), entry];
}

/* ------------------------------------------------ */
/* Basic CRUD                                       */
/* ------------------------------------------------ */
export function hrGetAll(): HRCandidateRecord[] {
  return readAll().sort((a, b) => b.createdAt - a.createdAt);
}

export function hrGetByStatus(status: HRCandidateStatus): HRCandidateRecord[] {
  return readAll()
    .filter((r) => r.status === status)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function hrGetById(id: string): HRCandidateRecord | null {
  return readAll().find((r) => r.id === id) ?? null;
}

export function hrFindByApplication(careerPostId: string, applicationId: string): HRCandidateRecord | null {
  return (
    readAll().find(
      (r) => r.careerPostId === careerPostId && r.applicationId === applicationId,
    ) ?? null
  );
}

export function hrCountByStatus(status: HRCandidateStatus): number {
  return readAll().filter((r) => r.status === status).length;
}

export function hrUpdate(id: string, patch: Partial<HRCandidateRecord>): boolean {
  const all = readAll();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  all[idx] = { ...all[idx], ...patch, updatedAt: Date.now() };
  writeAll(all);
  return true;
}

export function hrSubscribe(cb: () => void): () => void {
  window.addEventListener(HR_CHANGED_EVENT, cb);
  return () => window.removeEventListener(HR_CHANGED_EVENT, cb);
}