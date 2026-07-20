// App name: Job Mitra
// File name: CareerCandidateReviewHero.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\candidateReview\CareerCandidateReviewHero.tsx

import type { CareerApplication, CareerJobPost } from "../../types/careerTypes";
import {
  formatReviewDateTime,
  formatReviewStage,
  formatReviewTitle,
} from "./careerCandidateReviewFormatters";
import {
  CAREER_REVIEW_BLUE_DEEP,
  CAREER_REVIEW_BORDER,
  CAREER_REVIEW_CARD_SHADOW,
  CAREER_REVIEW_MUTED,
  CAREER_REVIEW_TEXT,
} from "./careerCandidateReviewTheme";
import { InfoBox, StatusPill } from "./careerCandidateReviewUi";

type CareerCandidateReviewHeroProps = {
  post: CareerJobPost;
  app: CareerApplication;
};

export function CareerCandidateReviewHero({ post, app }: CareerCandidateReviewHeroProps) {
  const profile = app.profileSnapshot;
  const screeningQuestions = post.screeningQuestions ?? [];
  const candidateName = app.employeeName || profile?.fullName || "Candidate";
  const answeredCount = screeningQuestions.filter(
    (question) => app.screeningAnswers?.[question.id],
  ).length;

  return (
    <section
      style={{
        marginTop: 12,
        padding: 15,
        borderRadius: 26,
        border: `1px solid ${CAREER_REVIEW_BORDER}`,
        background:
          "radial-gradient(circle at 100% 0%, rgba(29,78,216,0.12), transparent 34%), linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.985))",
        boxShadow: CAREER_REVIEW_CARD_SHADOW,
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
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "6px 10px",
              borderRadius: 999,
              background: "rgba(29,78,216,0.075)",
              border: "1px solid rgba(29,78,216,0.13)",
              color: CAREER_REVIEW_BLUE_DEEP,
              fontSize: 10,
              fontWeight: 950,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Candidate application
          </div>

          <div
            style={{
              marginTop: 10,
              fontSize: 24,
              fontWeight: 950,
              color: CAREER_REVIEW_TEXT,
              lineHeight: 1.08,
            }}
          >
            {candidateName}
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 12.5,
              fontWeight: 780,
              color: CAREER_REVIEW_MUTED,
              lineHeight: 1.45,
            }}
          >
            For <b>{formatReviewTitle(post.jobTitle)}</b> at <b>{post.companyName}</b>
          </div>
        </div>

        <StatusPill label={formatReviewStage(app.stage)} />
      </div>

      <div style={{ marginTop: 13, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <InfoBox
          label="Worker code"
          value={profile?.uniqueId || app.employeeId || "Not provided"}
        />
        <InfoBox label="Applied" value={formatReviewDateTime(app.appliedAt)} />
        <InfoBox label="Notice" value={app.noticePeriod || "Not specified"} />
        <InfoBox
          label="Answers"
          value={`${answeredCount} / ${screeningQuestions.length} answered`}
        />
      </div>
    </section>
  );
}
