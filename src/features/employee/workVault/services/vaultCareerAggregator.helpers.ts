// vaultCareerAggregator.helpers.ts

import type { VaultWorkExperienceEntry, WorkExperienceStatus } from "../types/vaultProfileTypes";
import {
  getCareerEmployeeAppsStorageKey,
  getCareerEmployeeWorkspacesStorageKey,
} from "../../../career/helpers/careerStoragePublic";

export const CAREER_POSTS_KEY = "wm_employer_career_posts_v1";
/** @deprecated Prefer getCareerEmployeeAppsStorageKey() — legacy global key */
export const CAREER_APPS_KEY = "wm_employee_career_applications_v1";
/** @deprecated Prefer getCareerEmployeeWorkspacesStorageKey() — legacy global key */
export const CAREER_WORKSPACES_KEY = "wm_employee_career_workspaces_v1";
export const EMPLOYMENT_KEY = "wm_employment_lifecycle_v1";

export function resolveVaultCareerAppsKey(): string {
  return getCareerEmployeeAppsStorageKey();
}

export function resolveVaultCareerWorkspacesKey(): string {
  return getCareerEmployeeWorkspacesStorageKey();
}

type Rec = Record<string, unknown>;

export function parse<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? (arr as T[]) : [];
  } catch {
    return [];
  }
}

export function str(r: Rec, k: string): string {
  const v = r[k];
  return typeof v === "string" ? v : "";
}

export function num(r: Rec, k: string): number {
  const v = r[k];
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

export function bool(r: Rec, k: string): boolean {
  return r[k] === true;
}

function mapExitReasonToStatus(reason: string): WorkExperienceStatus {
  switch (reason) {
    case "resigned":
    case "mutual_agreement":
      return "left";
    case "terminated":
    case "layoff":
      return "terminated";
    case "contract_end":
      return "completed";
    default:
      return "left";
  }
}

export function aggregateFullHRCompleted(): VaultWorkExperienceEntry[] {
  return parse<Rec>(EMPLOYMENT_KEY)
    .filter((r) => str(r, "status") === "exited" && bool(r, "verified"))
    .map((r): VaultWorkExperienceEntry => ({
      jobId: str(r, "careerPostId") || str(r, "id"),
      companyName: str(r, "companyName") || "Unknown Company",
      jobTitle: str(r, "jobTitle") || "Unknown Position",
      department: str(r, "department"),
      location: str(r, "location"),
      hiredAt: num(r, "joinedAt"),
      endedAt: num(r, "exitedAt") || null,
      status: mapExitReasonToStatus(str(r, "exitReason")),
      employerRating: num(r, "employerRating") || null,
    }))
    .sort((a, b) => (b.endedAt ?? b.hiredAt) - (a.endedAt ?? a.hiredAt));
}

export function aggregateFullHRActive(): VaultWorkExperienceEntry[] {
  return parse<Rec>(EMPLOYMENT_KEY)
    .filter((r) => {
      const s = str(r, "status");
      return (
        s === "active" || s === "probation" || s === "resignation_pending" || s === "notice_period"
      );
    })
    .map((r): VaultWorkExperienceEntry => ({
      jobId: str(r, "careerPostId") || str(r, "id"),
      companyName: str(r, "companyName") || "Unknown Company",
      jobTitle: str(r, "jobTitle") || "Unknown Position",
      department: str(r, "department"),
      location: str(r, "location"),
      hiredAt: num(r, "joinedAt"),
      endedAt: null,
      status: "hired",
      employerRating: null,
    }))
    .sort((a, b) => b.hiredAt - a.hiredAt);
}
