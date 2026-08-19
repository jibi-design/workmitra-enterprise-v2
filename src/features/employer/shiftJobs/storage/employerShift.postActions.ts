// Facade — employerShift.postActions.ts
//
// Function wrappers avoid Rollup reexport circular-chunk warnings for crud exports.
// Keep this facade free of const rebinds that participate in planner bridge cycles.

import {
  deleteEmployerShiftPost as deleteEmployerShiftPostImpl,
  getEmployerShiftPost as getEmployerShiftPostImpl,
  getEmployerShiftPosts as getEmployerShiftPostsImpl,
  saveEmployerShiftPost as saveEmployerShiftPostImpl,
  setEmployerShiftHidden as setEmployerShiftHiddenImpl,
  updateEmployerShiftPost as updateEmployerShiftPostImpl,
} from "./employerShift.postActions.crud";
import {
  resetEmployerShiftAnalysis as resetEmployerShiftAnalysisImpl,
  runEmployerShiftAnalysis as runEmployerShiftAnalysisImpl,
} from "./employerShift.postActions.analysis";
import {
  broadcastEmployerShiftWorkspace as broadcastEmployerShiftWorkspaceImpl,
  confirmEmployerShiftCandidate as confirmEmployerShiftCandidateImpl,
  rejectEmployerShiftCandidate as rejectEmployerShiftCandidateImpl,
  replaceEmployerShiftCandidate as replaceEmployerShiftCandidateImpl,
  shortlistEmployerShiftCandidate as shortlistEmployerShiftCandidateImpl,
  waitlistEmployerShiftCandidate as waitlistEmployerShiftCandidateImpl,
} from "./employerShift.postActions.candidates";

export function deleteEmployerShiftPost(
  ...args: Parameters<typeof deleteEmployerShiftPostImpl>
): ReturnType<typeof deleteEmployerShiftPostImpl> {
  return deleteEmployerShiftPostImpl(...args);
}

export function getEmployerShiftPost(
  ...args: Parameters<typeof getEmployerShiftPostImpl>
): ReturnType<typeof getEmployerShiftPostImpl> {
  return getEmployerShiftPostImpl(...args);
}

export function getEmployerShiftPosts(
  ...args: Parameters<typeof getEmployerShiftPostsImpl>
): ReturnType<typeof getEmployerShiftPostsImpl> {
  return getEmployerShiftPostsImpl(...args);
}

export function saveEmployerShiftPost(
  ...args: Parameters<typeof saveEmployerShiftPostImpl>
): ReturnType<typeof saveEmployerShiftPostImpl> {
  return saveEmployerShiftPostImpl(...args);
}

export function setEmployerShiftHidden(
  ...args: Parameters<typeof setEmployerShiftHiddenImpl>
): ReturnType<typeof setEmployerShiftHiddenImpl> {
  return setEmployerShiftHiddenImpl(...args);
}

export function updateEmployerShiftPost(
  ...args: Parameters<typeof updateEmployerShiftPostImpl>
): ReturnType<typeof updateEmployerShiftPostImpl> {
  return updateEmployerShiftPostImpl(...args);
}

export function resetEmployerShiftAnalysis(
  ...args: Parameters<typeof resetEmployerShiftAnalysisImpl>
): ReturnType<typeof resetEmployerShiftAnalysisImpl> {
  return resetEmployerShiftAnalysisImpl(...args);
}

export function runEmployerShiftAnalysis(
  ...args: Parameters<typeof runEmployerShiftAnalysisImpl>
): ReturnType<typeof runEmployerShiftAnalysisImpl> {
  return runEmployerShiftAnalysisImpl(...args);
}

export function broadcastEmployerShiftWorkspace(
  ...args: Parameters<typeof broadcastEmployerShiftWorkspaceImpl>
): ReturnType<typeof broadcastEmployerShiftWorkspaceImpl> {
  return broadcastEmployerShiftWorkspaceImpl(...args);
}

export function confirmEmployerShiftCandidate(
  ...args: Parameters<typeof confirmEmployerShiftCandidateImpl>
): ReturnType<typeof confirmEmployerShiftCandidateImpl> {
  return confirmEmployerShiftCandidateImpl(...args);
}

export function rejectEmployerShiftCandidate(
  ...args: Parameters<typeof rejectEmployerShiftCandidateImpl>
): ReturnType<typeof rejectEmployerShiftCandidateImpl> {
  return rejectEmployerShiftCandidateImpl(...args);
}

export function replaceEmployerShiftCandidate(
  ...args: Parameters<typeof replaceEmployerShiftCandidateImpl>
): ReturnType<typeof replaceEmployerShiftCandidateImpl> {
  return replaceEmployerShiftCandidateImpl(...args);
}

export function shortlistEmployerShiftCandidate(
  ...args: Parameters<typeof shortlistEmployerShiftCandidateImpl>
): ReturnType<typeof shortlistEmployerShiftCandidateImpl> {
  return shortlistEmployerShiftCandidateImpl(...args);
}

export function waitlistEmployerShiftCandidate(
  ...args: Parameters<typeof waitlistEmployerShiftCandidateImpl>
): ReturnType<typeof waitlistEmployerShiftCandidateImpl> {
  return waitlistEmployerShiftCandidateImpl(...args);
}
