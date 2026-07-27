/** Job Mitra | pulseRegistry.system.ts | src/features/pulse/pulseRegistry.system.ts */

import { ROUTE_PATHS } from "../../app/router/routePaths";
import { PulseEvent } from "./pulseEvents";
import { PULSE_VISUAL_TOKENS } from "./pulseRegistryTokens";
import type { PulseConfig } from "./pulseRegistryTypes";

export const PULSE_REGISTRY_SYSTEM = {
  [PulseEvent.PROFILE_UPDATE_NEEDED]: {
    ...PULSE_VISUAL_TOKENS.WARNING,
    duration: "2s",
    resolutionType: "ROUTE",
    targetPath: ROUTE_PATHS.employeeProfile,
  },

  [PulseEvent.REVIEW_RECEIVED]: {
    ...PULSE_VISUAL_TOKENS.WARNING,
    duration: "2s",
    resolutionType: "ROUTE",
    targetPath: ROUTE_PATHS.employeeReviewCenter,
  },
} as const satisfies Partial<Record<PulseEvent, PulseConfig>>;
