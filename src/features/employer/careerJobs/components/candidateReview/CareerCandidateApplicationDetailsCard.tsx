// App name: Job Mitra
// File name: CareerCandidateApplicationDetailsCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\candidateReview\CareerCandidateApplicationDetailsCard.tsx

import { useState } from "react";
import type { CareerApplication } from "../../types/careerTypes";
import { CAREER_REVIEW_BLUE_DEEP, CAREER_REVIEW_MUTED } from "./careerCandidateReviewTheme";
import { BodyText, InfoBox, ReviewCard, SectionLabel } from "./careerCandidateReviewUi";

export function CareerCandidateApplicationDetailsCard({ app }: { app: CareerApplication }) {
  const [openResumeSummary, setOpenResumeSummary] = useState(false);
  const [openCoverNote, setOpenCoverNote] = useState(false);

  return (
    <ReviewCard
      title="Application details"
      subtitle="Decision-critical details shared by the candidate."
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <InfoBox
          label="Expected salary"
          value={app.expectedSalary > 0 ? app.expectedSalary.toLocaleString() : "Not specified"}
        />
        <InfoBox label="Notice period" value={app.noticePeriod || "Not specified"} />
      </div>

      <ExpandableTextPanel
        title="Resume summary"
        closedText={app.resumeSummary ? "Resume summary available" : "No resume summary provided"}
        value={app.resumeSummary || "No resume summary provided."}
        open={openResumeSummary}
        onToggle={() => setOpenResumeSummary((current) => !current)}
      />

      <ExpandableTextPanel
        title="Cover note"
        closedText={app.coverNote ? "Cover note attached" : "No cover note provided"}
        value={app.coverNote || "No cover note provided."}
        open={openCoverNote}
        onToggle={() => setOpenCoverNote((current) => !current)}
      />
    </ReviewCard>
  );
}

function ExpandableTextPanel({
  title,
  closedText,
  value,
  open,
  onToggle,
}: {
  title: string;
  closedText: string;
  value: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        marginTop: 10,
        borderRadius: "var(--wm-radius-chip)",
        background: "rgba(248,250,252,0.86)",
        border: "1px solid rgba(148,163,184,0.11)",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: "100%",
          border: "none",
          background: "transparent",
          padding: "10px",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 10,
          alignItems: "center",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <SectionLabel label={title} />
          <div
            style={{
              marginTop: 4,
              fontSize: 11.5,
              fontWeight: 800,
              color: CAREER_REVIEW_MUTED,
              lineHeight: 1.35,
            }}
          >
            {closedText}
          </div>
        </div>

        <span
          style={{
            fontSize: 11,
            fontWeight: 950,
            color: CAREER_REVIEW_BLUE_DEEP,
            whiteSpace: "nowrap",
          }}
        >
          {open ? "Hide" : "View"}
        </span>
      </button>

      {open && (
        <div style={{ padding: "0 10px 10px" }}>
          <BodyText value={value} />
        </div>
      )}
    </div>
  );
}
