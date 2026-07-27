// App name: Job Mitra
// File name: CareerAnalysisBucket.tsx — facade

import type { AnalyzedCandidate } from "./careerCandidateAnalysis.types";
import { CAREER_ANALYSIS_TEXT, CAREER_ANALYSIS_WARNING } from "./careerAnalysisTheme";
import {
  getBucketBackground,
  getBucketBorder,
  type AnalysisBucketTone,
} from "./careerAnalysisBucket.helpers";
import { CareerAnalysisCandidateRow } from "./CareerAnalysisBucket.parts";

type CareerAnalysisBucketProps = {
  title: string;
  tone: AnalysisBucketTone;
  candidates: AnalyzedCandidate[];
  selectedShortlistIds: Set<string>;
  selectable?: boolean;
  onToggleSelected: (appId: string) => void;
  onReviewApplication: (appId: string) => void;
};

export function CareerAnalysisBucket({
  title,
  tone,
  candidates,
  selectedShortlistIds,
  selectable = false,
  onToggleSelected,
  onReviewApplication,
}: CareerAnalysisBucketProps) {
  return (
    <div
      style={{
        padding: "9px",
        borderRadius: "var(--wm-radius-chip)",
        background: getBucketBackground(tone),
        border: getBucketBorder(tone),
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 950,
          color: tone === "backup" ? CAREER_ANALYSIS_WARNING : CAREER_ANALYSIS_TEXT,
        }}
      >
        {title}
      </div>

      {tone === "backup" && (
        <div
          style={{
            marginTop: 5,
            fontSize: 10.8,
            fontWeight: 780,
            color: CAREER_ANALYSIS_WARNING,
            lineHeight: 1.35,
          }}
        >
          These candidates will stay in Applied as backup suggestions after shortlist is moved.
        </div>
      )}

      <div style={{ marginTop: 7, display: "grid", gap: 6 }}>
        {candidates.map((candidate) => (
          <CareerAnalysisCandidateRow
            key={candidate.app.id}
            candidate={candidate}
            tone={tone}
            selected={selectedShortlistIds.has(candidate.app.id)}
            selectable={selectable}
            onToggleSelected={onToggleSelected}
            onReviewApplication={onReviewApplication}
          />
        ))}
      </div>
    </div>
  );
}
