// App name: Job Mitra
// File name: careerPipelineService.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\services\careerPipelineService.ts

import {
  CAREER_ACTIVITY_CHANGED,
  CAREER_APPS_CHANGED,
  CAREER_POSTS_CHANGED,
  CAREER_WORKSPACES_CHANGED,
} from "../helpers/careerStorageUtils";

export {
  moveInterviewCandidateToShortlist,
  rejectCandidate,
  removeCandidateFromShortlist,
  shortlistCandidate,
} from "./careerCandidateActionService";

export { recordInterviewResult, scheduleInterview } from "./careerInterviewService";

export { hireCandidate, sendOffer } from "./careerOfferHireService";

export { updateEmployerNotes } from "./careerNotesService";

export { createCareerWorkspace } from "./careerWorkspaceService";

export const CAREER_EVENTS = {
  careerPostsChanged: CAREER_POSTS_CHANGED,
  careerAppsChanged: CAREER_APPS_CHANGED,
  careerWorkspacesChanged: CAREER_WORKSPACES_CHANGED,
  careerActivityChanged: CAREER_ACTIVITY_CHANGED,
} as const;
