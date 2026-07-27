// App: Job Mitra / WorkMitra_Enterprise_v2
// File: CareerWorkspaceRatingSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\CareerWorkspaceRatingSection.tsx

import { WorkerRateEmployerModal } from "../../../../shared/components/rating/WorkerRateEmployerModal";
import { RatingDisplayCard } from "../../../../shared/rating/components/RatingDisplayCard";
import type { CareerWorkspace } from "../../../career/types/careerDomainTypes";
import { isRatableStatus } from "../helpers/careerWorkspaceDisplayHelpers";

const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_TEXT = "var(--wm-career-text, #111827)";
const CAREER_MUTED = "var(--wm-career-muted, #6b7280)";

type CareerWorkspaceRatingSectionProps = {
  workspace: CareerWorkspace;
  workerMlId: string;
  employerMlId: string;
  canRate: boolean;
  hasRated: boolean;
  ratingOpen: boolean;
  onOpenRating: () => void;
  onCloseRating: () => void;
  onRatingSubmitted: () => void;
};

export function CareerWorkspaceRatingSection({
  workspace,
  workerMlId,
  employerMlId,
  canRate,
  hasRated,
  ratingOpen,
  onOpenRating,
  onCloseRating,
  onRatingSubmitted,
}: CareerWorkspaceRatingSectionProps) {
  return (
    <>
      {canRate && !hasRated && (
        <div className="wm-ee-card" style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 900, fontSize: 14, color: CAREER_TEXT }}>Rate employer</div>
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: CAREER_MUTED,
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            Share your experience. Your rating helps other workers choose good employers.
          </div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <button
              className="wm-primarybtn"
              type="button"
              onClick={onOpenRating}
              style={{ background: CAREER_BLUE }}
            >
              Rate Employer
            </button>
          </div>
        </div>
      )}

      {hasRated && isRatableStatus(workspace.status) && (
        <RatingDisplayCard
          jobId={workspace.jobId}
          jobTitle={workspace.jobTitle}
          raterMlId={workerMlId}
          targetMlId={employerMlId}
          targetName={workspace.companyName}
          ratingType="worker"
          domain="career"
        />
      )}

      <WorkerRateEmployerModal
        isOpen={ratingOpen}
        jobId={workspace.jobId}
        jobTitle={workspace.jobTitle}
        workerMlId={workerMlId}
        employerMlId={employerMlId}
        companyName={workspace.companyName}
        domain="career"
        onSubmitted={onRatingSubmitted}
        onClose={onCloseRating}
      />
    </>
  );
}
