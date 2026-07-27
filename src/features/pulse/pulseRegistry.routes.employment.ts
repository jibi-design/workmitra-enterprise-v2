/** Job Mitra | pulseRegistry.routes.employment.ts | src/features/pulse/pulseRegistry.routes.employment.ts */

import { PulseEvent } from "./pulseEvents";
import type { PulseBackendEventType, PulseRouteDefinition } from "./pulseRegistry.eventTypes";

export const PULSE_EVENT_ROUTES_EMPLOYMENT: Partial<
  Record<PulseBackendEventType, PulseRouteDefinition>
> = {
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
