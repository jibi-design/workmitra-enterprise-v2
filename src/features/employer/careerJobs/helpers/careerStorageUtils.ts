// App name: Job Mitra
// File name: careerStorageUtils.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\helpers\careerStorageUtils.ts

// Shared localStorage utilities for Career Jobs domain.
// All service files import from here — single source of truth for keys & events.

// ─────────────────────────────────────────────────────────────────────────────
// localStorage Keys
// ─────────────────────────────────────────────────────────────────────────────

export const CAREER_POSTS_KEY = "wm_employer_career_posts_v1"; // legacy unscoped — prefer resolveCareerEmployerScopedKey
/** @deprecated Legacy global apps key — use getCareerEmployerAppsStorageKey / getCareerEmployeeAppsStorageKey */
export const CAREER_APPS_KEY = "wm_employee_career_applications_v1";
/** @deprecated Legacy global workspaces key — use scoped getters in careerPersistence */
export const CAREER_WORKSPACES_KEY = "wm_employee_career_workspaces_v1";
export const CAREER_ACTIVITY_KEY = "wm_employer_career_activity_log_v1"; // legacy unscoped — prefer resolveCareerEmployerScopedKey
/** @deprecated P1 — use getCareerEmployerSearchStorageKey / merged read via careerSearchIndex.scope */
export const EMPLOYEE_SEARCH_CAREER_KEY = "wm_employee_career_posts_search_v1";
/** @deprecated P1 — use resolveCareerEmployeeScopedKey("career_saved_v1") */
export const EMPLOYEE_CAREER_SAVED_JOBS_KEY = "wm_employee_career_saved_jobs_v1";
/** @deprecated P1 — use resolveCareerEmployeeScopedKey("career_recent_jobs_v1") */
export const EMPLOYEE_CAREER_RECENT_JOBS_KEY = "wm_employee_career_recent_jobs_v1";

// ─────────────────────────────────────────────────────────────────────────────
// Custom Events (same-tab real-time sync)
// ─────────────────────────────────────────────────────────────────────────────

export const CAREER_POSTS_CHANGED = "wm:employer-career-posts-changed";
export const CAREER_APPS_CHANGED = "wm:employee-career-applications-changed";
export const CAREER_WORKSPACES_CHANGED = "wm:employee-career-workspaces-changed";
export const CAREER_ACTIVITY_CHANGED = "wm:employer-career-activity-changed";
export const EMPLOYEE_NOTES_CHANGED = "wm:employee-notifications-changed";
export const EMPLOYEE_CAREER_SAVED_JOBS_CHANGED = "wm:employee-career-saved-jobs-changed";
export const EMPLOYEE_CAREER_RECENT_JOBS_CHANGED = "wm:employee-career-recent-jobs-changed";
export const EMPLOYEE_CAREER_SEARCH_CHANGED = "wm:employee-career-search-changed";

// ─────────────────────────────────────────────────────────────────────────────
// Type Guard
// ─────────────────────────────────────────────────────────────────────────────

export type UnknownRecord = Record<string, unknown>;

export function isRecord(x: unknown): x is UnknownRecord {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

// ─────────────────────────────────────────────────────────────────────────────
// Safe Field Extractors
// ─────────────────────────────────────────────────────────────────────────────

export function getString(r: UnknownRecord, k: string): string | undefined {
  const v = r[k];
  return typeof v === "string" ? v : undefined;
}

export function getNumber(r: UnknownRecord, k: string): number | undefined {
  const v = r[k];
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

export function getStringArray(r: UnknownRecord, k: string): string[] {
  const v = r[k];
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// Safe localStorage Operations
// ─────────────────────────────────────────────────────────────────────────────

export function safeParse<T>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export type CareerStorageWriteResult = { ok: true } | { ok: false; reason: "storage_error" };

export function safeWrite(key: string, value: unknown): CareerStorageWriteResult {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch {
    return { ok: false, reason: "storage_error" };
  }
}

export function safeRead(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Event Dispatchers
// ─────────────────────────────────────────────────────────────────────────────

export function safeDispatch(eventName: string): void {
  try {
    window.dispatchEvent(new Event(eventName));
  } catch {
    // ignore
  }
}

export function notifyCareerPostsChanged(): void {
  safeDispatch(CAREER_POSTS_CHANGED);
}

export function notifyCareerAppsChanged(): void {
  safeDispatch(CAREER_APPS_CHANGED);
}

export function notifyCareerWorkspacesChanged(): void {
  safeDispatch(CAREER_WORKSPACES_CHANGED);
}

export function notifyCareerActivityChanged(): void {
  safeDispatch(CAREER_ACTIVITY_CHANGED);
}

export function notifyEmployeeNotesChanged(): void {
  safeDispatch(EMPLOYEE_NOTES_CHANGED);
}

export function notifyEmployeeCareerSavedJobsChanged(): void {
  safeDispatch(EMPLOYEE_CAREER_SAVED_JOBS_CHANGED);
}

export function notifyEmployeeCareerRecentJobsChanged(): void {
  safeDispatch(EMPLOYEE_CAREER_RECENT_JOBS_CHANGED);
}

export function notifyEmployeeCareerSearchChanged(): void {
  safeDispatch(EMPLOYEE_CAREER_SEARCH_CHANGED);
}

// ─────────────────────────────────────────────────────────────────────────────
// Unique ID Generator
// ─────────────────────────────────────────────────────────────────────────────

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}
