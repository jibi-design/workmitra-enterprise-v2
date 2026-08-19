// App name: Job Mitra
// File name: employerShift.utils.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\storage\employerShift.utils.ts

import {
  EMPLOYEE_APPS_CHANGED_EVENT,
  EMPLOYEE_NOTES_CHANGED_EVENT,
  EMPLOYEE_WORKSPACES_CHANGED_EVENT,
  EMPLOYER_SHIFT_ACTIVITY_CHANGED_EVENT,
  EMPLOYER_SHIFT_POSTS_CHANGED_EVENT,
} from "./employerShift.keys";
import type {
  AnalysisStatus,
  ExperienceLabel,
  ShiftCategory,
  UnknownRecord,
} from "./employerShift.types";
import { scopeAppLocalId } from "../../../../shared/identity/constants/idConstants";

export type JsonStorageWriteResult =
  { readonly ok: true } | { readonly ok: false; readonly reason: "storage_error" };

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

export function getString(record: UnknownRecord, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

export function getNumber(record: UnknownRecord, key: string): number | undefined {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function getStringArray(record: UnknownRecord, key: string): string[] {
  const value = record[key];

  if (!Array.isArray(value)) return [];

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

export function safeParse<T>(raw: string | null): T[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function safeWrite(key: string, value: unknown): JsonStorageWriteResult {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch {
    return { ok: false, reason: "storage_error" };
  }
}

export function safeDispatch(eventName: string): void {
  try {
    window.dispatchEvent(new Event(eventName));
  } catch {
    // Ignore non-browser/test runtime dispatch failures.
  }
}

export function notifyEmployeeNotesChanged(): void {
  safeDispatch(EMPLOYEE_NOTES_CHANGED_EVENT);
}

export function notifyEmployeeAppsChanged(): void {
  safeDispatch(EMPLOYEE_APPS_CHANGED_EVENT);
}

export function notifyEmployeeWorkspacesChanged(): void {
  safeDispatch(EMPLOYEE_WORKSPACES_CHANGED_EVENT);
}

export function notifyEmployerShiftPostsChanged(): void {
  safeDispatch(EMPLOYER_SHIFT_POSTS_CHANGED_EVENT);
}

export function notifyEmployerShiftActivityChanged(): void {
  safeDispatch(EMPLOYER_SHIFT_ACTIVITY_CHANGED_EVENT);
}

export function createLocalId(prefix: string): string {
  const scoped = scopeAppLocalId(prefix);
  return `${scoped}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function clampCategory(value: unknown): ShiftCategory {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  return "Other";
}

export function clampExperience(value: unknown): ExperienceLabel {
  if (value === "helper" || value === "fresher_ok" || value === "experienced") {
    return value;
  }

  return "helper";
}

export function clampAnalysisStatus(value: unknown): AnalysisStatus {
  return value === "done" ? "done" : "not_started";
}

export function uniq(list: string[]): string[] {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const item of list) {
    if (!item || typeof item !== "string") continue;
    if (seen.has(item)) continue;

    seen.add(item);
    output.push(item);
  }

  return output;
}
