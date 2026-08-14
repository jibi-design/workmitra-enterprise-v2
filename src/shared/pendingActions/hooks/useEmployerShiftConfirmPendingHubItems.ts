/** Job Mitra | useEmployerShiftConfirmPendingHubItems.ts */

import { useMemo, useSyncExternalStore } from "react";
import type { NavigateFunction } from "react-router-dom";
import {
  findConfirmWaitingPost,
  getPostsSnapshot,
  subscribePosts,
} from "../../../features/employer/shiftJobs/helpers/shiftHomeHelpers";
import { pendingActionsStorage } from "../../storage/pendingActionsStorage";
import type { PendingActionItem } from "../pendingActions.types";
import { buildEmployerConfirmPendingHubItems } from "../helpers/pendingActionsHubItems.helpers";

export function useEmployerShiftConfirmPendingHubItems(
  navigate: NavigateFunction,
): PendingActionItem[] {
  const posts = useSyncExternalStore(subscribePosts, getPostsSnapshot, getPostsSnapshot);
  const dismissedRevision = useSyncExternalStore(
    pendingActionsStorage.subscribe,
    pendingActionsStorage.getAll,
    pendingActionsStorage.getAll,
  );

  return useMemo(() => {
    void dismissedRevision;
    const waiting = findConfirmWaitingPost(posts);
    if (!waiting) return [];
    return buildEmployerConfirmPendingHubItems(
      [
        {
          postId: waiting.postId,
          jobTitle: waiting.jobName,
          shortlisted: waiting.shortlisted,
        },
      ],
      navigate,
    );
  }, [dismissedRevision, navigate, posts]);
}
