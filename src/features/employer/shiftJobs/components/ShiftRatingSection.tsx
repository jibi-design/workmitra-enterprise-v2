// src/features/employer/shiftJobs/components/ShiftRatingSection.tsx
//
// Mandatory rating flow — employer must rate ALL confirmed workers
// before shift can be marked complete.
// Shows one worker at a time via EmployerRateWorkerModal.

import { useState, useMemo } from "react";
import { EmployerRateWorkerModal } from "../../../../shared/components/rating/EmployerRateWorkerModal";
import { employerShiftStorage } from "../storage/employerShift.storage";
import type { EmployeeShiftApplication, ShiftPost } from "../storage/employerShift.storage";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  post: ShiftPost;
  confirmedApps: EmployeeShiftApplication[];
  onShiftClosed: () => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function ShiftRatingSection({ post, confirmedApps, onShiftClosed }: Props) {
  const [ratingIndex, setRatingIndex] = useState(0);
  const [ratedIds, setRatedIds]       = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen]     = useState(false);

  const unratedApps = useMemo(
    () => confirmedApps.filter((a) => !ratedIds.has(a.id)),
    [confirmedApps, ratedIds],
  );

  const currentApp = unratedApps[ratingIndex] ?? null;
  const totalWorkers = confirmedApps.length;
  const ratedCount = ratedIds.size;
  const allRated = ratedCount >= totalWorkers && totalWorkers > 0;

  function handleStartRating() {
    setRatingIndex(0);
    setModalOpen(true);
  }

  function handleRated() {
    if (!currentApp) return;

    const newRated = new Set(ratedIds);
    newRated.add(currentApp.id);
    setRatedIds(newRated);
    setModalOpen(false);

    const remaining = confirmedApps.filter((a) => !newRated.has(a.id));
    if (remaining.length > 0) {
      // Advance to next unrated worker
      setRatingIndex((prev) => prev + 1);
    }
  }

  function handleCloseModal() {
    /* Rating is mandatory — modal cannot be dismissed without submitting.
       onClose is only called if user somehow closes (ESC).
       We keep modal closed but don't advance index. */
    setModalOpen(false);
  }

  function handleCloseShift() {
    if (!allRated) return;
    employerShiftStorage.completePost(post.id);
    onShiftClosed();
  }

  if (totalWorkers === 0) return null;

  const isCompleted = post.status === "completed";

  /* ── Already completed ── */
  if (isCompleted) {
    return (
      <div style={{
        marginTop: 12, padding: "14px 16px", borderRadius: 14,
        background: "rgba(22,163,74,0.06)",
        border: "1px solid rgba(22,163,74,0.2)",
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>
          &#10003; Shift Completed
        </div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4 }}>
          All workers have been rated and this shift is closed.
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Rating Modal */}
      {modalOpen && currentApp && (
        <EmployerRateWorkerModal
          isOpen={modalOpen}
          jobId={post.id}
          jobTitle={post.jobName}
          employerWmId=""
          workerWmId={currentApp.profileSnapshot?.uniqueId ?? currentApp.id}
          workerName={currentApp.profileSnapshot?.fullName ?? `Worker ${currentApp.id.slice(-4).toUpperCase()}`}
          domain="shift"
          onSubmitted={handleRated}
          onClose={handleCloseModal}
        />
      )}

      {/* Rating Banner */}
      <div style={{
        marginTop: 12, padding: "14px 16px", borderRadius: 14,
        background: allRated ? "rgba(22,163,74,0.06)" : "rgba(217,119,6,0.06)",
        border: allRated
          ? "1px solid rgba(22,163,74,0.2)"
          : "1px solid rgba(217,119,6,0.25)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <div>
            <div style={{
              fontSize: 13, fontWeight: 700,
              color: allRated ? "#15803d" : "#92400e",
            }}>
              {allRated
                ? "All Workers Rated \u2014 Ready to Close"
                : "Rate Workers to Close Shift"}
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 3 }}>
              {allRated
                ? "Tap the button below to mark this shift as complete."
                : `Rating is mandatory. ${ratedCount} of ${totalWorkers} workers rated.`}
            </div>
          </div>

          {/* Rating progress pill */}
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
            background: allRated ? "rgba(22,163,74,0.12)" : "rgba(217,119,6,0.12)",
            color: allRated ? "#15803d" : "#92400e",
            border: allRated ? "1px solid rgba(22,163,74,0.3)" : "1px solid rgba(217,119,6,0.3)",
            whiteSpace: "nowrap",
          }}>
            {ratedCount}/{totalWorkers} Rated
          </span>
        </div>

        {/* Progress bar */}
        {totalWorkers > 0 && (
          <div style={{
            marginTop: 10, height: 6, borderRadius: 999,
            background: "var(--wm-er-divider, #e5e7eb)", overflow: "hidden",
          }}>
            <div style={{
              height: "100%", borderRadius: 999,
              width: `${(ratedCount / totalWorkers) * 100}%`,
              background: allRated ? "#16a34a" : "#d97706",
              transition: "width 0.3s ease",
            }} />
          </div>
        )}

        {/* Worker list — unrated */}
        {!allRated && unratedApps.length > 0 && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            {unratedApps.map((a, idx) => (
              <div key={a.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 12px", borderRadius: 10,
                background: "var(--wm-er-bg)", border: "1px solid var(--wm-er-border)",
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>
                    {a.profileSnapshot?.fullName ?? `Worker ${a.id.slice(-4).toUpperCase()}`}
                  </div>
                  {a.profileSnapshot?.uniqueId && (
                    <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
                      {a.profileSnapshot.uniqueId}
                    </div>
                  )}
                </div>
                {idx === 0 && !modalOpen && (
                  <button
                    type="button"
                    onClick={() => { setRatingIndex(0); setModalOpen(true); }}
                    style={{
                      fontSize: 12, fontWeight: 600, padding: "5px 12px",
                      borderRadius: 8, border: "none",
                      background: "var(--wm-er-accent-shift, #16a34a)",
                      color: "#fff", cursor: "pointer",
                    }}
                  >
                    Rate Now
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
          {!allRated && !modalOpen && (
            <button
              type="button"
              onClick={handleStartRating}
              style={{
                fontSize: 13, fontWeight: 600, padding: "9px 18px",
                borderRadius: 10, border: "none",
                background: "var(--wm-er-accent-shift, #16a34a)",
                color: "#fff", cursor: "pointer",
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
                fontSize: 13, fontWeight: 600, padding: "9px 18px",
                borderRadius: 10, border: "none",
                background: "#15803d",
                color: "#fff", cursor: "pointer",
              }}
            >
              Mark Shift as Complete &#10003;
            </button>
          )}
        </div>
      </div>
    </>
  );
}