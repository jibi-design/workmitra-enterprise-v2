// App name: Job Mitra | EmployerCandidateDetailPage.tsx — DomainHero (Wave 5)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { EnterpriseEmpty } from "../../../../shared/components/enterprise/EnterpriseEmpty";
import { EmployerCandidateIdentityCard } from "../components/EmployerCandidateIdentityCard";
import { EmployerCandidateMatchScore } from "../components/EmployerCandidateMatchScore";
import { EmployerCandidateProfileCard } from "../components/EmployerCandidateProfileCard";
import { EmployerCandidateRequirementCard } from "../components/EmployerCandidateRequirementCard";
import type { AnswerState } from "../helpers/employerCandidateDetail.helpers";
import { useEmployerCandidateDetailState } from "../hooks/useEmployerCandidateDetailState";

export function EmployerCandidateDetailPage() {
  const { app, post, mustHave, goodToHave, displayId, workerMlId, workerRating } =
    useEmployerCandidateDetailState();

  if (!app) {
    return (
      <div>
        <DomainHero
          variant="shift"
          audience="employer"
          title="Candidate"
          subtitle="Application not found"
          description="This shift application is no longer available."
        />

        <EnterpriseEmpty
          title="This application is not available"
          subtitle="Return to the previous screen to continue reviewing candidates."
          domain="shift"
          primaryLabel="Back"
          onPrimary={() => window.history.back()}
        />
      </div>
    );
  }

  return (
    <div>
      <DomainHero
        variant="shift"
        audience="employer"
        title="Candidate Detail"
        subtitle={post ? `${post.jobName} - ${post.companyName}` : "Shift Job"}
        description="Review candidate identity, Profile Fit Score, and requirement answers."
      />

      <EmployerCandidateIdentityCard app={app} displayId={displayId} />

      {post && (
        <EmployerCandidateMatchScore
          mustHaveAnswers={app.mustHaveAnswers as Record<string, AnswerState>}
          goodToHaveAnswers={app.goodToHaveAnswers as Record<string, AnswerState>}
          mustHave={mustHave}
          goodToHave={goodToHave}
        />
      )}

      <EmployerCandidateProfileCard
        snapshot={app.profileSnapshot}
        workerRating={workerRating}
        workerMlId={workerMlId}
        shiftStartAt={post?.startAt}
        applicantStatus={app.status}
      />

      <EmployerCandidateRequirementCard
        title="Minimum Requirements"
        emptyText="No minimum requirements were set for this post."
        items={mustHave}
        answers={app.mustHaveAnswers as Record<string, AnswerState>}
        notes={app.notes}
      />

      <EmployerCandidateRequirementCard
        title="Good to Have"
        emptyText="No optional requirements were set for this post."
        items={goodToHave}
        answers={app.goodToHaveAnswers as Record<string, AnswerState>}
        notes={app.notes}
        isLast
      />
    </div>
  );
}
