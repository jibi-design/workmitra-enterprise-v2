// App: Job Mitra / WorkMitra_Enterprise_v2
// File: StaffResignationBanner.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\myStaff\components\staffDetailSections\StaffResignationBanner.tsx

import { IconWarning } from "../staffDetailComponents";

type ResignationBannerProps = {
  daysLeft: number | null;
  lastWorkingDateLabel: string;
  canCloseEmployment: boolean;
  onAccept: () => void;
  onReject: () => void;
};

export function ResignationBanner({
  daysLeft,
  lastWorkingDateLabel,
  canCloseEmployment,
  onAccept,
  onReject,
}: ResignationBannerProps) {
  const countdownText =
    daysLeft === null
      ? "Notice period details are not available."
      : daysLeft <= 0
        ? "Notice period completed. You can close this employment record."
        : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left in notice period.`;

  return (
    <div style={{ padding: "12px 20px 0" }}>
      <div
        className="wm-er-card"
        style={{
          borderLeft: "4px solid #d97706",
          padding: 16,
          background:
            "radial-gradient(circle at 96% 0%, rgba(217,119,6,0.09), transparent 32%), linear-gradient(135deg, rgba(255,255,255,1), rgba(255,251,235,0.68))",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#d97706",
            fontWeight: 950,
            fontSize: 14,
            marginBottom: 8,
          }}
        >
          <IconWarning /> Notice Period Active
        </div>

        <div style={{ fontSize: 13, color: "var(--wm-er-text)", lineHeight: 1.5 }}>
          This employee has submitted a resignation. Keep the employment active until the last
          working date, unless both sides agree to close it earlier.
        </div>

        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
          }}
        >
          <div
            style={{
              padding: "10px 11px",
              borderRadius: "var(--wm-radius-chip)",
              background: "rgba(217,119,6,0.08)",
              border: "1px solid rgba(217,119,6,0.16)",
            }}
          >
            <div style={{ fontSize: 10.5, fontWeight: 950, color: "var(--wm-er-muted)" }}>
              Countdown
            </div>
            <div style={{ marginTop: 4, fontSize: 13, fontWeight: 950, color: "#92400e" }}>
              {countdownText}
            </div>
          </div>

          <div
            style={{
              padding: "10px 11px",
              borderRadius: "var(--wm-radius-chip)",
              background: "rgba(15,23,42,0.035)",
              border: "1px solid rgba(15,23,42,0.06)",
            }}
          >
            <div style={{ fontSize: 10.5, fontWeight: 950, color: "var(--wm-er-muted)" }}>
              Last working date
            </div>
            <div
              style={{ marginTop: 4, fontSize: 13, fontWeight: 950, color: "var(--wm-er-text)" }}
            >
              {lastWorkingDateLabel}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onAccept}
            disabled={!canCloseEmployment}
            style={{
              padding: "10px 18px",
              borderRadius: "var(--wm-radius-10)",
              border: "none",
              background: canCloseEmployment ? "#16a34a" : "rgba(148,163,184,0.45)",
              color: canCloseEmployment ? "#fff" : "#475569",
              fontWeight: 950,
              fontSize: 13,
              cursor: canCloseEmployment ? "pointer" : "not-allowed",
            }}
          >
            {canCloseEmployment ? "Close Employment" : "Close after notice period"}
          </button>

          <button
            type="button"
            onClick={onReject}
            style={{
              padding: "10px 18px",
              borderRadius: "var(--wm-radius-10)",
              border: "1.5px solid rgba(0,0,0,0.12)",
              background: "transparent",
              color: "var(--wm-er-text)",
              fontWeight: 850,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Reject Resignation
          </button>
        </div>
      </div>
    </div>
  );
}
