// App name: Job Mitra
// File name: compareApplicantsModal.formatters.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\shared\components\compareApplicantsModal\compareApplicantsModal.formatters.ts

import type { ComparableApplicant, DecisionSignal } from "./compareApplicantsModal.types";
import {
  CAREER_AMBER,
  CAREER_BLUE,
  CAREER_GREEN,
  CAREER_MUTED,
} from "./compareApplicantsModal.theme";

export function getDecisionSignal(tag?: ComparableApplicant["priorityTag"]): DecisionSignal {
  if (tag === "priority") {
    return {
      label: "Review first",
      color: CAREER_GREEN,
      background: "rgba(22,163,74,0.08)",
      border: "rgba(22,163,74,0.18)",
      tone: "strong",
    };
  }

  if (tag === "good") {
    return {
      label: "Review next",
      color: CAREER_BLUE,
      background: "rgba(29,78,216,0.08)",
      border: "rgba(29,78,216,0.16)",
      tone: "neutral",
    };
  }

  if (tag === "review") {
    return {
      label: "Review carefully",
      color: CAREER_AMBER,
      background: "rgba(217,119,6,0.08)",
      border: "rgba(217,119,6,0.18)",
      tone: "warning",
    };
  }

  return {
    label: "Manual review",
    color: CAREER_MUTED,
    background: "rgba(100,116,139,0.08)",
    border: "rgba(148,163,184,0.18)",
    tone: "neutral",
  };
}

export function getSkillMatchText(skills: string[], requiredSkills: string[]): string {
  if (requiredSkills.length === 0) return "No required skills set";

  const matched = skills.filter((skill) =>
    requiredSkills.some((required) => required.trim().toLowerCase() === skill.trim().toLowerCase()),
  ).length;

  if (matched === 0) return `No skills matched (${requiredSkills.length} required)`;
  if (matched === 1) return `1 skill matched (${requiredSkills.length} required)`;
  return `${matched} skills matched (${requiredSkills.length} required)`;
}

export function getSkillsText(skills: string[]): string {
  if (skills.length === 0) return "No skills listed";

  const visibleSkills = skills.slice(0, 4);
  const extraCount = skills.length - visibleSkills.length;

  if (extraCount <= 0) return visibleSkills.join(", ");
  return `${visibleSkills.join(", ")} +${extraCount} more`;
}

export function getExperienceLevel(experience?: string): string {
  if (!experience) return "Not specified";

  const normalized = experience.toLowerCase();
  const yearMatch = normalized.match(/(\d+)/);
  const years = yearMatch ? Number(yearMatch[1]) : 0;

  if (normalized.includes("fresher") || years === 0) return "Entry level";
  if (years >= 5) return "Senior level";
  if (years >= 2) return "Mid level";
  return "Junior level";
}

export function getReviewOrderLabel(index: number): string {
  if (index === 0) return "Review first";
  if (index === 1) return "Review next";
  return "Review carefully";
}

export function formatDate(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "Not available";

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatSalary(value?: number): string {
  if (!value || value <= 0) return "Not provided";
  return value.toLocaleString();
}

export function formatScreening(applicant: ComparableApplicant): string {
  if (!applicant.screeningTotal || applicant.screeningTotal <= 0) {
    return "Review answers";
  }

  const answered = applicant.screeningAnswered ?? applicant.screeningTotal;
  return `${answered} of ${applicant.screeningTotal} answered`;
}

export function formatStatus(status: string): string {
  return status
    .replaceAll("-", "_")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
