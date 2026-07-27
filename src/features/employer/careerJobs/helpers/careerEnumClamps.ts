// App name: Job Mitra
// File name: careerEnumClamps.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\helpers\careerEnumClamps.ts

import type {
  CareerApplicationStage,
  CareerJobType,
  CareerPostStatus,
  CareerSalaryPeriod,
  CareerWorkMode,
  InterviewMode,
  RoundResultStatus,
} from "../types/careerTypes";

export function clampJobType(value: unknown): CareerJobType {
  if (value === "full-time" || value === "part-time" || value === "contract") return value;
  return "full-time";
}

export function clampWorkMode(value: unknown): CareerWorkMode {
  if (value === "on-site" || value === "remote" || value === "hybrid") return value;
  return "on-site";
}

export function clampSalaryPeriod(value: unknown): CareerSalaryPeriod {
  if (value === "monthly" || value === "yearly") return value;
  return "monthly";
}

export function clampPostStatus(value: unknown): CareerPostStatus {
  if (
    value === "draft" ||
    value === "active" ||
    value === "paused" ||
    value === "closed" ||
    value === "filled"
  ) {
    return value;
  }

  return "draft";
}

export function clampApplicationStage(value: unknown): CareerApplicationStage {
  if (
    value === "applied" ||
    value === "shortlisted" ||
    value === "interview" ||
    value === "offered" ||
    value === "offer_accepted" ||
    value === "offer_declined" ||
    value === "hired" ||
    value === "rejected" ||
    value === "withdrawn"
  ) {
    return value;
  }

  return "applied";
}

export function clampRoundResultStatus(value: unknown): RoundResultStatus {
  if (
    value === "scheduled" ||
    value === "pending" ||
    value === "passed" ||
    value === "failed" ||
    value === "skipped" ||
    value === "cancelled"
  ) {
    return value;
  }

  return "pending";
}

export function clampInterviewMode(value: unknown): InterviewMode {
  if (value === "in-person" || value === "phone" || value === "video") return value;
  return "in-person";
}
