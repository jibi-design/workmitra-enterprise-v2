import { CAREER_ANALYSIS_MUTED, CAREER_ANALYSIS_TEXT } from "./careerAnalysisTheme";
import { TrustStrip } from "../../../../../shared/components/enterprise";

export function AnalysisHeader({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
      }}
    >
      <div>
        <div style={{ fontSize: 18, fontWeight: 900, color: CAREER_ANALYSIS_TEXT }}>
          Local candidate analysis
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 13,
            fontWeight: 700,
            color: CAREER_ANALYSIS_MUTED,
            lineHeight: 1.5,
          }}
        >
          This only suggests candidates based on local profile, screening answers, salary and notice
          period.
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="wm-close-btn"
        style={{
          flexShrink: 0,
          width: 32,
          height: 32,
          borderRadius: 16,
          border: "none",
          background: "rgba(15, 23, 42, 0.04)",
          color: CAREER_ANALYSIS_MUTED,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        aria-label="Hide Analysis"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}

export function AnalysisLockedNotice() {
  return (
    <div style={{ marginTop: 16 }}>
      <TrustStrip
        kind="lock"
        tone="pending"
        title="Analysis locked"
        message="Suggestions are saved. Clear suggestions before running analysis again. Backup candidates may appear again in a future analysis if they remain Applied."
        badgeLabel="Locked"
        testId="career-analysis-lock-trust"
      />
    </div>
  );
}

export function ManualReviewWarning() {
  return (
    <div
      style={{
        marginTop: 16,
        padding: "12px 14px",
        borderRadius: 16,
        background: "rgba(254,242,242,0.8)",
        border: "1px solid rgba(220,38,38,0.2)",
        color: "#dc2626",
        fontSize: 12,
        fontWeight: 800,
        lineHeight: 1.5,
      }}
    >
      Manual review required. Read each candidate profile, cover note and screening answers before
      confirming the shortlist. This is not an automatic hiring decision.
    </div>
  );
}
