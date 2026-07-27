// App name: Job Mitra
// File name: EmployerReviewCenterPage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\shared\reviewCenter\pages\EmployerReviewCenterPage.tsx

import { useMemo, useSyncExternalStore } from "react";
import { ratingStorage } from "../../../../shared/rating/ratingStorage";
import { employerSettingsStorage } from "../../../employer/company/storage/employerSettings.storage";
import {
  getWorkspacesSnapshot,
  subscribeWorkspaces,
} from "../../../employer/shiftJobs/storage/shiftWorkspaceStorage";
import { getEmployerShiftReviewItems } from "../adapters/employerShiftReviewCenter.adapter";
import { EmployerReceivedWorkerReviews } from "../components/EmployerReceivedWorkerReviews";
import { EmployerShiftReviewActions } from "../components/EmployerShiftReviewActions";
import { ReviewCenterPageShell } from "../components/ReviewCenterPageShell";

export function EmployerReviewCenterPage() {
  const workspaces = useSyncExternalStore(
    subscribeWorkspaces,
    getWorkspacesSnapshot,
    getWorkspacesSnapshot,
  );

  const workerReviews = useSyncExternalStore(
    ratingStorage.subscribe,
    ratingStorage.getAllWRRatings,
    ratingStorage.getAllWRRatings,
  );

  const shiftReviewItems = getEmployerShiftReviewItems(workspaces);

  const receivedShiftReviews = useMemo(() => {
    const employerMlId = employerSettingsStorage.get().uniqueId ?? "";
    const workspacePostIds = new Set(workspaces.map((workspace) => workspace.postId));

    return workerReviews.filter((review) => {
      if (review.domain !== "shift") return false;
      if (employerMlId && review.employerMlId === employerMlId) return true;
      return workspacePostIds.has(review.jobId);
    });
  }, [workerReviews, workspaces]);

  return (
    <ReviewCenterPageShell
      role="employer"
      hasExtraContent={shiftReviewItems.length > 0 || receivedShiftReviews.length > 0}
    >
      <EmployerShiftReviewActions items={shiftReviewItems} />
      <EmployerReceivedWorkerReviews reviews={receivedShiftReviews} workspaces={workspaces} />
    </ReviewCenterPageShell>
  );
}
