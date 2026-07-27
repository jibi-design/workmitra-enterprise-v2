/** Job Mitra | pulseRegistry.routes.shift.ts | src/features/pulse/pulseRegistry.routes.shift.ts */

import { PulseEvent } from "./pulseEvents";
import type { PulseBackendEventType, PulseRouteDefinition } from "./pulseRegistry.eventTypes";
import { PulseSectionId } from "./pulseSectionIds";

export const PULSE_EVENT_ROUTES_SHIFT: Partial<
  Record<PulseBackendEventType, PulseRouteDefinition>
> = {
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
} as const;
