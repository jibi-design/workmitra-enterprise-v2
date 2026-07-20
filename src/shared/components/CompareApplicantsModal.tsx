// App name: Job Mitra
// File name: CompareApplicantsModal.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\shared\components\CompareApplicantsModal.tsx

import { ratingStorage } from "../rating/ratingStorage";
import { CandidateReviewSummary } from "./compareApplicantsModal/CandidateReviewSummary";
import { CompareDecisionMatrix } from "./compareApplicantsModal/CompareDecisionMatrix";
import {
  formatDate,
  getExperienceLevel,
  getReviewOrderLabel,
  getSkillMatchText,
  getSkillsText,
} from "./compareApplicantsModal/compareApplicantsModal.formatters";
import type {
  ComparableApplicant,
  CompareColumn,
} from "./compareApplicantsModal/compareApplicantsModal.types";
import {
  CAREER_BLUE_DEEP,
  CAREER_MUTED,
  CAREER_TEXT,
} from "./compareApplicantsModal/compareApplicantsModal.theme";

export type { ComparableApplicant };

type Props = {
  isOpen: boolean;
  applicants: ComparableApplicant[];
  onClose: () => void;
};

export function CompareApplicantsModal({ isOpen, applicants, onClose }: Props) {
  if (!isOpen || applicants.length === 0) return null;

  const compareColumns: CompareColumn[] = applicants.slice(0, 3).map((applicant, index) => {
    const summary = ratingStorage.getWorkerSummary(applicant.wmId);

    return {
      applicant,
      ratingText:
        summary.totalRatings > 0 ? `${summary.averageStars.toFixed(1)} stars` : "No ratings yet",
      experienceLevel: getExperienceLevel(applicant.experience),
      matchedSkillsText: getSkillMatchText(applicant.skills ?? [], applicant.requiredSkills ?? []),
      skillsText: getSkillsText(applicant.skills ?? []),
      appliedDate: formatDate(applicant.appliedAt),
      reviewOrderLabel: getReviewOrderLabel(index),
    };
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        padding: 14,
        background: "rgba(15,23,42,0.60)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={undefined}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 570,
          maxHeight: "91vh",
          overflow: "hidden",
          borderRadius: 27,
          background: "#fff",
          boxShadow: "0 30px 76px rgba(15,23,42,0.30)",
          border: "1px solid rgba(226,232,240,0.92)",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          style={{
            padding: "17px 18px 15px",
            borderBottom: "1px solid rgba(226,232,240,0.95)",
            background:
              "radial-gradient(circle at 100% 0%, rgba(29,78,216,0.13), transparent 34%), linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.98))",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: "inline-flex",
                padding: "5px 9px",
                borderRadius: 999,
                background: "rgba(29,78,216,0.085)",
                border: "1px solid rgba(29,78,216,0.14)",
                color: CAREER_BLUE_DEEP,
                fontSize: 9.5,
                fontWeight: 950,
                textTransform: "uppercase",
                letterSpacing: 0.42,
              }}
            >
              Employer decision view
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 18,
                fontWeight: 950,
                color: CAREER_TEXT,
                lineHeight: 1.12,
              }}
            >
              Compare Candidates
            </div>

            <div
              style={{
                marginTop: 5,
                fontSize: 12,
                color: CAREER_MUTED,
                fontWeight: 760,
                lineHeight: 1.45,
              }}
            >
              Review strengths, gaps, and decision-critical details before moving candidates
              forward.
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close compare candidates"
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              border: "1px solid rgba(226,232,240,0.95)",
              background: "#fff",
              cursor: "pointer",
              fontSize: 18,
              fontWeight: 900,
              color: CAREER_MUTED,
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ maxHeight: "calc(91vh - 96px)", overflow: "auto", padding: 14 }}>
          <CandidateReviewSummary columns={compareColumns} />

          <div
            style={{
              marginTop: 13,
              padding: 11,
              borderRadius: 19,
              background: "linear-gradient(135deg, rgba(255,251,235,0.80), rgba(255,255,255,0.96))",
              border: "1px solid rgba(217,119,6,0.13)",
              color: "#92400e",
              fontSize: 11.3,
              fontWeight: 830,
              lineHeight: 1.45,
            }}
          >
            Decision aid only. Check profile, cover note, screening answers, and interview context
            before confirming any hiring step.
          </div>

          <CompareDecisionMatrix columns={compareColumns} />
        </div>
      </section>
    </div>
  );
}
