import {
  CAREER_ANALYSIS_MUTED,
  CAREER_ANALYSIS_TEXT,
  CAREER_ANALYSIS_WARNING,
} from "./careerAnalysisTheme";

export function AnalysisClosedCard({
  appsCount,
  analysisLocked,
  onOpen,
  onResetAnalysis,
}: {
  appsCount: number;
  analysisLocked: boolean;
  onOpen: () => void;
  onResetAnalysis: () => void;
}) {
  if (analysisLocked) {
    return (
      <div
        className="wm-analysis-widget"
        style={{
          padding: 24,
          borderRadius: "var(--wm-radius-employer-card)",
          border: "1px solid rgba(255, 255, 255, 0.9)",
          background: "linear-gradient(135deg, rgba(254,243,199,0.6), rgba(255,255,255,0.9))",
          boxShadow: "0 12px 32px -4px rgba(217,119,6,0.05), inset 0 1px 0 rgba(255,255,255,1)",
          backdropFilter: "blur(24px)",
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 900, color: CAREER_ANALYSIS_WARNING }}>
          Analysis suggestions saved
        </div>

        <div
          style={{
            marginTop: 8,
            fontSize: 13,
            fontWeight: 700,
            color: CAREER_ANALYSIS_MUTED,
            lineHeight: 1.5,
          }}
        >
          Backup suggestions are saved for this post. Clear suggestions only if you want to run
          analysis again for the remaining Applied candidates.
        </div>

        <div
          style={{
            marginTop: 16,
            padding: "12px 14px",
            borderRadius: "var(--wm-radius-chip)",
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(217,119,6,0.15)",
            color: CAREER_ANALYSIS_WARNING,
            fontSize: 12,
            fontWeight: 800,
            lineHeight: 1.5,
          }}
        >
          Clear suggestions will remove backup markers. Already shortlisted candidates will stay in
          Shortlist.
        </div>

        <button
          type="button"
          onClick={onResetAnalysis}
          className="wm-analysis-btn"
          style={{
            marginTop: 16,
            width: "100%",
            minHeight: 46,
            borderRadius: "var(--wm-radius-chip)",
            border: "1px solid rgba(217,119,6,0.2)",
            background: "rgba(255,251,235,0.9)",
            color: CAREER_ANALYSIS_WARNING,
            fontSize: 13,
            fontWeight: 900,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(217,119,6,0.05)",
          }}
        >
          Clear Suggestions
        </button>
      </div>
    );
  }

  return (
    <div
      className="wm-analysis-widget"
      style={{
        padding: 24,
        borderRadius: "var(--wm-radius-employer-card)",
        border: "1px solid rgba(255, 255, 255, 0.9)",
        background: "linear-gradient(135deg, rgba(239,246,255,0.8), rgba(255,255,255,0.95))",
        boxShadow: "0 12px 32px -4px rgba(37,99,235,0.05), inset 0 1px 0 rgba(255,255,255,1)",
        backdropFilter: "blur(24px)",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 900, color: CAREER_ANALYSIS_TEXT }}>
        Analyze candidates before shortlist
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 13,
          fontWeight: 700,
          color: CAREER_ANALYSIS_MUTED,
          lineHeight: 1.5,
        }}
      >
        {appsCount} candidate{appsCount === 1 ? "" : "s"} applied. Set shortlist and backup counts,
        then run local analysis before manually confirming who should move to Shortlist.
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="wm-analysis-btn"
        style={{
          marginTop: 16,
          width: "100%",
          minHeight: 46,
          borderRadius: "var(--wm-radius-chip)",
          border: "none",
          background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
          color: "#fff",
          fontSize: 13,
          fontWeight: 900,
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(37,99,235,0.25)",
        }}
      >
        Analyze Candidates
      </button>
    </div>
  );
}
