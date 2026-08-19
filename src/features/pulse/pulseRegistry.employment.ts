/** Job Mitra | pulseRegistry.employment.ts | src/features/pulse/pulseRegistry.employment.ts */

import { ROUTE_PATHS } from "../../app/router/routePaths";
import { PulseEvent } from "./pulseEvents";
import { PULSE_VISUAL_TOKENS } from "./pulseRegistryTokens";
import type { PulseConfig } from "./pulseRegistryTypes";

export const PULSE_REGISTRY_EMPLOYMENT = {
  [PulseEvent.EMPLOYMENT_JOINED]: {
    ...PULSE_VISUAL_TOKENS.SUCCESS,
    domain: "employment",
    resolutionType: "ROUTE",
    targetPath: ROUTE_PATHS.employeeCareerHome,
  },

  [PulseEvent.EMPLOYMENT_RESIGNATION_SUBMITTED]: {
    ...PULSE_VISUAL_TOKENS.WARNING,
    domain: "employment",
    resolutionType: "ROUTE",
    targetPath: ROUTE_PATHS.employerCareerHome,
  },

  [PulseEvent.EMPLOYMENT_RESIGNATION_WITHDRAWN]: {
    ...PULSE_VISUAL_TOKENS.INFO,
    domain: "employment",
    resolutionType: "ROUTE",
    targetPath: ROUTE_PATHS.employerCareerHome,
  },

  [PulseEvent.EMPLOYMENT_RESIGNATION_CONFIRMED]: {
    ...PULSE_VISUAL_TOKENS.WARNING,
    domain: "employment",
    resolutionType: "ROUTE",
    targetPath: ROUTE_PATHS.employeeCareerHome,
  },

  [PulseEvent.EMPLOYMENT_TERMINATED]: {
    ...PULSE_VISUAL_TOKENS.CRITICAL,
    domain: "employment",
    resolutionType: "ROUTE",
    targetPath: ROUTE_PATHS.employeeCareerHome,
  },

  [PulseEvent.EMPLOYMENT_FORCE_COMPLETED]: {
    ...PULSE_VISUAL_TOKENS.WARNING,
    domain: "employment",
    resolutionType: "ROUTE",
    targetPath: ROUTE_PATHS.employerCareerHome,
  },
} as const satisfies Partial<Record<PulseEvent, PulseConfig>>;
