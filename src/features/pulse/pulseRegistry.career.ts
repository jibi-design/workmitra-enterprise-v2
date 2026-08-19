/** Job Mitra | pulseRegistry.career.ts | src/features/pulse/pulseRegistry.career.ts */

import { ROUTE_PATHS } from "../../app/router/routePaths";
import { PulseEvent } from "./pulseEvents";
import { PULSE_VISUAL_TOKENS } from "./pulseRegistryTokens";
import type { PulseConfig } from "./pulseRegistryTypes";
import { PulseSectionId } from "./pulseSectionIds";

export const PULSE_REGISTRY_CAREER = {
  [PulseEvent.APPLICATION_RECEIVED]: {
    ...PULSE_VISUAL_TOKENS.INFO,
    domain: "career",
    resolutionType: "ROUTE",
    targetPath: ROUTE_PATHS.employerCareerCandidateDetail,
  },

  [PulseEvent.SHORTLISTED]: {
    ...PULSE_VISUAL_TOKENS.WARNING,
    domain: "career",
    resolutionType: "INTERACTION",
    targetPath: ROUTE_PATHS.employeeCareerApplications,
    targetSectionId: PulseSectionId.EMPLOYEE_APPLICATION_SHORTLISTED_CARD,
  },

  [PulseEvent.INTERVIEW_SCHEDULED]: {
    ...PULSE_VISUAL_TOKENS.WARNING,
    domain: "career",
    resolutionType: "INTERACTION",
    targetPath: ROUTE_PATHS.employeeCareerApplications,
    targetSectionId: PulseSectionId.EMPLOYEE_APPLICATION_INTERVIEW_CARD,
  },

  [PulseEvent.OFFER_RECEIVED]: {
    ...PULSE_VISUAL_TOKENS.WARNING,
    domain: "career",
    resolutionType: "INTERACTION",
    targetPath: ROUTE_PATHS.employeeCareerApplications,
    targetSectionId: PulseSectionId.EMPLOYEE_APPLICATION_OFFER_CARD,
  },

  [PulseEvent.INTERVIEW_ACCEPTED]: {
    ...PULSE_VISUAL_TOKENS.SUCCESS,
    domain: "career",
    resolutionType: "ROUTE",
    targetPath: ROUTE_PATHS.employerCareerCandidateDetail,
  },

  [PulseEvent.INTERVIEW_DECLINED]: {
    ...PULSE_VISUAL_TOKENS.WARNING,
    domain: "career",
    resolutionType: "ROUTE",
    targetPath: ROUTE_PATHS.employerCareerCandidateDetail,
  },
} as const satisfies Partial<Record<PulseEvent, PulseConfig>>;
