// App name: Job Mitra
// File name: useEmployerCandidateDetailState.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\hooks\useEmployerCandidateDetailState.ts

import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { ratingStorage } from "../../../../shared/rating/ratingStorage";
import {
  cleanRequirementList,
  getCandidateDisplayId,
} from "../helpers/employerCandidateDetail.helpers";
import { getAppsSnapshot, getPostsSnapshot } from "../helpers/dashboardHelpers";

export function useEmployerCandidateDetailState() {
  const { postId = "", appId = "" } = useParams();

  const app = useMemo(() => {
    const all = getAppsSnapshot();
    return all.find((item) => item.id === appId && item.postId === postId) ?? null;
  }, [postId, appId]);

  const post = useMemo(() => {
    const all = getPostsSnapshot();
    return all.find((item) => item.id === postId) ?? null;
  }, [postId]);

  const mustHave = useMemo(() => cleanRequirementList(post?.mustHave), [post]);
  const goodToHave = useMemo(() => cleanRequirementList(post?.goodToHave), [post]);

  const displayId = app ? getCandidateDisplayId(app) : "";

  // Shift application view uses snapshot only — not the logged-in profile store.
  const workerMlId = app?.profileSnapshot?.uniqueId ?? "";
  const workerRating = useMemo(
    () => (workerMlId ? ratingStorage.getWorkerSummary(workerMlId) : null),
    [workerMlId],
  );

  return {
    app,
    post,
    mustHave,
    goodToHave,
    displayId,
    workerMlId,
    workerRating,
  };
}
