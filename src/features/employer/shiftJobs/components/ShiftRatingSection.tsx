// App: Job Mitra / WorkMitra_Enterprise_v2
// File: ShiftRatingSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\ShiftRatingSection.tsx

import { useMemo, useState, useSyncExternalStore } from "react";
import { EmployerRateWorkerModal } from "../../../../shared/components/rating/EmployerRateWorkerModal";
import { ratingStorage } from "../../../../shared/rating/ratingStorage";
import { employerSettingsStorage } from "../..//company/storage/employerSettings.storage";
import { employerShiftStorage } from "../../shiftJobs/storage/employerShift.storage";
import { getWorkspacesSnapshot } from "../storage/shiftWorkspaceStorage";
import type {
  EmployeeShiftApplication,
  ShiftPost,
} from "../../shiftJobs/storage/employerShift.storage";
import { getWorkerMlId, getWorkerName } from "./ShiftRatingSection.helpers";
import { ShiftCompletedBanner, ShiftRatingPanel } from "./ShiftRatingSection.parts";

type Props = {
  post: ShiftPost;
  confirmedApps: EmployeeShiftApplication[];
  onShiftClosed: () => void;
};

export function ShiftRatingSection({ post, confirmedApps, onShiftClosed }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [closeError, setCloseError] = useState<string | null>(null);

  const employerMlId = useMemo(() => {
    const profile = employerSettingsStorage.get();
    return profile.uniqueId?.trim() || "employer_local_demo";
  }, []);

  const employerRatings = useSyncExternalStore(
    ratingStorage.subscribe,
    ratingStorage.getAllERRatings,
    ratingStorage.getAllERRatings,
  );

  const ratedWorkerIds = useMemo(() => {
    const ids = new Set<string>();

    for (const app of confirmedApps) {
      const workerMlId = getWorkerMlId(app);
      const hasRating = employerRatings.some(
        (rating) =>
          rating.domain === "shift" &&
          rating.employerMlId === employerMlId &&
          rating.jobId === post.id &&
          rating.workerMlId === workerMlId,
      );

      if (hasRating) ids.add(app.id);
    }

    return ids;
  }, [confirmedApps, employerRatings, employerMlId, post.id]);

  const unratedApps = useMemo(
    () => confirmedApps.filter((app) => !ratedWorkerIds.has(app.id)),
    [confirmedApps, ratedWorkerIds],
  );

  const currentApp =
    (activeAppId ? unratedApps.find((app) => app.id === activeAppId) : null) ??
    unratedApps[0] ??
    null;

  const totalWorkers = confirmedApps.length;
  const ratedCount = ratedWorkerIds.size;
  const allRated = totalWorkers > 0 && unratedApps.length === 0;
  const isCompleted = post.status === "completed";

  function openRatingFor(app: EmployeeShiftApplication) {
    setActiveAppId(app.id);
    setModalOpen(true);
  }

  function handleStartRating() {
    if (!unratedApps[0]) return;
    openRatingFor(unratedApps[0]);
  }

  function handleRated() {
    setModalOpen(false);
    setActiveAppId(null);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setActiveAppId(null);
  }

  function handleCloseShift() {
    if (!allRated) return;

    setCloseError(null);

    const result = employerShiftStorage.completePost(post.id);

    if (!result.ok) {
      if (result.reason === "vault_finalize_error") {
        setCloseError(
          "Could not finalize work history records. Your shift was not marked complete. Please try again.",
        );
        return;
      }

      if (result.reason === "post_write_error") {
        setCloseError("Could not save shift completion. Please try again.");
        return;
      }

      if (result.reason === "already_completed") {
        onShiftClosed();
        return;
      }

      setCloseError("Could not complete this shift. Please try again.");
      return;
    }

    onShiftClosed();
  }

  if (totalWorkers === 0) return null;

  if (isCompleted) {
    return <ShiftCompletedBanner />;
  }

  const currentWorkspaceId =
    getWorkspacesSnapshot().find(
      (item) => item.postId === post.id && item.appId === currentApp?.id,
    )?.id ?? "";

  return (
    <>
      {modalOpen && currentApp && (
        <EmployerRateWorkerModal
          isOpen={modalOpen}
          jobId={post.id}
          jobTitle={post.jobName}
          employerMlId={employerMlId}
          workerMlId={getWorkerMlId(currentApp)}
          workerName={getWorkerName(currentApp)}
          domain="shift"
          workspaceId={currentWorkspaceId || undefined}
          appId={currentApp.id}
          onSubmitted={handleRated}
          onClose={handleCloseModal}
        />
      )}

      <ShiftRatingPanel
        allRated={allRated}
        ratedCount={ratedCount}
        totalWorkers={totalWorkers}
        unratedApps={unratedApps}
        modalOpen={modalOpen}
        closeError={closeError}
        onOpenRating={openRatingFor}
        onStartRating={handleStartRating}
        onCloseShift={handleCloseShift}
      />
    </>
  );
}
