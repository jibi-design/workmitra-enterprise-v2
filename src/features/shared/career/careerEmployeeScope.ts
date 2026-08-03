/**
 * Employee-scoped Career localStorage keys.
 * Pattern: wm_employee_{workerMlId}_{suffix}
 *
 * Worker projection SoT for applications + workspaces (B-P0-1).
 * Legacy flat keys migrate once into the *current* worker bucket only.
 */

import { resolveActorStorageId } from "../../../app/identity/identity.adapter";
import { employeeProfileStorage } from "../../employee/profile/storage/employeeProfile.storage";

export type CareerEmployeeScopedSuffix =
  | "career_applications_v1"
  | "career_workspaces_v1"
  | "career_search_v1"
  | "career_saved_v1"
  | "career_recent_jobs_v1";

const LEGACY_BY_SUFFIX: Record<CareerEmployeeScopedSuffix, string> = {
  career_applications_v1: "wm_employee_career_applications_v1",
  career_workspaces_v1: "wm_employee_career_workspaces_v1",
  career_search_v1: "wm_employee_career_posts_search_v1",
  career_saved_v1: "wm_employee_career_saved_jobs_v1",
  career_recent_jobs_v1: "wm_employee_career_recent_jobs_v1",
};

export function sanitizeCareerEmployeeScopeId(raw: string): string {
  const cleaned = raw.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  return cleaned || "unknown_worker";
}

/** Active employee worker id (profile uniqueId → actor storage id). */
export function getCurrentCareerEmployeeScopeId(): string {
  try {
    const uniqueId = employeeProfileStorage.get().uniqueId?.trim();
    if (uniqueId) return sanitizeCareerEmployeeScopeId(uniqueId);
  } catch {
    /* fall through */
  }

  try {
    return sanitizeCareerEmployeeScopeId(resolveActorStorageId("employee", "employee_demo"));
  } catch {
    return "unknown_worker";
  }
}

export function careerEmployeeScopedKey(
  suffix: CareerEmployeeScopedSuffix,
  workerScopeId: string,
): string {
  const cleaned = sanitizeCareerEmployeeScopeId(workerScopeId);
  return `wm_employee_${cleaned}_${suffix}`;
}

function migratedFlagKey(scopedKey: string): string {
  return `${scopedKey}__migrated_v1`;
}

export function migrateLegacyCareerEmployeeKeyOnce(
  suffix: CareerEmployeeScopedSuffix,
  scopedKey: string,
): void {
  if (typeof localStorage === "undefined") return;

  try {
    const flag = migratedFlagKey(scopedKey);
    if (localStorage.getItem(flag) === "1") return;

    const scopedRaw = localStorage.getItem(scopedKey);
    if (scopedRaw && scopedRaw !== "[]" && scopedRaw !== "{}") {
      localStorage.setItem(flag, "1");
      return;
    }

    const legacyRaw = localStorage.getItem(LEGACY_BY_SUFFIX[suffix]);
    if (legacyRaw && legacyRaw !== "[]" && legacyRaw !== "{}") {
      localStorage.setItem(scopedKey, legacyRaw);
    }

    localStorage.setItem(flag, "1");
  } catch {
    /* demo-safe */
  }
}

/**
 * Resolve employee Career key.
 * Apps/workspaces use filtered migrate in careerPersistence (legacy was global).
 * Saved/recent/search migrate once for the *current* worker only.
 */
export function resolveCareerEmployeeScopedKey(
  suffix: CareerEmployeeScopedSuffix,
  workerScopeId?: string,
): string {
  const current = getCurrentCareerEmployeeScopeId();
  const target = sanitizeCareerEmployeeScopeId(workerScopeId?.trim() || current);
  const scoped = careerEmployeeScopedKey(suffix, target);

  const autoMigrate: CareerEmployeeScopedSuffix[] = [
    "career_saved_v1",
    "career_recent_jobs_v1",
    "career_search_v1",
  ];
  if (target === current && autoMigrate.includes(suffix)) {
    migrateLegacyCareerEmployeeKeyOnce(suffix, scoped);
  }

  return scoped;
}

export const CAREER_EMPLOYEE_LEGACY_KEYS = { ...LEGACY_BY_SUFFIX } as const;
