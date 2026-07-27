// App name: Job Mitra
// File name: careerCandidateReviewUi.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\candidateReview\careerCandidateReviewUi.tsx

import type { ReactNode } from "react";
import {
  CAREER_REVIEW_BLUE,
  CAREER_REVIEW_BLUE_DEEP,
  CAREER_REVIEW_BORDER,
  CAREER_REVIEW_MUTED,
  CAREER_REVIEW_TEXT,
} from "./careerCandidateReviewTheme";

export function ReviewCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section
      style={{
        padding: 14,
        borderRadius: "var(--wm-radius-employer-card)",
        border: `1px solid ${CAREER_REVIEW_BORDER}`,
        background:
          "radial-gradient(circle at 100% 0%, rgba(29,78,216,0.045), transparent 32%), linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.98))",
        boxShadow: "0 11px 24px rgba(15,23,42,0.045)",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 950, color: CAREER_REVIEW_TEXT, lineHeight: 1.2 }}>
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            marginTop: 3,
            fontSize: 11.5,
            fontWeight: 760,
            color: CAREER_REVIEW_MUTED,
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </div>
      )}
      <div style={{ marginTop: 10 }}>{children}</div>
    </section>
  );
}

export function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        minWidth: 0,
        padding: "9px 10px",
        borderRadius: "var(--wm-radius-chip)",
        border: "1px solid rgba(148,163,184,0.12)",
        background: "rgba(255,255,255,0.8)",
      }}
    >
      <SectionLabel label={label} />
      <div
        style={{
          marginTop: 4,
          fontSize: 11.8,
          fontWeight: 950,
          color: CAREER_REVIEW_TEXT,
          lineHeight: 1.25,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export function SectionLabel({ label }: { label: string }) {
  return (
    <div
      style={{
        fontSize: 9.2,
        fontWeight: 950,
        color: CAREER_REVIEW_MUTED,
        textTransform: "uppercase",
        letterSpacing: 0.4,
      }}
    >
      {label}
    </div>
  );
}

export function BodyText({ value }: { value: string }) {
  return (
    <div
      style={{
        marginTop: 5,
        fontSize: 12.2,
        fontWeight: 760,
        color: CAREER_REVIEW_TEXT,
        lineHeight: 1.55,
      }}
    >
      {value}
    </div>
  );
}

export function SkillChips({ skills }: { skills: string[] }) {
  if (skills.length === 0) {
    return (
      <div style={{ marginTop: 10 }}>
        <BodyText value="No skills listed." />
      </div>
    );
  }

  return (
    <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
      {skills.map((skill) => (
        <span
          key={skill}
          style={{
            padding: "5px 10px",
            borderRadius: "var(--wm-radius-pill)",
            background: "rgba(29,78,216,0.075)",
            color: CAREER_REVIEW_BLUE,
            border: "1px solid rgba(29,78,216,0.12)",
            fontSize: 11,
            fontWeight: 850,
          }}
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

export function StatusPill({ label }: { label: string }) {
  return (
    <span
      style={{
        flexShrink: 0,
        padding: "6px 10px",
        borderRadius: "var(--wm-radius-pill)",
        background: "rgba(29,78,216,0.075)",
        color: CAREER_REVIEW_BLUE_DEEP,
        border: "1px solid rgba(29,78,216,0.13)",
        fontSize: 10.5,
        fontWeight: 950,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

export function AnswerPill({ answer }: { answer: "yes" | "no" }) {
  const isYes = answer === "yes";

  return (
    <span
      style={{
        padding: "4px 9px",
        borderRadius: "var(--wm-radius-pill)",
        background: isYes ? "rgba(29,78,216,0.08)" : "rgba(220,38,38,0.08)",
        border: isYes ? "1px solid rgba(29,78,216,0.16)" : "1px solid rgba(220,38,38,0.16)",
        color: isYes ? CAREER_REVIEW_BLUE : "#dc2626",
        fontSize: 10.8,
        fontWeight: 950,
        whiteSpace: "nowrap",
      }}
    >
      {isYes ? "Yes" : "No"}
    </span>
  );
}
