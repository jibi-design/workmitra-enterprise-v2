import type { EmployeeShiftApplication } from "../../shiftJobs/storage/employerShift.storage";
import { getWorkerName } from "./ShiftRatingSection.helpers";

export function ShiftCompletedBanner() {
  return (
    <div
      style={{
        marginTop: 12,
        padding: "14px 16px",
        borderRadius: "var(--wm-radius-chip)",
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

type UnratedRowProps = {
  app: EmployeeShiftApplication;
  showRateButton: boolean;
  onRate: () => void;
};

export function UnratedWorkerRow({ app, showRateButton, onRate }: UnratedRowProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 12px",
        borderRadius: "var(--wm-radius-10)",
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

      {showRateButton && (
        <button
          type="button"
          onClick={onRate}
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: "5px 12px",
            borderRadius: "var(--wm-radius-8)",
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
  );
}

type RatingPanelProps = {
  allRated: boolean;
  ratedCount: number;
  totalWorkers: number;
  unratedApps: EmployeeShiftApplication[];
  modalOpen: boolean;
  closeError: string | null;
  onOpenRating: (app: EmployeeShiftApplication) => void;
  onStartRating: () => void;
  onCloseShift: () => void;
};

export function ShiftRatingPanel({
  allRated,
  ratedCount,
  totalWorkers,
  unratedApps,
  modalOpen,
  closeError,
  onOpenRating,
  onStartRating,
  onCloseShift,
}: RatingPanelProps) {
  return (
    <div
      style={{
        marginTop: 12,
        padding: "14px 16px",
        borderRadius: "var(--wm-radius-chip)",
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
            borderRadius: "var(--wm-radius-pill)",
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
          borderRadius: "var(--wm-radius-pill)",
          background: "var(--wm-er-divider, #e5e7eb)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: "var(--wm-radius-pill)",
            width: `${(ratedCount / totalWorkers) * 100}%`,
            background: allRated ? "#16a34a" : "#ca8a04",
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {!allRated && unratedApps.length > 0 && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {unratedApps.map((app, index) => (
            <UnratedWorkerRow
              key={app.id}
              app={app}
              showRateButton={index === 0 && !modalOpen}
              onRate={() => onOpenRating(app)}
            />
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
              borderRadius: "var(--wm-radius-10)",
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
            onClick={onStartRating}
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: "9px 18px",
              borderRadius: "var(--wm-radius-10)",
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
            onClick={onCloseShift}
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: "9px 18px",
              borderRadius: "var(--wm-radius-10)",
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
  );
}
