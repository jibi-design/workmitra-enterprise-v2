import { useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { collectPendingActions } from "../pendingActions.collect";
import type { PendingActionItem } from "../pendingActions.types";
import { getPendingShiftReviewCount } from "../../../features/shared/reviewCenter/adapters/employeeShiftReviewCenter.adapter";
import { reviewCenterStorage } from "../../../features/shared/reviewCenter/storage/reviewCenter.storage";
import { shiftWorkspacesStorage } from "../../../features/employee/shiftJobs/storage/shiftWorkspaces.storage";

export function useEmployeeShiftPendingActions(): PendingActionItem[] {
  const nav = useNavigate();

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

  return useMemo(
    () =>
      collectPendingActions("employee-shift-home", {
        navigate: nav,
        employeeShiftReviewCount,
      }),
    [nav, employeeShiftReviewCount],
  );
}
