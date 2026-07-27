// App name: Job Mitra | AlreadyAppliedSection.tsx — glass + pressable (post-details polish)

import { SECTION_PAD } from "./shiftPostDetail.styles";

export type ActiveShiftApplicationStatus = "applied" | "shortlisted" | "waiting";

export function AlreadyAppliedSection({
  status,
  onWithdraw,
}: {
  readonly status: ActiveShiftApplicationStatus;
  readonly onWithdraw: () => void;
}) {
  const copy = getAlreadyAppliedSectionCopy(status);

  return (
    <section
      className="wm-shift-surface-glass wm-animateIn"
      data-testid="shift-post-already-applied"
      style={{
        ...SECTION_PAD,
        animationDelay: "120ms",
        border: "1px solid rgba(217,119,6,0.18)",
        background: "linear-gradient(180deg, rgba(255,251,235,0.82), rgba(255,255,255,0.98))",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontWeight: 950, fontSize: 14, color: "var(--wm-er-text, #1e293b)" }}>
            {copy.title}
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: "var(--wm-er-muted, #64748b)",
              lineHeight: 1.5,
            }}
          >
            {copy.helper}
          </div>
        </div>

        <span
          className="wm-shift-pill"
          style={{
            fontSize: 10,
            background: copy.badgeBackground,
            border: copy.badgeBorder,
            color: copy.badgeColor,
          }}
        >
          {copy.badge}
        </span>
      </div>

      <button
        type="button"
        className="wm-outlineBtn wm-shift-pressable"
        onClick={onWithdraw}
        style={{
          width: "100%",
          marginTop: 14,
          color: "#b45309",
          borderColor: "rgba(217,119,6,0.22)",
        }}
      >
        {copy.actionLabel}
      </button>
    </section>
  );
}

function getAlreadyAppliedSectionCopy(status: ActiveShiftApplicationStatus): {
  readonly title: string;
  readonly helper: string;
  readonly badge: string;
  readonly actionLabel: string;
  readonly badgeBackground: string;
  readonly badgeBorder: string;
  readonly badgeColor: string;
} {
  if (status === "shortlisted") {
    return {
      title: "You are shortlisted",
      helper:
        "Employer marked you as a strong candidate. Withdraw only if you are no longer available for this shift.",
      badge: "Shortlisted",
      actionLabel: "Withdraw from Shortlist",
      badgeBackground: "rgba(217,119,6,0.1)",
      badgeBorder: "1px solid rgba(217,119,6,0.18)",
      badgeColor: "#92400e",
    };
  }

  if (status === "waiting") {
    return {
      title: "You are on the backup list",
      helper:
        "You may be confirmed if a selected worker drops out. Stay ready, but continue applying to other suitable shifts too.",
      badge: "Backup",
      actionLabel: "Leave Backup List",
      badgeBackground: "rgba(217,119,6,0.1)",
      badgeBorder: "1px solid rgba(217,119,6,0.18)",
      badgeColor: "#92400e",
    };
  }

  return {
    title: "Application submitted",
    helper:
      "You have already applied for this shift. You can withdraw if you are no longer available.",
    badge: "Applied",
    actionLabel: "Withdraw Application",
    badgeBackground: "rgba(22,163,74,0.08)",
    badgeBorder: "1px solid rgba(22,163,74,0.16)",
    badgeColor: "var(--wm-er-accent-shift, #16a34a)",
  };
}
