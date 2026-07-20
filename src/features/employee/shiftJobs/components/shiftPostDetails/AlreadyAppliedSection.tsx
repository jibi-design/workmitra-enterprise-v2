// App name: Job Mitra
// File name: AlreadyAppliedSection.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\shiftPostDetails\AlreadyAppliedSection.tsx

import { CARD_STYLE } from "./shiftPostDetail.styles";

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
    <div
      className="wm-ee-card"
      style={{
        ...CARD_STYLE,
        marginBottom: 24,
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
          style={{
            padding: "5px 9px",
            borderRadius: 999,
            background: copy.badgeBackground,
            border: copy.badgeBorder,
            color: copy.badgeColor,
            fontSize: 10,
            fontWeight: 950,
            whiteSpace: "nowrap",
          }}
        >
          {copy.badge}
        </span>
      </div>

      <button
        type="button"
        onClick={onWithdraw}
        style={{
          width: "100%",
          marginTop: 14,
          padding: "11px 12px",
          borderRadius: 14,
          border: "1px solid rgba(217,119,6,0.22)",
          background: "#fff",
          color: "#b45309",
          fontSize: 13,
          fontWeight: 950,
          cursor: "pointer",
        }}
      >
        {copy.actionLabel}
      </button>
    </div>
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
