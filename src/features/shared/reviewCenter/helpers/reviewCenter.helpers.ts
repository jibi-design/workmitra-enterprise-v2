// App name: Job Mitra
// File name: reviewCenter.helpers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\shared\reviewCenter\helpers\reviewCenter.helpers.ts

import type {
  ReviewCenterTheme,
  ReviewDomain,
  ReviewRequestAction,
  ReviewRole,
} from "../types/reviewCenter.types";

export function getReviewCenterTheme(domain: ReviewDomain): ReviewCenterTheme {
  if (domain === "career") {
    return {
      domain,
      label: "Career Jobs",
      accent: "#2563eb",
      softBg: "rgba(37,99,235,0.08)",
      border: "rgba(37,99,235,0.18)",
    };
  }

  if (domain === "planner") {
    return {
      domain,
      label: "Gig Projects",
      accent: "#0891b2",
      softBg: "rgba(8,145,178,0.08)",
      border: "rgba(8,145,178,0.18)",
    };
  }

  return {
    domain,
    label: "Shift Jobs",
    accent: "#16a34a",
    softBg: "rgba(22,163,74,0.08)",
    border: "rgba(22,163,74,0.18)",
  };
}

export function getReviewCenterTitle(role: ReviewRole): string {
  return role === "employee" ? "Work Review Center" : "Worker Review Center";
}

export function getReviewRequestLabel(action: ReviewRequestAction): string {
  if (action === "employee_request_employer_rating") {
    return "Worker requested employer rating";
  }

  return "Employer requested worker review";
}

export function getReviewRequestBody(action: ReviewRequestAction): string {
  if (action === "employee_request_employer_rating") {
    return "The worker asked the employer to review completed work.";
  }

  return "The employer asked the worker to review the completed work experience.";
}

export function createReviewRequestId(): string {
  return `review_${Date.now().toString(16)}_${Math.random().toString(16).slice(2, 8)}`;
}
