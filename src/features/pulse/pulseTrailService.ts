/** Job Mitra | pulseTrailService.ts | src/features/pulse/pulseTrailService.ts */

/**
 * Pulse Trail public API.
 * Keep this file as a small compatibility layer so existing imports do not break.
 */

export type {
  StartCareerApplicationReceivedPulseTrailInput,
  StartCareerCandidateStatusPulseTrailInput,
} from "./pulseCareerTrailService";

export {
  startCareerApplicationReceivedPulseTrail,
  startCareerInterviewScheduledPulseTrail,
  startCareerOfferReceivedPulseTrail,
  startCareerShortlistedPulseTrail,
} from "./pulseCareerTrailService";

export type { StartShiftPulseTrailInput } from "./pulseShiftTrailService";

export {
  startShiftApplicationReceivedPulseTrail,
  startShiftConfirmationRequiredPulseTrail,
  startShiftShortlistedPulseTrail,
  startShiftWaitlistedPulseTrail,
} from "./pulseShiftTrailService";
