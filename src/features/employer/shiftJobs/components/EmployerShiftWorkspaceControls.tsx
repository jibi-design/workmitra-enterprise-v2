// App name: Job Mitra
// File name: EmployerShiftWorkspaceControls.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerShiftWorkspaceControls.tsx

import type { CSSProperties } from "react";
import { useSyncExternalStore } from "react";
import { GatedCallButton } from "../../../shared/calling";
import { getEmployerBusinessKey } from "../../company/helpers/employerDualId.helpers";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";
import { statusLabel } from "../types/shiftWorkspaceTypes";
import type { ShiftWorkspace } from "../types/shiftWorkspaceTypes";
import { RatingBanner } from "./ShiftWorkspaceComponents";
import { EmployerShiftWorkspaceArchiveControl } from "./EmployerShiftWorkspaceArchiveControl";
import { getEmployerShiftPost } from "../storage/employerShift.postActions.crud";
import {
  getSiteMembershipTruth,
  resolveShiftOpsSiteIdForPost,
  subscribeSiteMembershipTruth,
} from "../../../shared/shiftOps/shiftJobsMembershipBridge";

const SHIFT_PRIMARY_BUTTON_STYLE: CSSProperties = {
  background: "var(--wm-er-accent-shift, #16a34a)",
  color: "#fff",
  border: "none",
  boxShadow: "0 10px 22px rgba(22,163,74,0.16)",
};

type EmployerShiftWorkspaceControlsProps = {
  workspace: ShiftWorkspace;
  readOnly: boolean;
  isCompleted: boolean;
  hasRating: boolean;
  onOpenPost: () => void;
  onBroadcast: () => void;
  onReply: () => void;
  onMarkCompleted: () => void;
  onRate: () => void;
};

export function EmployerShiftWorkspaceControls({
  workspace,
  readOnly,
  isCompleted,
  hasRating,
  onOpenPost,
  onBroadcast,
  onReply,
  onMarkCompleted,
  onRate,
}: EmployerShiftWorkspaceControlsProps) {
  const initiatorMl = getEmployerBusinessKey(employerSettingsStorage.get()) ?? "";
  const receiverMl = workspace.workerMlId?.trim() ?? "";
  const post = getEmployerShiftPost(workspace.postId);
  const groupId = resolveShiftOpsSiteIdForPost(post ?? {});
  // Primitives only — object snapshots from getSiteMembershipTruth() are new refs each
  // readMap()/JSON.parse and would infinite-loop useSyncExternalStore.
  const membershipStatus = useSyncExternalStore(
    subscribeSiteMembershipTruth,
    () => getSiteMembershipTruth(groupId, receiverMl)?.status ?? "",
    () => getSiteMembershipTruth(groupId, receiverMl)?.status ?? "",
  );

  return (
    <section
      className="wm-shift-surface-glass wm-shift-surface-glass--shift"
      data-testid="employer-shift-workspace-controls"
    >
      <div style={{ fontSize: 14, fontWeight: 950, color: "var(--wm-er-text)" }}>
        Employer Controls
      </div>

      <div style={{ marginTop: 5, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
        Broadcast adds a group update. Reply adds a direct worker update. Updates are stored locally
        in this workspace.
      </div>

      {workspace.status === "left" ? (
        <WorkerLeftNotice workspace={workspace} onOpenPost={onOpenPost} />
      ) : null}

      {readOnly ? (
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.45 }}>
          Read-only: this workspace is {statusLabel(workspace.status)}.
        </div>
      ) : null}

      {isCompleted ? (
        <RatingBanner workspace={workspace} hasRating={hasRating} onRate={onRate} />
      ) : null}

      {isCompleted && hasRating ? (
        <EmployerShiftWorkspaceArchiveControl
          postId={workspace.postId}
          workerMlId={receiverMl}
          enabled
        />
      ) : null}

      {!readOnly && receiverMl ? (
        <div style={{ marginTop: 12 }}>
          <GatedCallButton
            groupId={groupId}
            membershipStatus={membershipStatus || null}
            workerMlId={receiverMl}
            initiatorMl={initiatorMl}
            peerLabel={workspace.workerName ?? receiverMl}
            extraDisabled={!initiatorMl}
            shiftEndAt={workspace.endAt}
            workspaceStatus={workspace.status}
          />
        </div>
      ) : null}

      <div
        style={{
          marginTop: 13,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--wm-kpi-grid-gap)",
        }}
      >
        <button className="wm-outlineBtn" type="button" onClick={onOpenPost}>
          Open Post
        </button>

        <button
          className="wm-outlineBtn"
          type="button"
          onClick={onBroadcast}
          disabled={readOnly}
          aria-disabled={readOnly}
        >
          Broadcast
        </button>

        <button
          className="wm-primarybtn"
          type="button"
          onClick={onReply}
          disabled={readOnly}
          aria-disabled={readOnly}
          style={readOnly ? undefined : SHIFT_PRIMARY_BUTTON_STYLE}
        >
          Reply
        </button>

        <button
          className="wm-primarybtn"
          type="button"
          onClick={onMarkCompleted}
          disabled={workspace.status === "completed" || readOnly}
          aria-disabled={workspace.status === "completed" || readOnly}
          style={
            workspace.status === "completed" || readOnly ? undefined : SHIFT_PRIMARY_BUTTON_STYLE
          }
        >
          Mark Completed
        </button>
      </div>
    </section>
  );
}

function WorkerLeftNotice({
  workspace,
  onOpenPost,
}: {
  workspace: ShiftWorkspace;
  onOpenPost: () => void;
}) {
  return (
    <div
      className="wm-shift-surface-glass wm-shift-surface-glass--inset"
      style={{
        marginTop: 10,
        border: "1px solid rgba(220,38,38,0.18)",
        background: "rgba(220,38,38,0.06)",
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 13, color: "#dc2626" }}>
        Worker left this workspace
      </div>

      <div style={{ marginTop: 4, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.45 }}>
        {workspace.exitReason ? `Reason: ${workspace.exitReason}. ` : ""}Check waiting list to fill
        the vacancy.
      </div>

      <button className="wm-dangerBtn" type="button" style={{ marginTop: 10 }} onClick={onOpenPost}>
        Fill Vacancy from Waiting List
      </button>
    </div>
  );
}
