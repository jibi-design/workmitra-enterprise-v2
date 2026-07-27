import type { AnalyzedCandidate } from "./careerCandidateAnalysis.types";
import {
  CAREER_ANALYSIS_BLUE_DEEP,
  CAREER_ANALYSIS_MUTED,
  CAREER_ANALYSIS_TEXT,
  CAREER_ANALYSIS_WARNING,
} from "./careerAnalysisTheme";
import type { AnalysisBucketTone } from "./careerAnalysisBucket.helpers";
import { getCandidateBackground, getCandidateBorder } from "./careerAnalysisBucket.helpers";

type CandidateRowProps = {
  candidate: AnalyzedCandidate;
  tone: AnalysisBucketTone;
  selected: boolean;
  selectable: boolean;
  onToggleSelected: (appId: string) => void;
  onReviewApplication: (appId: string) => void;
};

export function BackupReserveMarker() {
  return (
    <span
      aria-label="Backup reserve"
      style={{
        width: 26,
        height: 26,
        borderRadius: "var(--wm-radius-pill)",
        border: "1px solid rgba(217,119,6,0.24)",
        background: "rgba(255,251,235,0.95)",
        color: CAREER_ANALYSIS_WARNING,
        fontSize: 12,
        fontWeight: 950,
        lineHeight: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      ✓
    </span>
  );
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        minWidth: 0,
        padding: "6px 7px",
        borderRadius: "var(--wm-radius-10)",
        background: "rgba(248,250,252,0.9)",
        border: "1px solid rgba(148,163,184,0.10)",
      }}
    >
      <div
        style={{
          fontSize: 8.5,
          fontWeight: 950,
          color: CAREER_ANALYSIS_MUTED,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 2,
          fontSize: 10.6,
          fontWeight: 900,
          color: CAREER_ANALYSIS_TEXT,
          lineHeight: 1.25,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export function CareerAnalysisCandidateRow({
  candidate,
  tone,
  selected,
  selectable,
  onToggleSelected,
  onReviewApplication,
}: CandidateRowProps) {
  const showBackupMarker = tone === "backup";
  const showMarker = selectable || showBackupMarker;

  return (
    <div
      style={{
        width: "100%",
        padding: "9px 10px",
        borderRadius: "var(--wm-radius-chip)",
        border: getCandidateBorder(tone, selected),
        background: getCandidateBackground(tone, selected),
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: showMarker ? "auto 1fr auto" : "1fr auto",
          gap: 8,
          alignItems: "start",
        }}
      >
        {selectable && (
          <button
            type="button"
            onClick={() => onToggleSelected(candidate.app.id)}
            aria-label={selected ? "Remove from shortlist selection" : "Select for shortlist"}
            style={{
              width: 26,
              height: 26,
              borderRadius: "var(--wm-radius-pill)",
              border: selected
                ? "1px solid rgba(29,78,216,0.30)"
                : "1px solid rgba(148,163,184,0.22)",
              background: selected ? "rgba(29,78,216,0.12)" : "rgba(255,255,255,0.9)",
              color: selected ? CAREER_ANALYSIS_BLUE_DEEP : CAREER_ANALYSIS_MUTED,
              fontSize: 12,
              fontWeight: 950,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            {selected ? "✓" : ""}
          </button>
        )}

        {showBackupMarker && <BackupReserveMarker />}

        <div style={{ minWidth: 0 }}>
          <button
            type="button"
            onClick={() => onReviewApplication(candidate.app.id)}
            style={{
              border: "none",
              padding: 0,
              background: "transparent",
              textAlign: "left",
              cursor: "pointer",
              color: CAREER_ANALYSIS_TEXT,
            }}
          >
            <div style={{ fontSize: 12.2, fontWeight: 950, lineHeight: 1.25 }}>
              {candidate.app.employeeName || candidate.app.profileSnapshot?.fullName || "Candidate"}
            </div>

            <div
              style={{
                marginTop: 3,
                fontSize: 10.8,
                fontWeight: 820,
                color: CAREER_ANALYSIS_MUTED,
                lineHeight: 1.35,
              }}
            >
              {candidate.reason}
            </div>
          </button>

          {tone === "backup" && (
            <div
              style={{
                marginTop: 4,
                display: "inline-flex",
                padding: "3px 8px",
                borderRadius: "var(--wm-radius-pill)",
                background: "rgba(255,251,235,0.95)",
                border: "1px solid rgba(217,119,6,0.18)",
                color: CAREER_ANALYSIS_WARNING,
                fontSize: 9.8,
                fontWeight: 950,
                lineHeight: 1,
              }}
            >
              Backup reserve
            </div>
          )}
        </div>

        <span
          style={{
            flexShrink: 0,
            padding: "4px 8px",
            borderRadius: "var(--wm-radius-pill)",
            background: tone === "backup" ? "rgba(255,251,235,0.95)" : "rgba(239,246,255,0.96)",
            border:
              tone === "backup"
                ? "1px solid rgba(217,119,6,0.18)"
                : "1px solid rgba(29,78,216,0.15)",
            fontSize: 10.2,
            fontWeight: 950,
            color: tone === "backup" ? CAREER_ANALYSIS_WARNING : CAREER_ANALYSIS_BLUE_DEEP,
            whiteSpace: "nowrap",
          }}
        >
          Review score {candidate.score}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onReviewApplication(candidate.app.id)}
        style={{
          marginTop: 7,
          border:
            tone === "backup" ? "1px solid rgba(217,119,6,0.16)" : "1px solid rgba(29,78,216,0.14)",
          background: tone === "backup" ? "rgba(255,251,235,0.72)" : "rgba(239,246,255,0.76)",
          color: tone === "backup" ? CAREER_ANALYSIS_WARNING : CAREER_ANALYSIS_BLUE_DEEP,
          borderRadius: "var(--wm-radius-pill)",
          padding: "5px 10px",
          fontSize: 10.8,
          fontWeight: 950,
          cursor: "pointer",
        }}
      >
        Review application
      </button>

      <div style={{ marginTop: 7, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
        <SmallMetric label="Candidate skills" value={candidate.skillMatch} />
        <SmallMetric label="Screening" value={candidate.screening} />
        <SmallMetric label="Cover note" value={candidate.coverNote} />
        <SmallMetric label="Salary" value={candidate.salary} />
      </div>
    </div>
  );
}
