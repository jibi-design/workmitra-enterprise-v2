/** Job Mitra | pulseRegistry.shift.ts | src/features/pulse/pulseRegistry.shift.ts */

import { ROUTE_PATHS } from "../../app/router/routePaths";
import { PulseEvent } from "./pulseEvents";
import { PULSE_VISUAL_TOKENS } from "./pulseRegistryTokens";
import type { PulseConfig } from "./pulseRegistryTypes";
import { PulseSectionId } from "./pulseSectionIds";

export const PULSE_REGISTRY_SHIFT = {
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
} as const satisfies Partial<Record<PulseEvent, PulseConfig>>;
