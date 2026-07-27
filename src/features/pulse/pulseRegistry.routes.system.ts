/** Job Mitra | pulseRegistry.routes.system.ts | src/features/pulse/pulseRegistry.routes.system.ts */

import { PulseEvent } from "./pulseEvents";
import type { PulseBackendEventType, PulseRouteDefinition } from "./pulseRegistry.eventTypes";

export const PULSE_EVENT_ROUTES_SYSTEM: Partial<
  Record<PulseBackendEventType, PulseRouteDefinition>
> = {
  SYSTEM_ALERT: {
    eventId: PulseEvent.PROFILE_UPDATE_NEEDED,
    affectedUserRole: "employee",
    domain: "system",
    severity: "warning",
    chain: ["topbar-notification-icon", "system-alerts-list"],
  },

  REVIEW_RECEIVED: {
    eventId: PulseEvent.REVIEW_RECEIVED,
    affectedUserRole: "employee",
    domain: "career",
    severity: "warning",
    chain: ["topbar-notification-icon", "employee-review-center"],
  },
} as const;
