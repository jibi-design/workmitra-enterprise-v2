// App name: Job Mitra
// File name: careerCandidateReviewFormatters.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\candidateReview\careerCandidateReviewFormatters.ts

import type { CareerApplication } from "../../types/careerTypes";

export function formatReviewTitle(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => (word ? `${word[0]?.toUpperCase() ?? ""}${word.slice(1).toLowerCase()}` : ""))
    .join(" ");
}

export function formatReviewStage(value: CareerApplication["stage"]): string {
  return value
    .split("-")
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

export function formatReviewDateTime(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "Not available";

  return new Date(value).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatReviewQuestionText(value: string): string {
  const trimmed = value.trim();

  const replacements: Record<string, string> = {
    "you available to work full-time for this role?":
      "Are you available to work full-time for this role?",
    "you meet the required experience mentioned in this post?":
      "Do you meet the required experience mentioned in this post?",
    "you have the required qualifications listed for this role?":
      "Do you have the required qualifications listed for this role?",
    "Are you avilable to work full-time for this role?":
      "Are you available to work full-time for this role?",
  };

  return (
    replacements[trimmed] ??
    trimmed.replaceAll("avilable", "available").replaceAll("respones", "responses")
  );
}
