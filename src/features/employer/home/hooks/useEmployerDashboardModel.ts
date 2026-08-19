/** Live Employer Pro dashboard model from career posts/apps snapshots. */

import { useMemo, useSyncExternalStore } from "react";
import {
  getCareerAppsSnapshot,
  getCareerPostsSnapshot,
  subscribeCareerDashboard,
} from "../../careerJobs/helpers/careerDashboardHelpers";
import {
  buildEmployerActiveJobs,
  buildEmployerInterviewRows,
  buildEmployerMatchCandidates,
  buildEmployerPipelineRows,
  computeEmployerDashMetrics,
  computeEmployerPipelineStageCounts,
  type EmployerActiveJobRow,
  type EmployerDashMetrics,
  type EmployerInterviewRow,
  type EmployerMatchCandidate,
  type EmployerPipelineFilter,
  type EmployerPipelineRow,
  type EmployerPipelineStageCounts,
} from "../helpers/employerDashboard.helpers";

export type EmployerDashboardModel = {
  readonly metrics: EmployerDashMetrics;
  readonly pipeline: readonly EmployerPipelineRow[];
  readonly stageCounts: EmployerPipelineStageCounts;
  readonly matches: readonly EmployerMatchCandidate[];
  readonly activeJobs: readonly EmployerActiveJobRow[];
  readonly interviews: readonly EmployerInterviewRow[];
};

type CareerBundle = {
  posts: ReturnType<typeof getCareerPostsSnapshot>;
  apps: ReturnType<typeof getCareerAppsSnapshot>;
};

let bundle: CareerBundle = {
  posts: getCareerPostsSnapshot(),
  apps: getCareerAppsSnapshot(),
};

function subscribe(onChange: () => void): () => void {
  return subscribeCareerDashboard(() => {
    bundle = {
      posts: getCareerPostsSnapshot(),
      apps: getCareerAppsSnapshot(),
    };
    onChange();
  });
}

function getBundle(): CareerBundle {
  return bundle;
}

export function useEmployerDashboardModel(
  filter: EmployerPipelineFilter = "all",
): EmployerDashboardModel {
  const data = useSyncExternalStore(subscribe, getBundle, getBundle);
  return useMemo(() => {
    try {
      const posts = Array.isArray(data.posts) ? data.posts : [];
      const apps = Array.isArray(data.apps) ? data.apps : [];
      const postsById = new Map(posts.map((p) => [p.id, p]));
      return {
        metrics: computeEmployerDashMetrics(posts, apps),
        pipeline: buildEmployerPipelineRows(apps, postsById, filter),
        stageCounts: computeEmployerPipelineStageCounts(apps),
        matches: buildEmployerMatchCandidates(posts, apps),
        activeJobs: buildEmployerActiveJobs(posts),
        interviews: buildEmployerInterviewRows(apps, postsById),
      };
    } catch {
      return {
        metrics: {
          activePosts: 0,
          totalApplicants: 0,
          shortlisted: 0,
          interviews: 0,
          todayInterviews: 0,
        },
        pipeline: [],
        stageCounts: { Applied: 0, Shortlisted: 0, Interview: 0, Hired: 0 },
        matches: [],
        activeJobs: [],
        interviews: [],
      };
    }
  }, [data, filter]);
}
