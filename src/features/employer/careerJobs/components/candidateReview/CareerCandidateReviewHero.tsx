// App name: Job Mitra | CareerCandidateReviewHero.tsx — DomainHero (full Career)

import { DomainHero } from "../../../../../shared/components/layout/DomainHero";
import type { CareerApplication, CareerJobPost } from "../../types/careerTypes";
import {
  formatReviewDateTime,
  formatReviewStage,
  formatReviewTitle,
} from "./careerCandidateReviewFormatters";
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
    <DomainHero
      variant="career"
      audience="employer"
      eyebrow="Candidate application"
      title={candidateName}
      subtitle={`For ${formatReviewTitle(post.jobTitle)} at ${post.companyName}`}
      description="Application snapshot before shortlist or interview decisions."
      trailing={<StatusPill label={formatReviewStage(app.stage)} />}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--wm-space-8)" }}>
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
    </DomainHero>
  );
}
