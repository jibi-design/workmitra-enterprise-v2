// App name: Job Mitra
// File name: shiftPostApply.selectors.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\hooks\shiftPostApply\shiftPostApply.selectors.ts

import type { ShiftApplyCardStatus } from "../../components/ShiftApplyJobCard";

export type ShiftPostSubmitBlockReasonInput = {
  readonly isClosedOrExpired: boolean;
  readonly hasWorkspace: boolean;
  readonly isConfirmed: boolean;
  readonly isApplied: boolean;
  readonly isShortlisted: boolean;
  readonly isWaiting: boolean;
  readonly mustGateOk: boolean;
  readonly allQuestionsAnswered: boolean;
  readonly quickQuestionCount: number;
};

export type ShiftApplyCardStatusInput = {
  readonly hasWorkspace: boolean;
  readonly isConfirmed: boolean;
  readonly isShortlisted: boolean;
  readonly isWaiting: boolean;
  readonly isApplied: boolean;
  readonly isWithdrawn: boolean;
};

export function getShiftPostSubmitBlockReason({
  isClosedOrExpired,
  hasWorkspace,
  isConfirmed,
  isApplied,
  isShortlisted,
  isWaiting,
  mustGateOk,
  allQuestionsAnswered,
  quickQuestionCount,
}: ShiftPostSubmitBlockReasonInput): string {
  if (isClosedOrExpired) {
    return "This shift is closed or expired. Applications are no longer available.";
  }

  if (hasWorkspace) {
    return "This shift already has an active workspace for you. Open the workspace instead of applying again.";
  }

  if (isConfirmed) {
    return "You are already selected for this shift. You cannot submit another application.";
  }

  if (isApplied) {
    return "You have already applied for this shift. Check your application status instead.";
  }

  if (isShortlisted) {
    return "You are already shortlisted for this shift. No new application is needed.";
  }

  if (isWaiting) {
    return "You are already on the waiting list for this shift. No new application is needed.";
  }

  if (!mustGateOk) {
    return "To apply, all minimum requirements must be marked as Meets.";
  }

  if (!allQuestionsAnswered && quickQuestionCount > 0) {
    return "Please answer all quick questions before submitting your application.";
  }

  return "";
}

export function getShiftApplyCardStatus({
  hasWorkspace,
  isConfirmed,
  isShortlisted,
  isWaiting,
  isApplied,
  isWithdrawn,
}: ShiftApplyCardStatusInput): ShiftApplyCardStatus {
  if (hasWorkspace) return "workspace_ready";
  if (isConfirmed) return "selected";
  if (isShortlisted) return "shortlisted";
  if (isWaiting) return "waiting";
  if (isApplied) return "applied";
  if (isWithdrawn) return "withdrawn";
  return "none";
}
