// App name: Job Mitra
// File name: employerShift.employeeApplications.ts
// Employer-scoped applications SoT + worker projection sync (Step 1).

import {
  EMPLOYEE_APPS_CHANGED_EVENT,
  EMPLOYEE_APPS_KEY,
  getEmployerApplicationsKey,
} from "./employerShift.keys";
import type { EmployeeShiftApplication, RequirementAnswer } from "./employerShift.types";
import {
  getNumber,
  getString,
  isRecord,
  notifyEmployeeAppsChanged,
  safeParse,
  safeWrite,
} from "./employerShift.utils";
import { mergeEmployerAppsIntoWorkerProjection } from "../../../shared/shift/shiftTenantProjection";

export function readEmployeeApplications(): EmployeeShiftApplication[] {
  return safeParse<unknown>(localStorage.getItem(getEmployerApplicationsKey()))
    .map(normalizeEmployeeApplication)
    .filter((app): app is EmployeeShiftApplication => app !== null)
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** Worker projection read (marketplace / earnings / employee UI). */
export function readWorkerApplicationProjection(): EmployeeShiftApplication[] {
  return safeParse<unknown>(localStorage.getItem(EMPLOYEE_APPS_KEY))
    .map(normalizeEmployeeApplication)
    .filter((app): app is EmployeeShiftApplication => app !== null)
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** Employee-session hydrate: write worker projection only — never employer SoT. */
export function writeWorkerApplicationProjection(
  apps: EmployeeShiftApplication[],
): ApplicationWriteResult {
  const result = safeWrite(EMPLOYEE_APPS_KEY, apps);
  if (!result.ok) return { ok: false, reason: "storage_error" };
  try {
    window.dispatchEvent(new Event(EMPLOYEE_APPS_CHANGED_EVENT));
  } catch {
    /* advisory */
  }
  notifyEmployeeAppsChanged();
  return { ok: true };
}

export type ApplicationWriteResult = { ok: true } | { ok: false; reason: "storage_error" };

/**
 * Employer write: scoped SoT, then upsert those rows into the worker projection.
 * Does not wipe unrelated employers' projection rows.
 */
export function writeEmployeeApplications(
  apps: EmployeeShiftApplication[],
): ApplicationWriteResult {
  const scopedKey = getEmployerApplicationsKey();
  const result = safeWrite(scopedKey, apps);
  if (!result.ok) return { ok: false, reason: "storage_error" };

  try {
    mergeEmployerAppsIntoWorkerProjection(apps as unknown as Record<string, unknown>[]);
    window.dispatchEvent(new Event(EMPLOYEE_APPS_CHANGED_EVENT));
  } catch {
    /* projection advisory */
  }

  notifyEmployeeAppsChanged();
  return { ok: true };
}

function normalizeEmployeeApplication(raw: unknown): EmployeeShiftApplication | null {
  if (!isRecord(raw)) return null;

  const id = getString(raw, "id");
  const postId = getString(raw, "postId");
  const createdAt = getNumber(raw, "createdAt");
  const status = getString(raw, "status");

  if (!id || !postId || createdAt === undefined || !status) return null;
  if (!isApplicationStatus(status)) return null;

  return {
    id,
    postId,
    createdAt,
    status,
    profileSnapshot: isRecord(raw["profileSnapshot"]) ? raw["profileSnapshot"] : undefined,
    mustHaveAnswers: normalizeRequirementAnswers(raw["mustHaveAnswers"]),
    goodToHaveAnswers: normalizeRequirementAnswers(raw["goodToHaveAnswers"]),
    notes: normalizeStringRecord(raw["notes"]),
    withdrawnAt: getNumber(raw, "withdrawnAt"),
    attendanceConfirmedAt: getNumber(raw, "attendanceConfirmedAt"),
    statusChangedAt: getNumber(raw, "statusChangedAt"),
    replacedAt: getNumber(raw, "replacedAt"),
    replacedReason: normalizeReplacedReason(raw["replacedReason"]),
    quickAnswers: isRecord(raw["quickAnswers"])
      ? normalizeQuickAnswers(raw["quickAnswers"])
      : undefined,
    rating: normalizeRating(raw["rating"]),
    ratingComment: getString(raw, "ratingComment"),
    ratedAt: getNumber(raw, "ratedAt"),
    priorityTag: normalizePriorityTag(raw["priorityTag"]),
    planId: getString(raw, "planId") || undefined,
    planApplyBatchId: getString(raw, "planApplyBatchId") || undefined,
    selectedDates: normalizeStringArray(raw["selectedDates"]),
  };
}

function normalizeStringArray(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const values = raw.filter((v): v is string => typeof v === "string" && v.length > 0);
  return values.length > 0 ? values : undefined;
}

function normalizeRequirementAnswers(raw: unknown): Record<string, RequirementAnswer> {
  if (!isRecord(raw)) return {};

  const answers: Record<string, RequirementAnswer> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (value === "meets" || value === "not_sure" || value === "dont_meet") {
      answers[key] = value;
    }
  }

  return answers;
}

function normalizeStringRecord(raw: unknown): Record<string, string> {
  if (!isRecord(raw)) return {};

  const values: Record<string, string> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") {
      values[key] = value;
    }
  }

  return values;
}

function isApplicationStatus(value: string): value is EmployeeShiftApplication["status"] {
  return (
    value === "applied" ||
    value === "shortlisted" ||
    value === "waiting" ||
    value === "confirmed" ||
    value === "rejected" ||
    value === "withdrawn" ||
    value === "replaced" ||
    value === "exited"
  );
}

function normalizeReplacedReason(value: unknown): EmployeeShiftApplication["replacedReason"] {
  if (
    value === "no_show" ||
    value === "schedule_change" ||
    value === "quality_issue" ||
    value === "other"
  ) {
    return value;
  }

  return undefined;
}

function normalizeRating(value: unknown): EmployeeShiftApplication["rating"] {
  if (value === 1 || value === 2 || value === 3 || value === 4 || value === 5) return value;
  return undefined;
}

function normalizePriorityTag(value: unknown): EmployeeShiftApplication["priorityTag"] {
  if (value === "priority" || value === "good" || value === "review") return value;
  return undefined;
}

function normalizeQuickAnswers(raw: Record<string, unknown>): Record<string, "yes" | "no"> {
  const answers: Record<string, "yes" | "no"> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (value === "yes" || value === "no") {
      answers[key] = value;
    }
  }

  return answers;
}
