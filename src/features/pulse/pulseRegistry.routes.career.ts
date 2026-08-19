/** Job Mitra | pulseRegistry.routes.career.ts | src/features/pulse/pulseRegistry.routes.career.ts */

import { PulseEvent } from "./pulseEvents";
import type { PulseBackendEventType, PulseRouteDefinition } from "./pulseRegistry.eventTypes";
import { PulseSectionId } from "./pulseSectionIds";

export const PULSE_EVENT_ROUTES_CAREER: Partial<
  Record<PulseBackendEventType, PulseRouteDefinition>
> = {
  CAREER_APPLICATION_SUBMITTED: {
    eventId: PulseEvent.APPLICATION_RECEIVED,
    affectedUserRole: "employer",
    domain: "career",
    severity: "info",
    chain: ["home-career-card", "career-dashboard-applications"],
  },

  CAREER_NEW_APPLICATION: {
    eventId: PulseEvent.APPLICATION_RECEIVED,
    affectedUserRole: "employer",
    domain: "career",
    severity: "info",
    chain: ["home-career-card", "career-dashboard-applications"],
  },

  CAREER_EMPLOYEE_SHORTLISTED: {
    eventId: PulseEvent.SHORTLISTED,
    affectedUserRole: "employee",
    domain: "career",
    severity: "warning",
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
    severity: "warning",
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
    severity: "warning",
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
    severity: "warning",
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
    severity: "warning",
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
} as const;
