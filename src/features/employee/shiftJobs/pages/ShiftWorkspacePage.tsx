// App name: Job Mitra | ShiftWorkspacePage.tsx — Wave C stack + DomainHero

import { NoticeModal } from "../../../../shared/components/NoticeModal";
import { WorkerRateEmployerModal } from "../../../../shared/components/rating/WorkerRateEmployerModal";
import { ShiftWorkspaceExitSection } from "../components/ShiftWorkspaceExitSection";
import { ShiftWorkspaceHero } from "../components/ShiftWorkspaceHero";
import { ShiftWorkspaceNotFound } from "../components/ShiftWorkspaceNotFound";
import { ShiftWorkspaceRatingSection } from "../components/ShiftWorkspaceRatingSection";
import { ShiftWorkspaceStatusSection } from "../components/ShiftWorkspaceStatusSection";
import { ShiftWorkspaceUpdateFeed } from "../components/ShiftWorkspaceUpdateFeed";
import { useShiftWorkspacePage } from "../hooks/useShiftWorkspacePage";

export function ShiftWorkspacePage() {
  const page = useShiftWorkspacePage();

  if (!page.workspace || !page.derived) {
    return <ShiftWorkspaceNotFound />;
  }

  const { workspace, derived } = page;
  const isPlanner = derived.isPlannerDomain;

  return (
    <div
      className={
        isPlanner ? "wm-ee-vPlanner wm-planner-page wm-stackGrid" : "wm-ee-vShift wm-stackGrid"
      }
      data-testid="shift-workspace-page"
      style={{ gap: "var(--wm-stack-gap)" }}
    >
      {derived.planEntry ? (
        <div
          className="wm-planner-badge"
          style={{
            display: "inline-flex",
            background: "rgba(8,145,178,0.12)",
            border: "1px solid var(--wm-planner-border)",
          }}
        >
          Project: {derived.planEntry.planName}
          {derived.plannerPost?.planSlotDate ? ` · ${derived.plannerPost.planSlotDate}` : ""}
        </div>
      ) : null}

      <ShiftWorkspaceHero
        workspace={workspace}
        title={derived.title}
        safeMapsLink={derived.safeMapsLink}
        isPlannerDomain={isPlanner}
      />

      <ShiftWorkspaceStatusSection workspace={workspace} readOnly={derived.readOnly} />

      <ShiftWorkspaceUpdateFeed
        workspace={workspace}
        readOnly={derived.readOnly}
        onReplySuccess={page.handleReplySuccess}
        onReplyError={page.handleReplyError}
      />

      <ShiftWorkspaceRatingSection
        canRate={derived.canRate}
        hasRated={derived.hasRated}
        isCompleted={workspace.status === "completed"}
        onOpenRating={() => page.setRatingOpen(true)}
      />

      <ShiftWorkspaceExitSection
        workspace={workspace}
        readOnly={derived.readOnly}
        onExited={page.handleExited}
      />

      <WorkerRateEmployerModal
        isOpen={page.ratingOpen}
        jobId={workspace.postId}
        jobTitle={workspace.jobName}
        workerMlId={derived.workerMlId}
        employerMlId={derived.employerMlId}
        companyName={workspace.companyName}
        domain="shift"
        workspaceId={workspace.id}
        appId={workspace.appId}
        onSubmitted={page.handleRatingSubmitted}
        onClose={() => page.setRatingOpen(false)}
      />

      <NoticeModal notice={page.notice} onClose={() => page.setNotice(null)} />
    </div>
  );
}
