// App name: Job Mitra
// File name: employerCandidateDetail.helpers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\helpers\employerCandidateDetail.helpers.ts

import type { EmployeeShiftApplication } from "../../shiftJobs/storage/employerShift.storage";

export type AnswerState = "meets" | "not_sure" | "dont_meet";

export function formatCandidateDateTime(timestamp: number): string {
  try {
    return new Date(timestamp).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function getExperienceLabel(value: string): string {
  if (value === "1-3") return "1-3 years";
  if (value === "3-5") return "3-5 years";
  if (value === "5+") return "5+ years";
  if (value === "fresher") return "Fresher";
  return value;
}

export function getCandidateDisplayId(app: EmployeeShiftApplication): string {
  return app.profileSnapshot?.uniqueId ?? `Candidate ${app.id.slice(-6).toUpperCase()}`;
}

export function getCandidateStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    applied: "#0f766e",
    shortlisted: "#16a34a",
    waiting: "#d97706",
    confirmed: "#0284c7",
    rejected: "#dc2626",
    withdrawn: "#6b7280",
    replaced: "#9333ea",
    exited: "#6b7280",
  };

  return statusColors[status] ?? "#6b7280";
}

export function cleanRequirementList(list: unknown): string[] {
  if (!Array.isArray(list)) return [];

  return list.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

export function hasCandidateProfileInfo(
  profile: EmployeeShiftApplication["profileSnapshot"],
): boolean {
  if (!profile) return false;

  return Boolean(
    profile.fullName ||
    profile.city ||
    profile.experience ||
    profile.skills?.length ||
    profile.languages?.length,
  );
}
