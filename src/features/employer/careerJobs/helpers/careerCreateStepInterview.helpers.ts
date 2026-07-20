// App name: Job Mitra
// File name: careerCreateStepInterview.helpers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\helpers\careerCreateStepInterview.helpers.ts

import type {
  CareerJobType,
  CareerSalaryPeriod,
  CareerWorkMode,
  InterviewMode,
} from "../types/careerTypes";

export function interviewModeLabel(mode: InterviewMode): string {
  if (mode === "in-person") return "In-person";
  if (mode === "phone") return "Phone";
  return "Video";
}

export function jobTypeLabel(type: CareerJobType): string {
  if (type === "full-time") return "Full-time";
  if (type === "part-time") return "Part-time";
  return "Contract";
}

export function workModeLabel(mode: CareerWorkMode): string {
  if (mode === "on-site") return "On-site";
  if (mode === "remote") return "Remote";
  return "Hybrid";
}

export function salaryPeriodLabel(period: CareerSalaryPeriod): string {
  return period === "monthly" ? "month" : "year";
}

export function formatCareerCreateDate(epoch: number): string {
  try {
    return new Date(epoch).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Not set";
  }
}

export function normalizeCareerTagInput(raw: string, maxItems: number): string[] {
  return raw
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxItems);
}
