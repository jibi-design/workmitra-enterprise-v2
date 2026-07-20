/** Job Mitra | pulseRegistry.ts | src/features/pulse/pulseRegistry.ts */

import { ROUTE_PATHS } from "../../app/router/routePaths";
import { PulseEvent } from "./pulseEvents";
import { PULSE_VISUAL_TOKENS } from "./pulseRegistryTokens";
import type { PulseConfig } from "./pulseRegistryTypes";
import { PulseSectionId } from "./pulseSectionIds";

export { PulseEvent };
export type { NotificationId } from "./pulseEvents";
export { PulseSectionId };
export type {
  InteractionPulseConfig,
  PulseConfig,
  PulseDuration,
  PulseResolutionType,
  PulseSeverity,
  PulseTargetPath,
  RoutePulseConfig,
} from "./pulseRegistryTypes";

/**
 * Central Pulse Registry
 * -----------------------------------------------------------------------------
 * This file is now only the event-to-target map.
 *
 * Keep this file free from:
 * - Zustand state.
 * - React hooks.
 * - Component rendering.
 * - Navigation side effects.
 * - Private job/application/message payloads.
 */
export const PULSE_REGISTRY = {
  [PulseEvent.SHIFT_CONFIRMATION]: {
    ...PULSE_VISUAL_TOKENS.CRITICAL,
    duration: "1s",
    resolutionType: "ROUTE",
    targetPath: ROUTE_PATHS.employeeShiftApplications,
  },

  [PulseEvent.SHIFT_APPLICATION_RECEIVED]: {
    ...PULSE_VISUAL_TOKENS.INFO,
    duration: "3s",
    resolutionType: "INTERACTION",
    targetPath: ROUTE_PATHS.employerShiftPostDashboard,
    targetSectionId: PulseSectionId.EMPLOYER_SHIFT_APPLICATION_CARD,
  },

  [PulseEvent.SHIFT_SHORTLISTED]: {
    ...PULSE_VISUAL_TOKENS.WARNING,
    duration: "2s",
    resolutionType: "INTERACTION",
    targetPath: ROUTE_PATHS.employeeShiftApplications,
    targetSectionId: PulseSectionId.EMPLOYEE_SHIFT_SHORTLISTED_CARD,
  },

  [PulseEvent.SHIFT_WAITLISTED]: {
    ...PULSE_VISUAL_TOKENS.WARNING,
    duration: "2s",
    resolutionType: "INTERACTION",
    targetPath: ROUTE_PATHS.employeeShiftApplications,
    targetSectionId: PulseSectionId.EMPLOYEE_SHIFT_WAITLISTED_CARD,
  },

  [PulseEvent.APPLICATION_RECEIVED]: {
    ...PULSE_VISUAL_TOKENS.INFO,
    duration: "3s",
    resolutionType: "ROUTE",
    targetPath: ROUTE_PATHS.employerCareerCandidateDetail,
  },

  [PulseEvent.SHORTLISTED]: {
    ...PULSE_VISUAL_TOKENS.WARNING,
    duration: "2s",
    resolutionType: "INTERACTION",
    targetPath: ROUTE_PATHS.employeeCareerApplications,
    targetSectionId: PulseSectionId.EMPLOYEE_APPLICATION_SHORTLISTED_CARD,
  },

  [PulseEvent.INTERVIEW_SCHEDULED]: {
    ...PULSE_VISUAL_TOKENS.WARNING,
    duration: "2s",
    resolutionType: "INTERACTION",
    targetPath: ROUTE_PATHS.employeeCareerApplications,
    targetSectionId: PulseSectionId.EMPLOYEE_APPLICATION_INTERVIEW_CARD,
  },

  [PulseEvent.PROFILE_UPDATE_NEEDED]: {
    ...PULSE_VISUAL_TOKENS.WARNING,
    duration: "2s",
    resolutionType: "ROUTE",
    targetPath: ROUTE_PATHS.employeeProfile,
  },

  [PulseEvent.OFFER_RECEIVED]: {
    ...PULSE_VISUAL_TOKENS.WARNING,
    duration: "2s",
    resolutionType: "INTERACTION",
    targetPath: ROUTE_PATHS.employeeCareerApplications,
    targetSectionId: PulseSectionId.EMPLOYEE_APPLICATION_OFFER_CARD,
  },

  [PulseEvent.SHIFT_CONFIRMATION_REQUIRED]: {
    ...PULSE_VISUAL_TOKENS.CRITICAL,
    duration: "1s",
    resolutionType: "INTERACTION",
    targetPath: ROUTE_PATHS.employeeShiftApplications,
    targetSectionId: PulseSectionId.EMPLOYEE_SHIFT_CONFIRMATION_CARD,
  },

  [PulseEvent.SHIFT_EMPLOYEE_SELECTED]: {
    ...PULSE_VISUAL_TOKENS.CRITICAL,
    duration: "1s",
    resolutionType: "ROUTE",
    targetPath: ROUTE_PATHS.employeeShiftWorkspaces,
  },

  // ── Employer: Shift workforce events ────────────────────────────────────────
  [PulseEvent.SHIFT_WORKER_CONFIRMED]: {
    ...PULSE_VISUAL_TOKENS.SUCCESS,
    duration: "3s",
    resolutionType: "INTERACTION",
    targetPath: ROUTE_PATHS.employerShiftPostDashboard,
    targetSectionId: PulseSectionId.EMPLOYER_SHIFT_CONFIRMED_ROSTER,
  },

  [PulseEvent.SHIFT_WORKER_CANCELLED]: {
    ...PULSE_VISUAL_TOKENS.CRITICAL,
    duration: "1s",
    resolutionType: "INTERACTION",
    targetPath: ROUTE_PATHS.employerShiftPostDashboard,
    targetSectionId: PulseSectionId.EMPLOYER_SHIFT_REPLACEMENT_NEEDED,
  },

  [PulseEvent.SHIFT_POST_COMPLETED]: {
    ...PULSE_VISUAL_TOKENS.SUCCESS,
    duration: "3s",
    resolutionType: "INTERACTION",
    targetPath: ROUTE_PATHS.employerShiftPostDashboard,
    targetSectionId: PulseSectionId.EMPLOYER_SHIFT_COMPLETED_CARD,
  },

  [PulseEvent.SHIFT_PLAN_CANCELLED_CONFIRMED_WORKER]: {
    ...PULSE_VISUAL_TOKENS.CRITICAL,
    duration: "1s",
    resolutionType: "INTERACTION",
    targetPath: ROUTE_PATHS.employeePlannerPlanApplicationSummary,
    targetSectionId: PulseSectionId.EMPLOYEE_SHIFT_PLAN_CANCELLED_CARD,
  },

  [PulseEvent.PLAN_CANCELLED]: {
    ...PULSE_VISUAL_TOKENS.WARNING,
    duration: "2s",
    resolutionType: "INTERACTION",
    targetPath: ROUTE_PATHS.employeePlannerPlanApplicationSummary,
    targetSectionId: PulseSectionId.EMPLOYEE_PLAN_CANCELLED_CARD,
  },

  // ── Employer: Career interview response ─────────────────────────────────────
  [PulseEvent.INTERVIEW_ACCEPTED]: {
    ...PULSE_VISUAL_TOKENS.SUCCESS,
    duration: "2s",
    resolutionType: "ROUTE",
    targetPath: ROUTE_PATHS.employerCareerCandidateDetail,
  },

  [PulseEvent.INTERVIEW_DECLINED]: {
    ...PULSE_VISUAL_TOKENS.WARNING,
    duration: "2s",
    resolutionType: "ROUTE",
    targetPath: ROUTE_PATHS.employerCareerCandidateDetail,
  },

  [PulseEvent.REVIEW_RECEIVED]: {
    ...PULSE_VISUAL_TOKENS.WARNING,
    duration: "2s",
    resolutionType: "ROUTE",
    targetPath: ROUTE_PATHS.employeeReviewCenter,
  },

  [PulseEvent.EMPLOYMENT_JOINED]: {
    ...PULSE_VISUAL_TOKENS.SUCCESS,
    duration: "2s",
    resolutionType: "ROUTE",
    targetPath: ROUTE_PATHS.employeeCareerHome,
  },

  [PulseEvent.EMPLOYMENT_RESIGNATION_SUBMITTED]: {
    ...PULSE_VISUAL_TOKENS.WARNING,
    duration: "2s",
    resolutionType: "ROUTE",
    targetPath: ROUTE_PATHS.employerCareerHome,
  },

  [PulseEvent.EMPLOYMENT_RESIGNATION_WITHDRAWN]: {
    ...PULSE_VISUAL_TOKENS.INFO,
    duration: "2s",
    resolutionType: "ROUTE",
    targetPath: ROUTE_PATHS.employerCareerHome,
  },

  [PulseEvent.EMPLOYMENT_RESIGNATION_CONFIRMED]: {
    ...PULSE_VISUAL_TOKENS.WARNING,
    duration: "2s",
    resolutionType: "ROUTE",
    targetPath: ROUTE_PATHS.employeeCareerHome,
  },

  [PulseEvent.EMPLOYMENT_TERMINATED]: {
    ...PULSE_VISUAL_TOKENS.CRITICAL,
    duration: "2s",
    resolutionType: "ROUTE",
    targetPath: ROUTE_PATHS.employeeCareerHome,
  },

  [PulseEvent.EMPLOYMENT_FORCE_COMPLETED]: {
    ...PULSE_VISUAL_TOKENS.WARNING,
    duration: "2s",
    resolutionType: "ROUTE",
    targetPath: ROUTE_PATHS.employerCareerHome,
  },
} as const satisfies Partial<Record<PulseEvent, PulseConfig>>;

export type PulseAffectedUserRole = "employee" | "employer" | "admin";

export type PulseEventDomain = "shift" | "career" | "workforce" | "employment" | "admin" | "system";

export type PulseEventSeverity = "info" | "success" | "warning" | "urgent";

export const PULSE_BACKEND_EVENT_TYPES = [
  "SHIFT_APPLICATION_SUBMITTED",
  "SHIFT_EMPLOYEE_SHORTLISTED",
  "SHIFT_EMPLOYEE_WAITLISTED",
  "SHIFT_CONFIRMATION_REQUIRED",
  "SHIFT_EMPLOYEE_SELECTED",

  "CAREER_APPLICATION_SUBMITTED",
  "CAREER_NEW_APPLICATION",
  "CAREER_EMPLOYEE_SHORTLISTED",
  "CAREER_INTERVIEW_SCHEDULED",
  "CAREER_INTERVIEW_INVITE",
  "CAREER_OFFER_RECEIVED",
  "CAREER_OFFER_EXTENDED",
  "CAREER_OFFER_ACCEPTED",
  "CAREER_OFFER_REJECTED",

  "NEW_RATING",
  "REVIEW_RECEIVED",
  "GROUP_UPDATE",
  "GENERAL_BROADCAST",
  "PROFILE_VIEW",
  "CAREER_JOB_BOOKMARKED",
  "CAREER_RESUME_DOWNLOADED",
  "CAREER_POST_EXPIRING",
  "CAREER_PROFILE_VIEWED",

  "SYSTEM_ALERT",

  "SHIFT_WORKER_CONFIRMED",
  "SHIFT_WORKER_CANCELLED",
  "SHIFT_POST_COMPLETED",
  "SHIFT_PLAN_CANCELLED_CONFIRMED_WORKER",
  "PLAN_CANCELLED",
  "CAREER_INTERVIEW_ACCEPTED",
  "CAREER_INTERVIEW_DECLINED",

  "SHIFT_POSTS_NEARBY",
  "SHIFT_APPLICATION_REJECTED",
  "SHIFT_ASSIGNMENT_REPLACED",
  "SHIFT_BACKUP_SLOT_OPEN",
  "SHIFT_APPLICATION_WITHDRAWN",
  "CAREER_APPLICATION_REJECTED",
  "CAREER_INTERVIEW_UPDATE",
  "CAREER_HIRED",

  "EMPLOYMENT_JOINED",
  "EMPLOYMENT_RESIGNATION_SUBMITTED",
  "EMPLOYMENT_RESIGNATION_WITHDRAWN",
  "EMPLOYMENT_RESIGNATION_CONFIRMED",
  "EMPLOYMENT_TERMINATED",
  "EMPLOYMENT_FORCE_COMPLETED",
  "EMPLOYMENT_PLEASE_RATE",
] as const;

export type PulseBackendEventType = (typeof PULSE_BACKEND_EVENT_TYPES)[number];

export const PULSE_ENABLED_EVENT_TYPES = [
  "SHIFT_APPLICATION_SUBMITTED",
  "SHIFT_EMPLOYEE_SHORTLISTED",
  "SHIFT_EMPLOYEE_WAITLISTED",
  "SHIFT_CONFIRMATION_REQUIRED",
  "SHIFT_EMPLOYEE_SELECTED",

  "CAREER_APPLICATION_SUBMITTED",
  "CAREER_NEW_APPLICATION",
  "CAREER_EMPLOYEE_SHORTLISTED",
  "CAREER_INTERVIEW_SCHEDULED",
  "CAREER_INTERVIEW_INVITE",
  "CAREER_OFFER_RECEIVED",
  "CAREER_OFFER_EXTENDED",
  "CAREER_OFFER_ACCEPTED",
  "CAREER_OFFER_REJECTED",

  "SYSTEM_ALERT",

  "SHIFT_WORKER_CONFIRMED",
  "SHIFT_WORKER_CANCELLED",
  "SHIFT_POST_COMPLETED",
  "SHIFT_PLAN_CANCELLED_CONFIRMED_WORKER",
  "PLAN_CANCELLED",
  "CAREER_INTERVIEW_ACCEPTED",
  "CAREER_INTERVIEW_DECLINED",

  "REVIEW_RECEIVED",

  "EMPLOYMENT_JOINED",
  "EMPLOYMENT_RESIGNATION_SUBMITTED",
  "EMPLOYMENT_RESIGNATION_WITHDRAWN",
  "EMPLOYMENT_RESIGNATION_CONFIRMED",
  "EMPLOYMENT_TERMINATED",
  "EMPLOYMENT_FORCE_COMPLETED",
] as const;

export type PulseEnabledEventType = (typeof PULSE_ENABLED_EVENT_TYPES)[number];

export const INFORMATION_ONLY_EVENT_TYPES = [
  "NEW_RATING",
  "GROUP_UPDATE",
  "GENERAL_BROADCAST",
  "PROFILE_VIEW",
  "CAREER_JOB_BOOKMARKED",
  "CAREER_RESUME_DOWNLOADED",
  "CAREER_POST_EXPIRING",
  "CAREER_PROFILE_VIEWED",

  "SHIFT_POSTS_NEARBY",
  "SHIFT_APPLICATION_REJECTED",
  "SHIFT_ASSIGNMENT_REPLACED",
  "SHIFT_BACKUP_SLOT_OPEN",
  "SHIFT_APPLICATION_WITHDRAWN",
  "CAREER_APPLICATION_REJECTED",
  "CAREER_INTERVIEW_UPDATE",
  "CAREER_HIRED",
] as const;

export type InformationOnlyEventType = (typeof INFORMATION_ONLY_EVENT_TYPES)[number];

export function isPulseEnabledEventType(
  value: PulseBackendEventType,
): value is PulseEnabledEventType {
  return PULSE_ENABLED_EVENT_TYPES.includes(value as PulseEnabledEventType);
}

export function isInformationOnlyEventType(
  value: PulseBackendEventType,
): value is InformationOnlyEventType {
  return INFORMATION_ONLY_EVENT_TYPES.includes(value as InformationOnlyEventType);
}

export type PulseRouteDefinition = {
  readonly eventId: PulseEvent;
  readonly affectedUserRole: PulseAffectedUserRole;
  readonly domain: PulseEventDomain;
  readonly chain: readonly string[];
  readonly severity: PulseEventSeverity;
  readonly targetSectionId?: (typeof PulseSectionId)[keyof typeof PulseSectionId];
};

/**
 * Backend/App Event → UI Pulse Route map.
 *
 * Locked architecture rule:
 * Add future pulse flows here, not inside pages/components.
 */
export const PULSE_EVENT_ROUTES: Partial<Record<PulseBackendEventType, PulseRouteDefinition>> = {
  SHIFT_APPLICATION_SUBMITTED: {
    eventId: PulseEvent.SHIFT_APPLICATION_RECEIVED,
    affectedUserRole: "employer",
    domain: "shift",
    severity: "urgent",
    chain: ["home-shift-card", "shift-dashboard-applications"],
    targetSectionId: PulseSectionId.EMPLOYER_SHIFT_APPLICATION_CARD,
  },

  SHIFT_EMPLOYEE_SHORTLISTED: {
    eventId: PulseEvent.SHIFT_SHORTLISTED,
    affectedUserRole: "employee",
    domain: "shift",
    severity: "urgent",
    chain: [
      "employee-home-shift-card",
      "shift-dashboard-applications",
      "employee-shift-shortlisted-card",
    ],
    targetSectionId: PulseSectionId.EMPLOYEE_SHIFT_SHORTLISTED_CARD,
  },

  SHIFT_EMPLOYEE_WAITLISTED: {
    eventId: PulseEvent.SHIFT_WAITLISTED,
    affectedUserRole: "employee",
    domain: "shift",
    severity: "warning",
    chain: [
      "employee-home-shift-card",
      "shift-dashboard-applications",
      "employee-shift-waitlisted-card",
    ],
    targetSectionId: PulseSectionId.EMPLOYEE_SHIFT_WAITLISTED_CARD,
  },

  SHIFT_CONFIRMATION_REQUIRED: {
    eventId: PulseEvent.SHIFT_CONFIRMATION_REQUIRED,
    affectedUserRole: "employee",
    domain: "shift",
    severity: "urgent",
    chain: [
      "employee-home-shift-card",
      "shift-dashboard-applications",
      "employee-shift-confirmation-card",
    ],
    targetSectionId: PulseSectionId.EMPLOYEE_SHIFT_CONFIRMATION_CARD,
  },

  SHIFT_EMPLOYEE_SELECTED: {
    eventId: PulseEvent.SHIFT_EMPLOYEE_SELECTED,
    affectedUserRole: "employee",
    domain: "shift",
    severity: "urgent",
    chain: [
      "employee-home-shift-card",
      "employee-shift-workspaces",
      "employee-shift-selected-card",
    ],
    targetSectionId: PulseSectionId.EMPLOYEE_SHIFT_SELECTED_CARD,
  },

  CAREER_APPLICATION_SUBMITTED: {
    eventId: PulseEvent.APPLICATION_RECEIVED,
    affectedUserRole: "employer",
    domain: "career",
    severity: "urgent",
    chain: ["home-career-card", "career-dashboard-applications"],
  },

  CAREER_NEW_APPLICATION: {
    eventId: PulseEvent.APPLICATION_RECEIVED,
    affectedUserRole: "employer",
    domain: "career",
    severity: "urgent",
    chain: ["home-career-card", "career-dashboard-applications"],
  },

  CAREER_EMPLOYEE_SHORTLISTED: {
    eventId: PulseEvent.SHORTLISTED,
    affectedUserRole: "employee",
    domain: "career",
    severity: "urgent",
    chain: [
      "employee-home-career-card",
      "career-dashboard-applications",
      "career-applications-shortlisted",
    ],
    targetSectionId: PulseSectionId.EMPLOYEE_APPLICATION_SHORTLISTED_CARD,
  },

  CAREER_INTERVIEW_SCHEDULED: {
    eventId: PulseEvent.INTERVIEW_SCHEDULED,
    affectedUserRole: "employee",
    domain: "career",
    severity: "urgent",
    chain: [
      "employee-home-career-card",
      "career-dashboard-applications",
      "career-funnel-interviews",
    ],
    targetSectionId: PulseSectionId.EMPLOYEE_APPLICATION_INTERVIEW_CARD,
  },

  CAREER_INTERVIEW_INVITE: {
    eventId: PulseEvent.INTERVIEW_SCHEDULED,
    affectedUserRole: "employee",
    domain: "career",
    severity: "urgent",
    chain: [
      "employee-home-career-card",
      "career-dashboard-applications",
      "career-funnel-interviews",
    ],
    targetSectionId: PulseSectionId.EMPLOYEE_APPLICATION_INTERVIEW_CARD,
  },

  CAREER_OFFER_RECEIVED: {
    eventId: PulseEvent.OFFER_RECEIVED,
    affectedUserRole: "employee",
    domain: "career",
    severity: "urgent",
    chain: [
      "employee-home-career-card",
      "career-dashboard-applications",
      "career-applications-offers",
    ],
    targetSectionId: PulseSectionId.EMPLOYEE_APPLICATION_OFFER_CARD,
  },

  CAREER_OFFER_EXTENDED: {
    eventId: PulseEvent.OFFER_RECEIVED,
    affectedUserRole: "employee",
    domain: "career",
    severity: "urgent",
    chain: [
      "employee-home-career-card",
      "career-dashboard-applications",
      "career-applications-offers",
    ],
    targetSectionId: PulseSectionId.EMPLOYEE_APPLICATION_OFFER_CARD,
  },

  CAREER_OFFER_ACCEPTED: {
    eventId: PulseEvent.APPLICATION_RECEIVED,
    affectedUserRole: "employer",
    domain: "career",
    severity: "success",
    chain: ["home-career-card", "career-dashboard-applications"],
  },

  CAREER_OFFER_REJECTED: {
    eventId: PulseEvent.APPLICATION_RECEIVED,
    affectedUserRole: "employer",
    domain: "career",
    severity: "warning",
    chain: ["home-career-card", "career-dashboard-applications"],
  },

  SYSTEM_ALERT: {
    eventId: PulseEvent.PROFILE_UPDATE_NEEDED,
    affectedUserRole: "employee",
    domain: "system",
    severity: "warning",
    chain: ["topbar-notification-icon", "system-alerts-list"],
  },

  // ── Employer: Shift workforce events ────────────────────────────────────────
  SHIFT_WORKER_CONFIRMED: {
    eventId: PulseEvent.SHIFT_WORKER_CONFIRMED,
    affectedUserRole: "employer",
    domain: "shift",
    severity: "success",
    chain: ["home-shift-card", "shift-dashboard-applications", "employer-shift-confirmed-roster"],
    targetSectionId: PulseSectionId.EMPLOYER_SHIFT_CONFIRMED_ROSTER,
  },

  SHIFT_WORKER_CANCELLED: {
    eventId: PulseEvent.SHIFT_WORKER_CANCELLED,
    affectedUserRole: "employer",
    domain: "shift",
    severity: "urgent",
    chain: ["home-shift-card", "shift-dashboard-applications", "employer-shift-replacement-needed"],
    targetSectionId: PulseSectionId.EMPLOYER_SHIFT_REPLACEMENT_NEEDED,
  },

  SHIFT_POST_COMPLETED: {
    eventId: PulseEvent.SHIFT_POST_COMPLETED,
    affectedUserRole: "employer",
    domain: "shift",
    severity: "success",
    chain: ["home-shift-card", "shift-dashboard-applications", "employer-shift-completed-card"],
    targetSectionId: PulseSectionId.EMPLOYER_SHIFT_COMPLETED_CARD,
  },

  SHIFT_PLAN_CANCELLED_CONFIRMED_WORKER: {
    eventId: PulseEvent.SHIFT_PLAN_CANCELLED_CONFIRMED_WORKER,
    affectedUserRole: "employee",
    domain: "shift",
    severity: "urgent",
    chain: [
      "employee-home-shift-card",
      "employee-planner-applications",
      "employee-shift-plan-cancelled-card",
    ],
    targetSectionId: PulseSectionId.EMPLOYEE_SHIFT_PLAN_CANCELLED_CARD,
  },

  PLAN_CANCELLED: {
    eventId: PulseEvent.PLAN_CANCELLED,
    affectedUserRole: "employee",
    domain: "shift",
    severity: "warning",
    chain: [
      "employee-home-shift-card",
      "employee-planner-applications",
      "employee-plan-cancelled-card",
    ],
    targetSectionId: PulseSectionId.EMPLOYEE_PLAN_CANCELLED_CARD,
  },

  // ── Employer: Career interview response ─────────────────────────────────────
  CAREER_INTERVIEW_ACCEPTED: {
    eventId: PulseEvent.INTERVIEW_ACCEPTED,
    affectedUserRole: "employer",
    domain: "career",
    severity: "success",
    chain: ["home-career-card", "career-dashboard-applications"],
  },

  CAREER_INTERVIEW_DECLINED: {
    eventId: PulseEvent.INTERVIEW_DECLINED,
    affectedUserRole: "employer",
    domain: "career",
    severity: "warning",
    chain: ["home-career-card", "career-dashboard-applications"],
  },

  REVIEW_RECEIVED: {
    eventId: PulseEvent.REVIEW_RECEIVED,
    affectedUserRole: "employee",
    domain: "career",
    severity: "warning",
    chain: ["topbar-notification-icon", "employee-review-center"],
  },

  EMPLOYMENT_JOINED: {
    eventId: PulseEvent.EMPLOYMENT_JOINED,
    affectedUserRole: "employee",
    domain: "employment",
    severity: "success",
    chain: ["employee-home-career-card", "employee-career-home"],
  },

  EMPLOYMENT_RESIGNATION_SUBMITTED: {
    eventId: PulseEvent.EMPLOYMENT_RESIGNATION_SUBMITTED,
    affectedUserRole: "employer",
    domain: "employment",
    severity: "warning",
    chain: ["home-career-card", "employer-career-home"],
  },

  EMPLOYMENT_RESIGNATION_WITHDRAWN: {
    eventId: PulseEvent.EMPLOYMENT_RESIGNATION_WITHDRAWN,
    affectedUserRole: "employer",
    domain: "employment",
    severity: "info",
    chain: ["home-career-card", "employer-career-home"],
  },

  EMPLOYMENT_RESIGNATION_CONFIRMED: {
    eventId: PulseEvent.EMPLOYMENT_RESIGNATION_CONFIRMED,
    affectedUserRole: "employee",
    domain: "employment",
    severity: "warning",
    chain: ["employee-home-career-card", "employee-career-home"],
  },

  EMPLOYMENT_TERMINATED: {
    eventId: PulseEvent.EMPLOYMENT_TERMINATED,
    affectedUserRole: "employee",
    domain: "employment",
    severity: "urgent",
    chain: ["employee-home-career-card", "employee-career-home"],
  },

  EMPLOYMENT_FORCE_COMPLETED: {
    eventId: PulseEvent.EMPLOYMENT_FORCE_COMPLETED,
    affectedUserRole: "employer",
    domain: "employment",
    severity: "warning",
    chain: ["home-career-card", "employer-career-home"],
  },
} as const;
