// App name: Job Mitra
// File name: EmployerCareerCandidateDetailPage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\pages\EmployerCareerCandidateDetailPage.tsx

import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { CareerCandidateApplicationDetailsCard } from "../components/candidateReview/CareerCandidateApplicationDetailsCard";
import { CareerCandidateReviewHeader } from "../components/candidateReview/CareerCandidateReviewHeader";
import { CareerCandidateReviewHero } from "../components/candidateReview/CareerCandidateReviewHero";
import { CareerCandidateScreeningAnswersCard } from "../components/candidateReview/CareerCandidateScreeningAnswersCard";
import { CareerCandidateSnapshotCard } from "../components/candidateReview/CareerCandidateSnapshotCard";
import { BodyText, ReviewCard } from "../components/candidateReview/careerCandidateReviewUi";
import { readCareerApps, readCareerPosts } from "../helpers/careerNormalizers";

export function EmployerCareerCandidateDetailPage() {
  const navigate = useNavigate();
  const { postId = "", appId = "" } = useParams();

  const data = useMemo(() => {
    const post = readCareerPosts().find((item) => item.id === postId) ?? null;
    const app = readCareerApps().find((item) => item.id === appId && item.jobId === postId) ?? null;

    return { post, app };
  }, [appId, postId]);

  function goBackToDashboard() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId));
  }

  if (!data.post || !data.app) {
    return (
      <div className="wm-er-vCareer wm-stackGrid">
        <CareerCandidateReviewHeader
          title="Application not found"
          subtitle="Return to the post dashboard and select an application again."
        />

        <ReviewCard title="Application unavailable">
          <BodyText value="This application could not be found in the current local demo data." />
          <button
            className="wm-outlineBtn"
            type="button"
            onClick={goBackToDashboard}
            style={{ fontSize: 12 }}
          >
            Back to Post Dashboard
          </button>
        </ReviewCard>
      </div>
    );
  }

  const { post, app } = data;

  return (
    <div className="wm-er-vCareer wm-stackGrid">
      <CareerCandidateReviewHeader
        title="Application review"
        subtitle="Review the submitted application before shortlist or interview decisions."
      />

      <CareerCandidateReviewHero post={post} app={app} />

      <section className="wm-stackGrid">
        <CareerCandidateSnapshotCard profile={app.profileSnapshot} />
        <CareerCandidateApplicationDetailsCard app={app} />
        <CareerCandidateScreeningAnswersCard post={post} app={app} />

        {app.employerNotes && (
          <ReviewCard title="Employer notes">
            <BodyText value={app.employerNotes} />
          </ReviewCard>
        )}
      </section>
    </div>
  );
}
