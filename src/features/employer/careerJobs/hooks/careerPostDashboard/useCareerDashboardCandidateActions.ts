// App name: Job Mitra
// File name: useCareerDashboardCandidateActions.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\hooks\careerPostDashboard\useCareerDashboardCandidateActions.ts

import {
  createCareerCandidateActionContext,
  type UseCareerDashboardCandidateActionsArgs,
} from "./useCareerDashboardCandidateActions.helpers";
import { createCareerDashboardPipelineActions } from "./useCareerDashboardCandidateActions.pipeline";
import { createCareerDashboardInterviewOfferActions } from "./useCareerDashboardCandidateActions.interviewOffer";

export function useCareerDashboardCandidateActions(args: UseCareerDashboardCandidateActionsArgs) {
  const ctx = createCareerCandidateActionContext(args);
  const pipeline = createCareerDashboardPipelineActions(ctx);
  const interviewOffer = createCareerDashboardInterviewOfferActions(ctx);

  return {
    ...pipeline,
    ...interviewOffer,
  };
}
