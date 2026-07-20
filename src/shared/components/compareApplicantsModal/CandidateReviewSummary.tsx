// App name: Job Mitra
// File name: CandidateReviewSummary.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\shared\components\compareApplicantsModal\CandidateReviewSummary.tsx

import type { CompareColumn } from "./compareApplicantsModal.types";
import { formatStatus, getDecisionSignal } from "./compareApplicantsModal.formatters";
import { CAREER_BLUE_DEEP, CAREER_MUTED, CAREER_TEXT } from "./compareApplicantsModal.theme";

type CandidateReviewSummaryProps = {
  columns: CompareColumn[];
};

export function CandidateReviewSummary({ columns }: CandidateReviewSummaryProps) {
  return (
    <div
      style={{
        padding: 11,
        borderRadius: 20,
        background:
          "radial-gradient(circle at 100% 0%, rgba(29,78,216,0.08), transparent 32%), linear-gradient(135deg, rgba(239,246,255,0.80), rgba(255,255,255,0.97))",
        border: "1px solid rgba(29,78,216,0.12)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.2, fontWeight: 950, color: CAREER_TEXT, lineHeight: 1.2 }}>
            Suggested review order
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 11.2,
              fontWeight: 760,
              color: CAREER_MUTED,
              lineHeight: 1.45,
            }}
          >
            Review clue only. Final selection must remain manual.
          </div>
        </div>

        <span
          style={{
            flexShrink: 0,
            padding: "5px 8px",
            borderRadius: 999,
            background: "rgba(29,78,216,0.08)",
            border: "1px solid rgba(29,78,216,0.12)",
            color: CAREER_BLUE_DEEP,
            fontSize: 9.5,
            fontWeight: 950,
            whiteSpace: "nowrap",
          }}
        >
          {columns.length} selected
        </span>
      </div>

      <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
        {columns.map((column, index) => (
          <CompactReviewRow key={column.applicant.id} column={column} orderNumber={index + 1} />
        ))}
      </div>
    </div>
  );
}

function CompactReviewRow({ column, orderNumber }: { column: CompareColumn; orderNumber: number }) {
  const applicant = column.applicant;
  const signal = getDecisionSignal(applicant.priorityTag);

  return (
    <article
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 9,
        alignItems: "center",
        padding: "8px 9px",
        borderRadius: 15,
        background: "rgba(255,255,255,0.84)",
        border: `1px solid ${signal.border}`,
      }}
    >
      <div
        style={{
          width: 27,
          height: 27,
          borderRadius: 999,
          background: signal.background,
          border: `1px solid ${signal.border}`,
          color: signal.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10.5,
          fontWeight: 950,
          lineHeight: 1,
        }}
      >
        {orderNumber}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <div
            style={{
              fontSize: 12.6,
              fontWeight: 950,
              color: CAREER_TEXT,
              lineHeight: 1.15,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
          >
            {applicant.name || "Worker Profile"}
          </div>

          <span
            style={{
              display: "inline-flex",
              padding: "3px 7px",
              borderRadius: 999,
              background: signal.background,
              border: `1px solid ${signal.border}`,
              color: signal.color,
              fontSize: 8.8,
              fontWeight: 950,
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {column.reviewOrderLabel}
          </span>
        </div>

        <div
          style={{
            marginTop: 4,
            fontSize: 10.1,
            fontWeight: 780,
            color: CAREER_MUTED,
            lineHeight: 1.35,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {formatStatus(applicant.status)} · {applicant.experience || "Experience not specified"} ·{" "}
          {column.matchedSkillsText}
        </div>
      </div>

      <div
        style={{
          flexShrink: 0,
          padding: "5px 8px",
          borderRadius: 13,
          background: "rgba(239,246,255,0.72)",
          border: "1px solid rgba(29,78,216,0.10)",
          color: CAREER_BLUE_DEEP,
          fontSize: 9.8,
          fontWeight: 950,
          whiteSpace: "nowrap",
        }}
      >
        {column.experienceLevel}
      </div>
    </article>
  );
}
