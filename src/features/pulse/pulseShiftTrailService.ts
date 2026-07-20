/** Job Mitra | pulseShiftTrailService.ts | src/features/pulse/pulseShiftTrailService.ts */

import { ROUTE_PATHS } from "../../app/router/routePaths";

import { PulseEvent, PulseSectionId } from "./pulseRegistry";
import { usePulseStore } from "./pulseStore";
import {
  hasValidPostAndApp,
  normalizePulseId,
  warnInvalidPulseTrail,
} from "./pulseTrailValidation";

export interface StartShiftPulseTrailInput {
  readonly postId: string;
  readonly appId: string;
}

export function startShiftApplicationReceivedPulseTrail(input: StartShiftPulseTrailInput): void {
  const postId = normalizePulseId(input.postId);
  const appId = normalizePulseId(input.appId);

  if (!hasValidPostAndApp(postId, appId)) {
    warnInvalidPulseTrail(
      "[Pulse System]: Shift application trail not started because postId/appId is missing.",
    );

    return;
  }

  usePulseStore.getState().startPulseTrail({
    eventId: PulseEvent.SHIFT_APPLICATION_RECEIVED,
    domain: "shift",
    targetPath: ROUTE_PATHS.employerShiftPostDashboard,
    targetParams: {
      postId,
      appId,
      sectionId: PulseSectionId.EMPLOYER_SHIFT_APPLICATION_CARD,
    },
  });
}

export function startShiftShortlistedPulseTrail(input: StartShiftPulseTrailInput): void {
  const postId = normalizePulseId(input.postId);
  const appId = normalizePulseId(input.appId);

  if (!hasValidPostAndApp(postId, appId)) {
    warnInvalidPulseTrail(
      "[Pulse System]: Shift shortlisted trail not started because postId/appId is missing.",
    );

    return;
  }

  usePulseStore.getState().startPulseTrail({
    eventId: PulseEvent.SHIFT_SHORTLISTED,
    domain: "shift",
    targetPath: ROUTE_PATHS.employeeShiftApplications,
    targetParams: {
      postId,
      appId,
      sectionId: PulseSectionId.EMPLOYEE_SHIFT_SHORTLISTED_CARD,
    },
  });
}

export function startShiftWaitlistedPulseTrail(input: StartShiftPulseTrailInput): void {
  const postId = normalizePulseId(input.postId);
  const appId = normalizePulseId(input.appId);

  if (!hasValidPostAndApp(postId, appId)) {
    warnInvalidPulseTrail(
      "[Pulse System]: Shift waitlisted trail not started because postId/appId is missing.",
    );

    return;
  }

  usePulseStore.getState().startPulseTrail({
    eventId: PulseEvent.SHIFT_WAITLISTED,
    domain: "shift",
    targetPath: ROUTE_PATHS.employeeShiftApplications,
    targetParams: {
      postId,
      appId,
      sectionId: PulseSectionId.EMPLOYEE_SHIFT_WAITLISTED_CARD,
    },
  });
}

export function startShiftConfirmationRequiredPulseTrail(input: StartShiftPulseTrailInput): void {
  const postId = normalizePulseId(input.postId);
  const appId = normalizePulseId(input.appId);

  if (!hasValidPostAndApp(postId, appId)) {
    warnInvalidPulseTrail(
      "[Pulse System]: Shift confirmation trail not started because postId/appId is missing.",
    );

    return;
  }

  usePulseStore.getState().startPulseTrail({
    eventId: PulseEvent.SHIFT_CONFIRMATION_REQUIRED,
    domain: "shift",
    targetPath: ROUTE_PATHS.employeeShiftApplications,
    targetParams: {
      postId,
      appId,
      sectionId: PulseSectionId.EMPLOYEE_SHIFT_CONFIRMATION_CARD,
    },
  });
}
