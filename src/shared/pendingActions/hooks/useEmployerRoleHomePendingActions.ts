import { useMemo, useSyncExternalStore } from "react";
import type { NavigateFunction } from "react-router-dom";
import { getEmployerPendingShiftReviewCount } from "../../../features/shared/reviewCenter/adapters/employerShiftReviewCenter.adapter";
import {
  getWorkspacesSnapshot,
  subscribeWorkspaces,
} from "../../../features/employer/shiftJobs/storage/shiftWorkspaceStorage";
import { careerEmploymentFeedbackStorage } from "../../../features/employer/myStaff/storage/careerEmploymentFeedback.storage";
import { collectPendingActions } from "../pendingActions.collect";
import type { PendingActionItem } from "../pendingActions.types";

function parseEmploymentFeedbackCount(raw: string): number {
  try {
    const parsed = JSON.parse(raw) as { pendingCount?: number };
    return typeof parsed.pendingCount === "number" ? parsed.pendingCount : 0;
  } catch {
    return 0;
  }
}

export function useEmployerRoleHomePendingActions(navigate: NavigateFunction): PendingActionItem[] {
  const workspaces = useSyncExternalStore(
    subscribeWorkspaces,
    getWorkspacesSnapshot,
    getWorkspacesSnapshot,
  );

  const feedbackRaw = useSyncExternalStore(
    careerEmploymentFeedbackStorage.subscribe,
    careerEmploymentFeedbackStorage.getHomeSnapshot,
    careerEmploymentFeedbackStorage.getHomeSnapshot,
  );

  const employerShiftReviewCount = useMemo(
    () => getEmployerPendingShiftReviewCount(workspaces),
    [workspaces],
  );

  const careerEmploymentFeedbackCount = useMemo(
    () => parseEmploymentFeedbackCount(feedbackRaw),
    [feedbackRaw],
  );

  return useMemo(
    () =>
      collectPendingActions("employer-role-home", {
        navigate,
        employerShiftReviewCount,
        careerEmploymentFeedbackCount,
      }),
    [navigate, employerShiftReviewCount, careerEmploymentFeedbackCount],
  );
}
