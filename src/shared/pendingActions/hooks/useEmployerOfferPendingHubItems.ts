// Job Mitra | useEmployerOfferPendingHubItems.ts

import { useMemo, useSyncExternalStore } from "react";
import type { NavigateFunction } from "react-router-dom";
import {
  readCareerApps,
  readCareerPosts,
} from "../../../features/employer/careerJobs/helpers/careerNormalizers";
import { pendingActionsStorage } from "../../storage/pendingActionsStorage";
import type { PendingActionItem } from "../pendingActions.types";
import {
  buildEmployerOfferPendingHubItems,
  type EmployerOfferPendingSource,
} from "../helpers/pendingActionsHubItems.helpers";

const CAREER_APPS_CHANGED = "wm:employee-career-applications-changed";

function getCareerAppsSnapshot(): string {
  return JSON.stringify(readCareerApps());
}

function subscribeCareerApps(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(CAREER_APPS_CHANGED, handler);
  return () => window.removeEventListener(CAREER_APPS_CHANGED, handler);
}

export function useEmployerOfferPendingHubItems(navigate: NavigateFunction): PendingActionItem[] {
  const careerAppsRevision = useSyncExternalStore(
    subscribeCareerApps,
    getCareerAppsSnapshot,
    getCareerAppsSnapshot,
  );
  const pendingDismissedRevision = useSyncExternalStore(
    pendingActionsStorage.subscribe,
    pendingActionsStorage.getAll,
    pendingActionsStorage.getAll,
  );

  return useMemo(() => {
    void careerAppsRevision;
    void pendingDismissedRevision;

    const postMap = new Map(readCareerPosts().map((post) => [post.id, post]));
    const sources: EmployerOfferPendingSource[] = [];

    for (const app of readCareerApps()) {
      if (app.stage !== "offered") continue;

      const post = postMap.get(app.jobId);
      if (!post || post.status !== "active") continue;

      sources.push({
        appId: app.id,
        postId: app.jobId,
        candidateName: app.employeeName,
        jobTitle: post.jobTitle,
      });
    }

    return buildEmployerOfferPendingHubItems(sources, navigate);
  }, [careerAppsRevision, pendingDismissedRevision, navigate]);
}
