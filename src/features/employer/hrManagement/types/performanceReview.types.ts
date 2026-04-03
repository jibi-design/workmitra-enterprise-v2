// src/features/employer/hrManagement/types/performanceReview.types.ts
//
// Types for performance review system.
// Separate from letters — reviews have ratings, periods, goals.

// ─────────────────────────────────────────────────────────────────────────────
// Review Type
// ─────────────────────────────────────────────────────────────────────────────

export type ReviewType =
  | "probation"
  | "quarterly"
  | "half_yearly"
  | "annual";

export const REVIEW_TYPE_LABELS: Record<ReviewType, string> = {
  probation: "Probation Review",
  quarterly: "Quarterly Review",
  half_yearly: "Half-Yearly Review",
  annual: "Annual Review",
};

// ─────────────────────────────────────────────────────────────────────────────
// Rating (1–5)
// ─────────────────────────────────────────────────────────────────────────────

export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export const RATING_LABELS: Record<ReviewRating, string> = {
  1: "Unsatisfactory",
  2: "Needs Improvement",
  3: "Meets Expectations",
  4: "Exceeds Expectations",
  5: "Outstanding",
};

export const RATING_COLORS: Record<ReviewRating, string> = {
  1: "#dc2626",
  2: "#ea580c",
  3: "#ca8a04",
  4: "#16a34a",
  5: "#7c3aed",
};

// ─────────────────────────────────────────────────────────────────────────────
// Review Status
// ─────────────────────────────────────────────────────────────────────────────

export type ReviewStatus =
  | "sent"
  | "acknowledged"
  | "disputed";

// ─────────────────────────────────────────────────────────────────────────────
// Performance Review Record
// ─────────────────────────────────────────────────────────────────────────────

export type PerformanceReviewRecord = {
  id: string;
  /** Link to HR candidate */
  hrCandidateId: string;
  employeeUniqueId: string;
  employeeName: string;
  jobTitle: string;
  /** Review details */
  reviewType: ReviewType;
  periodFrom: number;
  periodTo: number;
  rating: ReviewRating;
  strengths: string;
  improvements: string;
  goalsNextPeriod: string;
  overallComments: string;
  /** Status */
  status: ReviewStatus;
  /** Tracking */
  createdAt: number;
  sentAt: number;
  acknowledgedAt?: number;
  disputedAt?: number;
  disputeReason?: string;
};