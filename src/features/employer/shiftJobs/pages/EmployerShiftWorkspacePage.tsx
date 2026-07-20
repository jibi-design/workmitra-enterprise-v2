// App name: Job Mitra
// File name: EmployerShiftWorkspacePage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\pages\EmployerShiftWorkspacePage.tsx

import { ConfirmModal } from "../../../../shared/components/ConfirmModal";
import { EmployerRateWorkerModal } from "../../../../shared/components/rating/EmployerRateWorkerModal";
import { BroadcastModal, ReplyModal } from "../components/ShiftWorkspaceComponents";
import { EmployerShiftWorkspaceControls } from "../components/EmployerShiftWorkspaceControls";
import { EmployerShiftWorkspaceHeader } from "../components/EmployerShiftWorkspaceHeader";
import { EmployerShiftWorkspaceUpdates } from "../components/EmployerShiftWorkspaceUpdates";
import { useEmployerShiftWorkspaceState } from "../hooks/useEmployerShiftWorkspaceState";

export function EmployerShiftWorkspacePage() {
  const state = useEmployerShiftWorkspaceState();

  if (!state.workspace) {
    return (
      <div>
        <div className="wm-pageHead">
          <div>
            <div className="wm-pageTitle">Workspace</div>
            <div className="wm-pageSub">Not found.</div>
          </div>
        </div>

        <div style={{ marginTop: 12 }} className="wm-er-card">
          <div style={{ fontWeight: 700, color: "var(--wm-er-text)" }}>
            This workspace is not available.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ConfirmModal
        confirm={state.confirmData}
        onConfirm={state.handleConfirmModalConfirm}
        onCancel={state.closeConfirm}
      />

      <EmployerShiftWorkspaceHeader workspace={state.workspace} />

      {state.actionError && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: 10,
            background: "rgba(220,38,38,0.06)",
            border: "1px solid rgba(220,38,38,0.2)",
            fontSize: 12,
            fontWeight: 600,
            color: "#b91c1c",
          }}
        >
          {state.actionError}
        </div>
      )}

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

      <div style={{ height: 32 }} />

      {state.broadcastOpen && (
        <BroadcastModal
          draft={state.broadcastDraft}
          onDraftChange={state.setBroadcastDraft}
          onSend={state.pushBroadcast}
          onClose={() => state.setBroadcastOpen(false)}
        />
      )}

      {state.replyOpen && (
        <ReplyModal
          draft={state.replyDraft}
          onDraftChange={state.setReplyDraft}
          onSend={state.sendDirectReply}
          onClose={() => state.setReplyOpen(false)}
          readOnly={state.readOnly}
        />
      )}

      {state.ratingOpen && state.workerWmId && (
        <EmployerRateWorkerModal
          isOpen={state.ratingOpen}
          jobId={state.workspace.postId}
          jobTitle={state.workspace.jobName}
          employerWmId={state.employerWmId}
          workerWmId={state.workerWmId}
          workerName={state.workerName}
          domain="shift"
          onSubmitted={state.handleRatingSubmitted}
          onClose={() => state.setRatingOpen(false)}
        />
      )}
    </div>
  );
}
