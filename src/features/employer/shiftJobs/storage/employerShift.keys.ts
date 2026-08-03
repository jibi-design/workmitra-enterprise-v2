// App name: Job Mitra
// File name: employerShift.keys.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\storage\employerShift.keys.ts

import { resolveShiftEmployerScopedKey } from "../../../shared/shift/shiftEmployerScope";
import {
  ensureEmployerAppsHydrated,
  ensureEmployerInvitesHydrated,
  WORKER_APPS_PROJECTION_KEY,
  WORKER_INVITES_PROJECTION_KEY,
} from "../../../shared/shift/shiftTenantProjection";

/** @deprecated Legacy unscoped — prefer getEmpPostsKey(). Kept for admin wipe / migration docs. */
export const EMP_POSTS_KEY = "wm_employer_shift_posts_v1";
export const EMPLOYEE_SEARCH_POSTS_KEY = "wm_employee_shift_search_v1";
/**
 * Worker-readable applications projection.
 * Employer SoT: getEmployerApplicationsKey() → wm_employer_{scopeId}_shift_applications_v1
 */
export const EMPLOYEE_APPS_KEY = WORKER_APPS_PROJECTION_KEY;
export const EMPLOYEE_NOTES_KEY = "wm_employee_notifications_v1";
/** Global employee marketplace workspaces (workers). Employer UI uses getEmployerWorkspacesKey(). */
export const EMPLOYEE_WORKSPACES_KEY = "wm_employee_shift_workspaces_v1";
/** @deprecated Legacy unscoped — prefer getEmployerShiftActivityKey(). */
export const EMPLOYER_SHIFT_ACTIVITY_KEY = "wm_employer_shift_activity_log_v1";
/** @deprecated Legacy global invites — prefer getEmployerDirectInvitesKey() / worker projection. */
export const LEGACY_DIRECT_INVITES_KEY = "wm_shift_direct_invites_v1";
/** Worker-readable invites projection. */
export const WORKER_DIRECT_INVITES_KEY = WORKER_INVITES_PROJECTION_KEY;
/** @deprecated Legacy unscoped drafts — prefer getEmployerDraftsKey(). */
export const LEGACY_DRAFTS_KEY = "wm_employer_shift_post_drafts_v1";
/** @deprecated Legacy unscoped templates — prefer getEmployerTemplatesKey(). */
export const LEGACY_TEMPLATES_KEY = "wm_employer_shift_templates_v1";

export function getEmpPostsKey(): string {
  return resolveShiftEmployerScopedKey("shift_posts_v1");
}

export function getEmployerShiftActivityKey(): string {
  return resolveShiftEmployerScopedKey("shift_activity_log_v1");
}

export function getEmployerWorkspacesKey(): string {
  return resolveShiftEmployerScopedKey("shift_workspaces_v1");
}

export function getEmployerNotificationsKey(): string {
  return resolveShiftEmployerScopedKey("shift_notifications_v1");
}

export function getEmployerApplicationsKey(): string {
  return ensureEmployerAppsHydrated();
}

export function getEmployerDirectInvitesKey(): string {
  return ensureEmployerInvitesHydrated();
}

export function getEmployerDraftsKey(): string {
  return resolveShiftEmployerScopedKey("shift_post_drafts_v1");
}

export function getEmployerTemplatesKey(): string {
  return resolveShiftEmployerScopedKey("shift_templates_v1");
}

export function getEmployerSelectionAuditKey(): string {
  return resolveShiftEmployerScopedKey("selection_audit_v1");
}

export const EMPLOYER_SHIFT_ACTIVITY_CHANGED_EVENT = "wm:employer-shift-activity-changed";
export const EMPLOYEE_SHIFT_SEARCH_CHANGED_EVENT = "wm:employee-shift-search-changed";
export const EMPLOYEE_NOTES_CHANGED_EVENT = "wm:employee-notifications-changed";
export const EMPLOYEE_APPS_CHANGED_EVENT = "wm:employee-shift-applications-changed";
export const EMPLOYEE_WORKSPACES_CHANGED_EVENT = "wm:employee-shift-workspaces-changed";
export const EMPLOYER_SHIFT_POSTS_CHANGED_EVENT = "wm:employer-shift-posts-changed";
