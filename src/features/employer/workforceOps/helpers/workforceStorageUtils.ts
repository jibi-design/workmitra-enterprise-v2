// src/features/employer/workforceOps/helpers/workforceStorageUtils.ts
//
// Shared localStorage utilities for Workforce Ops Hub.
// Single source of truth for keys & events.

// ─────────────────────────────────────────────────────────────────────────────
// localStorage Keys
// ─────────────────────────────────────────────────────────────────────────────

export const WF_CATEGORIES_KEY = "wm_workforce_categories_v1";
export const WF_STAFF_KEY = "wm_workforce_staff_v1";
export const WF_TEMPLATES_KEY = "wm_workforce_templates_v1";
export const WF_ANNOUNCEMENTS_KEY = "wm_workforce_announcements_v1";
export const WF_APPLICATIONS_KEY = "wm_workforce_applications_v1";
export const WF_GROUPS_KEY = "wm_workforce_groups_v1";
export const WF_MEMBERS_KEY = "wm_workforce_members_v1";
export const WF_MESSAGES_KEY = "wm_workforce_messages_v1";
export const WF_ATTENDANCE_KEY = "wm_workforce_attendance_v1";
export const WF_ACTIVITY_KEY = "wm_workforce_activity_v1";
export const WF_EMPLOYEE_PREFS_KEY = "wm_employee_workforce_prefs_v1";
export const EMPLOYEE_NOTIF_KEY = "wm_employee_notifications_v1";

// ─────────────────────────────────────────────────────────────────────────────
// Custom Events
// ─────────────────────────────────────────────────────────────────────────────

export const WF_CATEGORIES_CHANGED = "wm:workforce-categories-changed";
export const WF_STAFF_CHANGED = "wm:workforce-staff-changed";
export const WF_TEMPLATES_CHANGED = "wm:workforce-templates-changed";
export const WF_ANNOUNCEMENTS_CHANGED = "wm:workforce-announcements-changed";
export const WF_APPLICATIONS_CHANGED = "wm:workforce-applications-changed";
export const WF_GROUPS_CHANGED = "wm:workforce-groups-changed";
export const WF_MEMBERS_CHANGED = "wm:workforce-members-changed";
export const WF_MESSAGES_CHANGED = "wm:workforce-messages-changed";
export const WF_ATTENDANCE_CHANGED = "wm:workforce-attendance-changed";
export const WF_ACTIVITY_CHANGED = "wm:workforce-activity-changed";
export const EMPLOYEE_NOTIF_CHANGED = "wm:employee-notifications-changed";

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

export function getString(r: UnknownRecord, k: string): string {
  const v = r[k];
  return typeof v === "string" ? v : "";
}

export function getNumber(r: UnknownRecord, k: string): number {
  const v = r[k];
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

export function getBoolean(r: UnknownRecord, k: string, fallback: boolean): boolean {
  const v = r[k];
  return typeof v === "boolean" ? v : fallback;
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

export function safeWrite(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // demo-safe: ignore quota / private mode errors
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
// Event Dispatch
// ─────────────────────────────────────────────────────────────────────────────

export function safeDispatch(eventName: string): void {
  try {
    window.dispatchEvent(new Event(eventName));
  } catch {
    // ignore
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Unique ID Generator
// ─────────────────────────────────────────────────────────────────────────────

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}