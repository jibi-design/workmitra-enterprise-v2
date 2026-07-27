// App name: Job Mitra | ShiftPostApplyStatusCards.tsx — glass + pressable (post-details polish)

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
      {isShortlisted ? (
        <StatusCard
          title="You are shortlisted"
          helper="Employer marked you as a strong candidate. Keep your availability open and watch for confirmation."
          tone="warning"
        />
      ) : null}

      {isWaiting ? (
        <StatusCard
          title="You are on the backup list"
          helper="You may be confirmed if a selected worker drops out. Stay ready, but do not stop applying to other suitable shifts."
          tone="warning"
          footer="Tip: keep this shift in mind, but continue applying so you do not lose other opportunities."
        />
      ) : null}

      {isConfirmed ? (
        <StatusCard
          title={attendanceConfirmed ? "Intent confirmed" : "Confirm you will attend"}
          helper={
            attendanceConfirmed
              ? "You confirmed you plan to attend. Keep checking the workspace and arrive on time."
              : "You are selected for this shift. Confirm only if you are available and will attend on time."
          }
          tone={attendanceConfirmed ? "success" : "info"}
          actionLabel={attendanceConfirmed ? undefined : "I will attend"}
          onAction={attendanceConfirmed ? undefined : onConfirmAttendance}
          footer={
            attendanceConfirmed
              ? "This is attendance intent only — not QR punch-in, timers, or payroll (those are planned for v2.1)."
              : "This is not QR check-in, a timer, or payment. It only confirms your intention to attend."
          }
        />
      ) : null}

      {hasWorkspace ? (
        <section
          className="wm-shift-surface-glass wm-shift-surface-glass--shift wm-animateIn"
          data-testid="shift-post-workspace-ready"
          style={{ padding: 16, animationDelay: "140ms" }}
        >
          <div
            style={{ fontSize: 14, fontWeight: 800, color: "var(--wm-er-accent-shift, #16a34a)" }}
          >
            Workspace is ready
          </div>

          <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted, #64748b)" }}>
            This shift is active now. Open your workspace to continue.
          </div>

          <button
            type="button"
            className="wm-primarybtn wm-shift-pressable"
            onClick={onOpenWorkspace}
            style={{ marginTop: 12, width: "100%" }}
          >
            Open Workspace
          </button>
        </section>
      ) : null}
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
    <section
      className="wm-shift-surface-glass wm-animateIn"
      style={{
        padding: 16,
        border: toneStyle.border,
        background: toneStyle.background,
        animationDelay: "130ms",
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

      {footer ? (
        <div
          className="wm-shift-surface-glass"
          style={{
            marginTop: 10,
            padding: "9px 10px",
            color: toneStyle.footerColor,
            border: toneStyle.footerBorder,
            fontSize: 11,
            fontWeight: 800,
            lineHeight: 1.45,
          }}
        >
          {footer}
        </div>
      ) : null}

      {actionLabel && onAction ? (
        <button
          type="button"
          className="wm-primarybtn wm-shift-pressable"
          onClick={onAction}
          style={{ marginTop: 12, width: "100%" }}
        >
          {actionLabel}
        </button>
      ) : null}
    </section>
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
