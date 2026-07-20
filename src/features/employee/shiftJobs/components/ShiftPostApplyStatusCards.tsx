// App name: Job Mitra
// File name: ShiftPostApplyStatusCards.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\ShiftPostApplyStatusCards.tsx

type ShiftPostApplyStatusCardsProps = {
  isShortlisted: boolean;
  isWaiting: boolean;
  isConfirmed: boolean;
  hasWorkspace: boolean;
  attendanceConfirmedAt?: number;
  onConfirmAttendance: () => void;
  onOpenWorkspace: () => void;
};

export function ShiftPostApplyStatusCards({
  isShortlisted,
  isWaiting,
  isConfirmed,
  hasWorkspace,
  attendanceConfirmedAt,
  onConfirmAttendance,
  onOpenWorkspace,
}: ShiftPostApplyStatusCardsProps) {
  const attendanceConfirmed = attendanceConfirmedAt !== undefined;

  return (
    <>
      {isShortlisted && (
        <StatusCard
          title="You are shortlisted"
          helper="Employer marked you as a strong candidate. Keep your availability open and watch for confirmation."
          tone="warning"
        />
      )}

      {isWaiting && (
        <StatusCard
          title="You are on the backup list"
          helper="You may be confirmed if a selected worker drops out. Stay ready, but do not stop applying to other suitable shifts."
          tone="warning"
          footer="Tip: keep this shift in mind, but continue applying so you do not lose other opportunities."
        />
      )}

      {isConfirmed && (
        <StatusCard
          title={attendanceConfirmed ? "Attendance confirmed" : "Confirm your attendance"}
          helper={
            attendanceConfirmed
              ? "You have confirmed that you will attend this shift. Keep checking the workspace and arrive on time."
              : "You are selected for this shift. Confirm only if you are available and will attend on time."
          }
          tone={attendanceConfirmed ? "success" : "info"}
          actionLabel={attendanceConfirmed ? undefined : "I will attend"}
          onAction={attendanceConfirmed ? undefined : onConfirmAttendance}
          footer={
            attendanceConfirmed
              ? "Your confirmation is saved locally on this device for now."
              : "This is not a payment or attendance punch-in. It only confirms your intention to attend."
          }
        />
      )}

      {hasWorkspace && (
        <div className="wm-ee-card" style={{ marginTop: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#16a34a" }}>Workspace is ready</div>

          <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted, #64748b)" }}>
            This shift is active now. Open your workspace to continue.
          </div>

          <button
            type="button"
            onClick={onOpenWorkspace}
            style={{
              marginTop: 12,
              width: "100%",
              padding: 14,
              borderRadius: 12,
              border: "none",
              background: "#16a34a",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Open Workspace
          </button>
        </div>
      )}
    </>
  );
}

function StatusCard({
  title,
  helper,
  tone,
  footer,
  actionLabel,
  onAction,
}: {
  readonly title: string;
  readonly helper: string;
  readonly tone: "warning" | "info" | "success";
  readonly footer?: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
}) {
  const toneStyle = getToneStyle(tone);

  return (
    <div
      className="wm-ee-card"
      style={{
        marginTop: 12,
        border: toneStyle.border,
        background: toneStyle.background,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 800, color: toneStyle.color }}>{title}</div>

      <div
        style={{
          marginTop: 6,
          fontSize: 12,
          color: "var(--wm-er-muted, #64748b)",
          lineHeight: 1.5,
        }}
      >
        {helper}
      </div>

      {footer && (
        <div
          style={{
            marginTop: 10,
            padding: "9px 10px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.72)",
            border: toneStyle.footerBorder,
            color: toneStyle.footerColor,
            fontSize: 11,
            fontWeight: 800,
            lineHeight: 1.45,
          }}
        >
          {footer}
        </div>
      )}

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{
            marginTop: 12,
            width: "100%",
            padding: 13,
            borderRadius: 13,
            border: "none",
            background: toneStyle.color,
            color: "#fff",
            fontSize: 13,
            fontWeight: 900,
            cursor: "pointer",
            boxShadow: "0 10px 22px rgba(15,23,42,0.1)",
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function getToneStyle(tone: "warning" | "info" | "success"): {
  readonly color: string;
  readonly background: string;
  readonly border: string;
  readonly footerColor: string;
  readonly footerBorder: string;
} {
  if (tone === "success") {
    return {
      color: "#16a34a",
      background: "linear-gradient(180deg, rgba(240,253,244,0.9), rgba(255,255,255,0.98))",
      border: "1px solid rgba(22,163,74,0.18)",
      footerColor: "#166534",
      footerBorder: "1px solid rgba(22,163,74,0.14)",
    };
  }

  if (tone === "info") {
    return {
      color: "#1d4ed8",
      background: "linear-gradient(180deg, rgba(239,246,255,0.88), rgba(255,255,255,0.98))",
      border: "1px solid rgba(29,78,216,0.16)",
      footerColor: "#1e3a8a",
      footerBorder: "1px solid rgba(29,78,216,0.14)",
    };
  }

  return {
    color: "#b45309",
    background: "linear-gradient(180deg, rgba(255,251,235,0.88), rgba(255,255,255,0.98))",
    border: "1px solid rgba(217,119,6,0.18)",
    footerColor: "#92400e",
    footerBorder: "1px solid rgba(217,119,6,0.14)",
  };
}
