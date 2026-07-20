// App name: Job Mitra
// File name: CareerCandidateReviewHeader.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\candidateReview\CareerCandidateReviewHeader.tsx

import {
  CAREER_REVIEW_BLUE_DEEP,
  CAREER_REVIEW_MUTED,
  CAREER_REVIEW_TEXT,
} from "./careerCandidateReviewTheme";

export function CareerCandidateReviewHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <section
      style={{
        padding: "12px 14px",
        borderRadius: 22,
        border: "1px solid rgba(29,78,216,0.11)",
        background:
          "radial-gradient(circle at 100% 0%, rgba(29,78,216,0.07), transparent 34%), linear-gradient(135deg, rgba(255,255,255,0.99), rgba(248,250,252,0.96))",
        boxShadow: "0 10px 22px rgba(15,23,42,0.045)",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "5px 9px",
          borderRadius: 999,
          background: "rgba(29,78,216,0.07)",
          border: "1px solid rgba(29,78,216,0.11)",
          color: CAREER_REVIEW_BLUE_DEEP,
          fontSize: 9.5,
          fontWeight: 950,
          textTransform: "uppercase",
          letterSpacing: 0.45,
        }}
      >
        Employer review console
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 18,
          fontWeight: 950,
          color: CAREER_REVIEW_TEXT,
          lineHeight: 1.15,
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 11.8,
          fontWeight: 760,
          color: CAREER_REVIEW_MUTED,
          lineHeight: 1.4,
        }}
      >
        {subtitle}
      </div>
    </section>
  );
}
