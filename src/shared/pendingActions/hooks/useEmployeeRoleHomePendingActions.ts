import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import type { NavigateFunction } from "react-router-dom";
import { getPendingShiftReviewCount } from "../../../features/shared/reviewCenter/adapters/employeeShiftReviewCenter.adapter";
import { reviewCenterStorage } from "../../../features/shared/reviewCenter/storage/reviewCenter.storage";
import { shiftWorkspacesStorage } from "../../../features/employee/shiftJobs/storage/shiftWorkspaces.storage";
import { employmentLifecycleStorage } from "../../../features/employee/employment/storage/employmentLifecycle.storage";
import { careerEmployerFeedbackStorage } from "../../../shared/employmentFeedback/careerEmployerFeedback.storage";
import { collectPendingActions } from "../pendingActions.collect";
import type { PendingActionItem } from "../pendingActions.types";

function parseEmployerFeedbackCount(raw: string): number {
  try {
    const parsed = JSON.parse(raw) as { pendingCount?: number };
    return typeof parsed.pendingCount === "number" ? parsed.pendingCount : 0;
  } catch {
    return 0;
  }
}

export function useEmployeeRoleHomePendingActions(navigate: NavigateFunction): PendingActionItem[] {
  const workspaces = useSyncExternalStore(
    shiftWorkspacesStorage.subscribe,
    shiftWorkspacesStorage.getAll,
    shiftWorkspacesStorage.getAll,
  );

  const reviewRequests = useSyncExternalStore(
    reviewCenterStorage.subscribe,
    reviewCenterStorage.getAll,
    reviewCenterStorage.getAll,
  );

  const subscribeCareerFeedback = useCallback((callback: () => void) => {
    const unsubscribeEmployment = employmentLifecycleStorage.subscribe(callback);
    const unsubscribeFeedback = careerEmployerFeedbackStorage.subscribe(callback);
    return () => {
      unsubscribeEmployment();
      unsubscribeFeedback();
    };
  }, []);

  const getCareerFeedbackSnapshot = useCallback(
    () => careerEmployerFeedbackStorage.getHomeSnapshot(employmentLifecycleStorage.getAll()),
    [],
  );

  useEffect(() => {
    careerEmployerFeedbackStorage.syncPendingTasksForRecords(employmentLifecycleStorage.getAll());
  }, []);

  const feedbackRaw = useSyncExternalStore(
    subscribeCareerFeedback,
    getCareerFeedbackSnapshot,
    getCareerFeedbackSnapshot,
  );

  const employeeShiftReviewCount = useMemo(() => {
    const pendingReviewCount = getPendingShiftReviewCount(workspaces);

    const pendingWorkspaceIds = new Set(
      workspaces
        .filter((workspace) => workspace.status === "completed" && !workspace.rating)
        .map((workspace) => workspace.id),
    );

    const incomingRequestCount = reviewRequests.filter((request) => {
      return (
        request.domain === "shift" &&
        request.toRole === "employee" &&
        request.action === "employer_request_employee_review" &&
        request.status === "active" &&
        !pendingWorkspaceIds.has(request.sourceId)
      );
    }).length;

    return pendingReviewCount + incomingRequestCount;
  }, [reviewRequests, workspaces]);

  const careerEmployerFeedbackCount = useMemo(
    () => parseEmployerFeedbackCount(feedbackRaw),
    [feedbackRaw],
  );

  return useMemo(
    () =>
      collectPendingActions("employee-role-home", {
        navigate,
        employeeShiftReviewCount,
        careerEmployerFeedbackCount,
      }),
    [navigate, employeeShiftReviewCount, careerEmployerFeedbackCount],
  );
}
