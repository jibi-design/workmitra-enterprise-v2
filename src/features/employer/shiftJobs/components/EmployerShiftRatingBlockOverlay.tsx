// App name: Job Mitra
// File name: EmployerShiftRatingBlockOverlay.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerShiftRatingBlockOverlay.tsx

import { employerShiftStorage } from "../../shiftJobs/storage/employerShift.storage";
import { getAppsSnapshot } from "../helpers/dashboardHelpers";
import { ShiftRatingSection } from "./ShiftRatingSection";

type EmployerShiftRatingBlockOverlayProps = {
  post: ReturnType<typeof employerShiftStorage.getPost>;
  confirmedApps: ReturnType<typeof getAppsSnapshot>;
  onDone: () => void;
};

export function EmployerShiftRatingBlockOverlay({
  post,
  confirmedApps,
  onDone,
}: EmployerShiftRatingBlockOverlayProps) {
  if (!post) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.80)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        overflowY: "auto",
        padding: "24px 16px 48px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "var(--wm-er-card, #fff)",
          borderRadius: 16,
          padding: "20px 20px 24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.24)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              flexShrink: 0,
              background: "rgba(217,119,6,0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#d97706"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z"
              />
            </svg>
          </div>

          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--wm-er-text)" }}>
              Rate Workers to Close Shift
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>
              This shift has ended. Rating is mandatory and cannot be skipped.
            </div>
          </div>
        </div>

        <div
          style={{
            marginBottom: 14,
            padding: "10px 12px",
            borderRadius: 10,
            background: "rgba(217,119,6,0.06)",
            border: "1px solid rgba(217,119,6,0.2)",
            fontSize: 12,
            color: "#92400e",
            lineHeight: 1.5,
          }}
        >
          You must rate all confirmed workers before this shift can be closed. Ratings build trust
          and cannot be skipped.
        </div>

        <ShiftRatingSection post={post} confirmedApps={confirmedApps} onShiftClosed={onDone} />
      </div>
    </div>
  );
}
