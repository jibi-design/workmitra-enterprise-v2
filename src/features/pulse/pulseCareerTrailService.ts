/** Job Mitra | pulseCareerTrailService.ts | src/features/pulse/pulseCareerTrailService.ts */

import { ROUTE_PATHS } from "../../app/router/routePaths";

import { PulseEvent, PulseSectionId } from "./pulseRegistry";
import { usePulseStore } from "./pulseStore";
import {
  hasValidPostAndApp,
  normalizePulseId,
  warnInvalidPulseTrail,
} from "./pulseTrailValidation";

export interface StartCareerApplicationReceivedPulseTrailInput {
  readonly postId: string;
  readonly appId: string;
}

export interface StartCareerCandidateStatusPulseTrailInput {
  readonly postId: string;
  readonly appId: string;
}

export function startCareerApplicationReceivedPulseTrail(
  input: StartCareerApplicationReceivedPulseTrailInput,
): void {
  const postId = normalizePulseId(input.postId);
  const appId = normalizePulseId(input.appId);

  if (!hasValidPostAndApp(postId, appId)) {
    warnInvalidPulseTrail(
      "[Pulse System]: Career application trail not started because postId/appId is missing.",
    );

    return;
  }

  usePulseStore.getState().startPulseTrail({
    eventId: PulseEvent.APPLICATION_RECEIVED,
    domain: "career",
    targetPath: ROUTE_PATHS.employerCareerCandidateDetail,
    targetParams: {
      postId,
      appId,
    },
  });
}

export function startCareerShortlistedPulseTrail(
  input: StartCareerCandidateStatusPulseTrailInput,
): void {
  const postId = normalizePulseId(input.postId);
  const appId = normalizePulseId(input.appId);

  if (!hasValidPostAndApp(postId, appId)) {
    warnInvalidPulseTrail(
      "[Pulse System]: Shortlisted trail not started because postId/appId is missing.",
    );

    return;
  }

  usePulseStore.getState().startPulseTrail({
    eventId: PulseEvent.SHORTLISTED,
    domain: "career",
    targetPath: ROUTE_PATHS.employeeCareerApplications,
    targetParams: {
      postId,
      appId,
      sectionId: PulseSectionId.EMPLOYEE_APPLICATION_SHORTLISTED_CARD,
    },
  });
}

export function startCareerInterviewScheduledPulseTrail(
  input: StartCareerCandidateStatusPulseTrailInput,
): void {
  const postId = normalizePulseId(input.postId);
  const appId = normalizePulseId(input.appId);

  if (!hasValidPostAndApp(postId, appId)) {
    warnInvalidPulseTrail(
      "[Pulse System]: Interview trail not started because postId/appId is missing.",
    );

    return;
  }

  usePulseStore.getState().startPulseTrail({
    eventId: PulseEvent.INTERVIEW_SCHEDULED,
    domain: "career",
    targetPath: ROUTE_PATHS.employeeCareerApplications,
    targetParams: {
      postId,
      appId,
      sectionId: PulseSectionId.EMPLOYEE_APPLICATION_INTERVIEW_CARD,
    },
  });
}

export function startCareerOfferReceivedPulseTrail(
  input: StartCareerCandidateStatusPulseTrailInput,
): void {
  const postId = normalizePulseId(input.postId);
  const appId = normalizePulseId(input.appId);

  if (!hasValidPostAndApp(postId, appId)) {
    warnInvalidPulseTrail(
      "[Pulse System]: Offer trail not started because postId/appId is missing.",
    );

    return;
  }

  usePulseStore.getState().startPulseTrail({
    eventId: PulseEvent.OFFER_RECEIVED,
    domain: "career",
    targetPath: ROUTE_PATHS.employeeCareerApplications,
    targetParams: {
      postId,
      appId,
      sectionId: PulseSectionId.EMPLOYEE_APPLICATION_OFFER_CARD,
    },
  });
}
