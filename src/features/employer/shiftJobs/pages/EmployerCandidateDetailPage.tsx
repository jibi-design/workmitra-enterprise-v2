// App name: Job Mitra
// File name: EmployerCandidateDetailPage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\pages\EmployerCandidateDetailPage.tsx

import { EmployerCandidateIdentityCard } from "../components/EmployerCandidateIdentityCard";
import { EmployerCandidateMatchScore } from "../components/EmployerCandidateMatchScore";
import { EmployerCandidateProfileCard } from "../components/EmployerCandidateProfileCard";
import { EmployerCandidateRequirementCard } from "../components/EmployerCandidateRequirementCard";
import type { AnswerState } from "../helpers/employerCandidateDetail.helpers";
import { useEmployerCandidateDetailState } from "../hooks/useEmployerCandidateDetailState";

export function EmployerCandidateDetailPage() {
  const { app, post, mustHave, goodToHave, displayId, workerWmId, workerRating } =
    useEmployerCandidateDetailState();

  if (!app) {
    return (
      <div>
        <div className="wm-pageHead">
          <div>
            <div className="wm-pageTitle">Candidate</div>
            <div className="wm-pageSub">Application not found.</div>
          </div>
        </div>

        <div style={{ marginTop: 12 }} className="wm-ee-card">
          <div style={{ fontWeight: 1000 }}>This application is not available.</div>

          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <button className="wm-outlineBtn" type="button" onClick={() => window.history.back()}>
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="wm-pageHead">
        <div>
          <div className="wm-pageTitle">Candidate Detail</div>
          <div className="wm-pageSub">
            {post ? `${post.jobName} - ${post.companyName}` : "Shift Job"}
          </div>
        </div>
      </div>

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
        workerWmId={workerWmId}
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
