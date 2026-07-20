// App: Job Mitra / WorkMitra_Enterprise_v2
// File: ShiftRatingSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\ShiftRatingSection.tsx

import { useMemo, useState, useSyncExternalStore } from "react";
import { EmployerRateWorkerModal } from "../../../../shared/components/rating/EmployerRateWorkerModal";
import { ratingStorage } from "../../../../shared/rating/ratingStorage";
import { employerSettingsStorage } from "../..//company/storage/employerSettings.storage";
import { employerShiftStorage } from "../../shiftJobs/storage/employerShift.storage";
import type {
  EmployeeShiftApplication,
  ShiftPost,
} from "../../shiftJobs/storage/employerShift.storage";

type Props = {
  post: ShiftPost;
  confirmedApps: EmployeeShiftApplication[];
  onShiftClosed: () => void;
};

function getWorkerWmId(app: EmployeeShiftApplication): string {
  return app.profileSnapshot?.uniqueId?.trim() || app.id;
}

function getWorkerName(app: EmployeeShiftApplication): string {
  return app.profileSnapshot?.fullName?.trim() || `Worker ${app.id.slice(-4).toUpperCase()}`;
}

export function ShiftRatingSection({ post, confirmedApps, onShiftClosed }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [closeError, setCloseError] = useState<string | null>(null);

  const employerWmId = useMemo(() => {
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
      const workerWmId = getWorkerWmId(app);

      const hasRating = employerRatings.some(
        (rating) =>
          rating.domain === "shift" &&
          rating.employerWmId === employerWmId &&
          rating.jobId === post.id &&
          rating.workerWmId === workerWmId,
      );

      if (hasRating) ids.add(app.id);
    }

    return ids;
  }, [confirmedApps, employerRatings, employerWmId, post.id]);

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
    return (
      <div
        style={{
          marginTop: 12,
          padding: "14px 16px",
          borderRadius: 14,
          background: "rgba(22,163,74,0.06)",
          border: "1px solid rgba(22,163,74,0.2)",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>Shift Completed</div>

        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4 }}>
          All required worker ratings are completed and this shift is closed.
        </div>
      </div>
    );
  }

  return (
    <>
      {modalOpen && currentApp && (
        <EmployerRateWorkerModal
          isOpen={modalOpen}
          jobId={post.id}
          jobTitle={post.jobName}
          employerWmId={employerWmId}
          workerWmId={getWorkerWmId(currentApp)}
          workerName={getWorkerName(currentApp)}
          domain="shift"
          onSubmitted={handleRated}
          onClose={handleCloseModal}
        />
      )}

      <div
        style={{
          marginTop: 12,
          padding: "14px 16px",
          borderRadius: 14,
          background: allRated ? "rgba(22,163,74,0.06)" : "rgba(202,138,4,0.06)",
          border: allRated ? "1px solid rgba(22,163,74,0.2)" : "1px solid rgba(202,138,4,0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: allRated ? "#15803d" : "#854d0e",
              }}
            >
              {allRated ? "All Workers Rated - Ready to Close" : "Rate Workers to Close Shift"}
            </div>

            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 3 }}>
              {allRated
                ? "Tap the button below to mark this shift as complete."
                : `Rating is mandatory. ${ratedCount} of ${totalWorkers} workers rated.`}
            </div>
          </div>

          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 999,
              background: allRated ? "rgba(22,163,74,0.12)" : "rgba(202,138,4,0.12)",
              color: allRated ? "#15803d" : "#854d0e",
              border: allRated ? "1px solid rgba(22,163,74,0.3)" : "1px solid rgba(202,138,4,0.3)",
              whiteSpace: "nowrap",
            }}
          >
            {ratedCount}/{totalWorkers} Rated
          </span>
        </div>

        <div
          style={{
            marginTop: 10,
            height: 6,
            borderRadius: 999,
            background: "var(--wm-er-divider, #e5e7eb)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 999,
              width: `${(ratedCount / totalWorkers) * 100}%`,
              background: allRated ? "#16a34a" : "#ca8a04",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        {!allRated && unratedApps.length > 0 && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            {unratedApps.map((app, index) => (
              <div
                key={app.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: "var(--wm-er-bg)",
                  border: "1px solid var(--wm-er-border)",
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>
                    {getWorkerName(app)}
                  </div>

                  {app.profileSnapshot?.uniqueId && (
                    <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
                      {app.profileSnapshot.uniqueId}
                    </div>
                  )}
                </div>

                {index === 0 && !modalOpen && (
                  <button
                    type="button"
                    onClick={() => openRatingFor(app)}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "5px 12px",
                      borderRadius: 8,
                      border: "none",
                      background: "var(--wm-er-accent-shift, #16a34a)",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Rate Now
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          {closeError && (
            <div
              style={{
                width: "100%",
                fontSize: 12,
                fontWeight: 600,
                color: "#b91c1c",
                padding: "8px 12px",
                borderRadius: 10,
                background: "rgba(220,38,38,0.06)",
                border: "1px solid rgba(220,38,38,0.2)",
              }}
            >
              {closeError}
            </div>
          )}

          {!allRated && !modalOpen && (
            <button
              type="button"
              onClick={handleStartRating}
              style={{
                fontSize: 13,
                fontWeight: 600,
                padding: "9px 18px",
                borderRadius: 10,
                border: "none",
                background: "var(--wm-er-accent-shift, #16a34a)",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Start Rating ({unratedApps.length} remaining)
            </button>
          )}

          {allRated && (
            <button
              type="button"
              onClick={handleCloseShift}
              style={{
                fontSize: 13,
                fontWeight: 600,
                padding: "9px 18px",
                borderRadius: 10,
                border: "none",
                background: "#15803d",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Mark Shift as Complete
            </button>
          )}
        </div>
      </div>
    </>
  );
}
