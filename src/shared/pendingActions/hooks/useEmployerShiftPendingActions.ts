import { useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { collectPendingActions } from "../pendingActions.collect";
import type { PendingActionItem } from "../pendingActions.types";
import { getEmployerPendingShiftReviewCount } from "../../../features/shared/reviewCenter/adapters/employerShiftReviewCenter.adapter";
import {
  getWorkspacesSnapshot,
  subscribeWorkspaces,
} from "../../../features/employer/shiftJobs/storage/shiftWorkspaceStorage";

export function useEmployerShiftPendingActions(): PendingActionItem[] {
  const nav = useNavigate();

  const workspaces = useSyncExternalStore(
    subscribeWorkspaces,
    getWorkspacesSnapshot,
    getWorkspacesSnapshot,
  );

  const employerShiftReviewCount = useMemo(
    () => getEmployerPendingShiftReviewCount(workspaces),
    [workspaces],
  );

  return useMemo(
    () =>
      collectPendingActions("employer-shift-home", {
        navigate: nav,
        employerShiftReviewCount,
      }),
    [nav, employerShiftReviewCount],
  );
}
