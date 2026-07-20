import { ROUTE_PATHS } from "../../app/router/routePaths";
import type { PendingActionProvider } from "./pendingActions.types";

/** Shift — employer must rate completed workers (Review Center). */
const employerShiftWorkerReview: PendingActionProvider = {
  id: "shift-worker-review",
  scopes: ["employer-shift-home", "employer-role-home"],
  resolve: (ctx) => {
    const count = ctx.employerShiftReviewCount ?? 0;
    if (count <= 0) return null;

    return {
      id: "shift-worker-review",
      domain: "shift",
      label: "Worker review pending",
      detail: "Rate completed shift workers to finish two-way reviews.",
      count,
      ctaLabel: "Open Review Center",
      pulseId: "pending-shift-shift-rating",
      onAction: () => ctx.navigate(ROUTE_PATHS.employerReviewCenter),
    };
  },
};

/** Shift — employee must rate employer / respond to review requests. */
const employeeShiftReview: PendingActionProvider = {
  id: "shift-employer-review",
  scopes: ["employee-shift-home", "employee-role-home"],
  resolve: (ctx) => {
    const count = ctx.employeeShiftReviewCount ?? 0;
    if (count <= 0) return null;

    return {
      id: "shift-employer-review",
      domain: "shift",
      label: "Shift review pending",
      detail: "Rate the employer or respond to a review request for completed work.",
      count,
      ctaLabel: "Open Review Center",
      pulseId: "pending-shift-shift-rating",
      onAction: () => ctx.navigate(ROUTE_PATHS.employeeReviewCenter),
    };
  },
};

/**
 * Career — employee employer feedback after completed employment.
 * Registered for role/career scopes; wire context when those hubs mount.
 */
const employeeCareerEmployerFeedback: PendingActionProvider = {
  id: "career-employer-feedback",
  scopes: ["employee-role-home", "employee-career-home"],
  resolve: (ctx) => {
    const count = ctx.careerEmployerFeedbackCount ?? 0;
    if (count <= 0) return null;

    return {
      id: "career-employer-feedback",
      domain: "career",
      label: "Employer feedback pending",
      detail: "Share feedback for completed career employment.",
      count,
      ctaLabel: "Give feedback",
      pulseId: "pending-career-employer-feedback",
      onAction: () => ctx.navigate(ROUTE_PATHS.employeeCareerHome),
    };
  },
};

/**
 * Career — employer work feedback for staff records.
 * Registered for role/career scopes; wire context when those hubs mount.
 */
const employerCareerEmploymentFeedback: PendingActionProvider = {
  id: "career-employment-feedback",
  scopes: ["employer-role-home", "employer-career-home"],
  resolve: (ctx) => {
    const count = ctx.careerEmploymentFeedbackCount ?? 0;
    if (count <= 0) return null;

    return {
      id: "career-employment-feedback",
      domain: "career",
      label: "Work feedback pending",
      detail: "Add feedback for completed career staff records.",
      count,
      ctaLabel: "Open My Staff",
      pulseId: "pending-career-employment-feedback",
      onAction: () => ctx.navigate(ROUTE_PATHS.employerMyStaff),
    };
  },
};

export const PENDING_ACTION_PROVIDERS: readonly PendingActionProvider[] = [
  employerShiftWorkerReview,
  employeeShiftReview,
  employeeCareerEmployerFeedback,
  employerCareerEmploymentFeedback,
];
