// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeCareerWorkspacePage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\pages\EmployeeCareerWorkspacePage.tsx

import { NoticeModal } from "../../../../shared/components/NoticeModal";
import { CareerEmptyState } from "../../../career/components/CareerEmptyState";
import { CareerWorkspaceEmploymentSection } from "../components/CareerWorkspaceEmploymentSection";
import { CareerWorkspacePageHero } from "../components/CareerWorkspacePageHero";
import { CareerWorkspacePageSections } from "../components/CareerWorkspacePageSections";
import { CareerWorkspaceRatingSection } from "../components/CareerWorkspaceRatingSection";
import { useEmployeeCareerWorkspacePage } from "../hooks/useEmployeeCareerWorkspacePage";

export function EmployeeCareerWorkspacePage() {
  const page = useEmployeeCareerWorkspacePage();

  if (!page.workspace) {
    return (
      <div className="wm-ee-vCareer wm-stackGrid">
        <CareerEmptyState
          title="This workspace is not available"
          subtitle="It may have been removed or not yet created."
          ctaLabel="Career Home"
          onCta={page.goCareerHome}
        />
      </div>
    );
  }

  return (
    <div className="wm-ee-vCareer wm-stackGrid" style={{ paddingBottom: 28 }}>
      <CareerWorkspacePageHero workspace={page.workspace} />

      <CareerWorkspacePageSections
        workspace={page.workspace}
        employmentRecord={page.employmentRecord}
        completedFeedback={page.completedFeedback}
        onOpenEmploymentDetail={page.openEmploymentDetail}
      />

      <CareerWorkspaceEmploymentSection
        careerPostId={page.workspace.jobId}
        companyName={page.workspace.companyName}
        onNotice={page.setNotice}
      />

      <CareerWorkspaceRatingSection
        workspace={page.workspace}
        workerMlId={page.workerMlId}
        employerMlId={page.employerMlId}
        canRate={page.canRate}
        hasRated={page.hasRated}
        ratingOpen={page.ratingOpen}
        onOpenRating={() => page.setRatingOpen(true)}
        onCloseRating={() => page.setRatingOpen(false)}
        onRatingSubmitted={page.handleRatingSubmitted}
      />

      <NoticeModal notice={page.notice} onClose={() => page.setNotice(null)} />
    </div>
  );
}
