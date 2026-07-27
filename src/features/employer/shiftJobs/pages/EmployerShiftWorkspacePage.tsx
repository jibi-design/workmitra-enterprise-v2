// App name: Job Mitra | EmployerShiftWorkspacePage.tsx — stackGrid (Wave 3)

import { ConfirmModal } from "../../../../shared/components/ConfirmModal";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { EnterpriseEmpty } from "../../../../shared/components/enterprise";
import { EmployerRateWorkerModal } from "../../../../shared/components/rating/EmployerRateWorkerModal";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { useNavigate } from "react-router-dom";
import { BroadcastModal, ReplyModal } from "../components/ShiftWorkspaceComponents";
import { EmployerShiftWorkspaceControls } from "../components/EmployerShiftWorkspaceControls";
import { EmployerShiftWorkspaceHeader } from "../components/EmployerShiftWorkspaceHeader";
import { EmployerShiftWorkspaceUpdates } from "../components/EmployerShiftWorkspaceUpdates";
import { useEmployerShiftWorkspaceState } from "../hooks/useEmployerShiftWorkspaceState";

export function EmployerShiftWorkspacePage() {
  const state = useEmployerShiftWorkspaceState();
  const nav = useNavigate();

  if (!state.workspace) {
    return (
      <div
        className="wm-er-vShift wm-stackGrid"
        data-testid="employer-shift-workspace-missing"
        style={{ gap: "var(--wm-stack-gap)" }}
      >
        <DomainHero
          variant="shift"
          audience="employer"
          title="Workspace"
          subtitle="Not found"
          description="This work group may have been closed or the link is outdated."
        />
        <EnterpriseEmpty
          domain="shift"
          title="This workspace is not available"
          subtitle="Open your workspaces list to continue managing confirmed shifts."
          primaryLabel="My Workspaces"
          onPrimary={() => nav(ROUTE_PATHS.employerShiftWorkspaces)}
          testId="employer-shift-workspace-empty"
        />
      </div>
    );
  }

  return (
    <div
      className="wm-er-vShift wm-stackGrid"
      data-testid="employer-shift-workspace-page"
      style={{ gap: "var(--wm-stack-gap)", paddingBottom: 32 }}
    >
      <ConfirmModal
        confirm={state.confirmData}
        onConfirm={state.handleConfirmModalConfirm}
        onCancel={state.closeConfirm}
      />

      <EmployerShiftWorkspaceHeader workspace={state.workspace} />

      {state.actionError ? (
        <div
          className="wm-shift-surface-glass wm-shift-surface-glass--inset"
          role="alert"
          style={{
            border: "1px solid rgba(220,38,38,0.2)",
            background: "rgba(220,38,38,0.06)",
            fontSize: 12,
            fontWeight: 600,
            color: "#b91c1c",
          }}
        >
          {state.actionError}
        </div>
      ) : null}

      <EmployerShiftWorkspaceControls
        workspace={state.workspace}
        readOnly={state.readOnly}
        isCompleted={state.isCompleted}
        hasRating={state.hasRating}
        onOpenPost={state.openPost}
        onBroadcast={state.openBroadcastModal}
        onReply={state.openReplyModal}
        onMarkCompleted={state.markCompleted}
        onRate={() => state.setRatingOpen(true)}
      />

      <EmployerShiftWorkspaceUpdates workspace={state.workspace} />

      {state.broadcastOpen ? (
        <BroadcastModal
          draft={state.broadcastDraft}
          onDraftChange={state.setBroadcastDraft}
          onSend={state.pushBroadcast}
          onClose={() => state.setBroadcastOpen(false)}
        />
      ) : null}

      {state.replyOpen ? (
        <ReplyModal
          draft={state.replyDraft}
          onDraftChange={state.setReplyDraft}
          onSend={state.sendDirectReply}
          onClose={() => state.setReplyOpen(false)}
          readOnly={state.readOnly}
        />
      ) : null}

      {state.ratingOpen && state.workerMlId ? (
        <EmployerRateWorkerModal
          isOpen={state.ratingOpen}
          jobId={state.workspace.postId}
          jobTitle={state.workspace.jobName}
          employerMlId={state.employerMlId}
          workerMlId={state.workerMlId}
          workerName={state.workerName}
          domain="shift"
          onSubmitted={state.handleRatingSubmitted}
          onClose={() => state.setRatingOpen(false)}
        />
      ) : null}
    </div>
  );
}
