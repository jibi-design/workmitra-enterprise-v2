/** Hook — live Candidate Pro dashboard data from career/profile stores. */

import { useSyncExternalStore } from "react";
import {
  getAppsSnapshot,
  subscribeApps,
} from "../../careerJobs/helpers/careerApplicationHelpers";
import {
  getCareerSearchSnapshot,
  getDiscoverableCareerPosts,
  subscribeCareerSearch,
} from "../../careerJobs/helpers/careerSearchHelpers";
import { employeeCareerSavedJobsStorage } from "../../careerJobs/storage/employeeCareerSavedJobs.storage";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import {
  buildPipelineRows,
  buildRecommendations,
  computeCandidateMetrics,
  computeProfileCompleteness,
  type CandidateMetrics,
  type CandidatePipelineRow,
  type CandidateRecommendation,
  type ProfileCompleteness,
} from "../helpers/candidateDashboard.helpers";
import { computeCareerFunnel } from "../helpers/dailyOs.helpers";
import type { CareerFunnelCounts } from "../helpers/dailyOs.types";
import { tryDomainRead } from "../helpers/dailyOs.viewState.helpers";

export type CandidateDashboardModel = {
  readonly metrics: CandidateMetrics;
  readonly funnel: CareerFunnelCounts;
  readonly pipeline: readonly CandidatePipelineRow[];
  readonly recommendations: readonly CandidateRecommendation[];
  readonly completeness: ProfileCompleteness;
  readonly error: string | null;
};

const EMPTY_MODEL: CandidateDashboardModel = {
  metrics: { applied: 0, shortlisted: 0, interviews: 0, saved: 0 },
  funnel: { applied: 0, shortlisted: 0, interview: 0, offer: 0 },
  pipeline: [],
  recommendations: [],
  completeness: { percent: 0, missing: [], filled: 0, total: 0 },
  error: null,
};

function computeModel(): CandidateDashboardModel {
  const read = tryDomainRead(() => {
    const apps = getAppsSnapshot();
    const posts = getDiscoverableCareerPosts(getCareerSearchSnapshot());
    const postsById = new Map(posts.map((p) => [p.id, p]));
    const savedIds = employeeCareerSavedJobsStorage.getIds();
    const profile = employeeProfileStorage.get();
    const appliedIds = new Set(apps.map((a) => a.jobId));
    return {
      metrics: computeCandidateMetrics(apps, savedIds.length),
      funnel: computeCareerFunnel(apps),
      pipeline: buildPipelineRows(apps, postsById, 8),
      recommendations: buildRecommendations(profile, posts, appliedIds, 2),
      completeness: computeProfileCompleteness(profile),
      error: null,
    };
  }, EMPTY_MODEL);
  return { ...read.value, error: read.error };
}

let snapshot: CandidateDashboardModel = computeModel();

function subscribeAll(onStoreChange: () => void): () => void {
  const refresh = () => {
    snapshot = computeModel();
    onStoreChange();
  };
  const unsubApps = subscribeApps(refresh);
  const unsubSearch = subscribeCareerSearch(refresh);
  const unsubSaved = employeeCareerSavedJobsStorage.subscribe(refresh);
  const unsubProfile = employeeProfileStorage.subscribe(refresh);
  window.addEventListener("storage", refresh);
  return () => {
    unsubApps();
    unsubSearch();
    unsubSaved();
    unsubProfile();
    window.removeEventListener("storage", refresh);
  };
}

function getSnapshot(): CandidateDashboardModel {
  return snapshot;
}

export function useCandidateDashboardModel(): CandidateDashboardModel {
  return useSyncExternalStore(subscribeAll, getSnapshot, getSnapshot);
}
