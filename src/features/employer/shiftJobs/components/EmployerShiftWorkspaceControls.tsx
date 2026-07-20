// App name: Job Mitra
// File name: EmployerShiftWorkspaceControls.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerShiftWorkspaceControls.tsx

import type { CSSProperties } from "react";
import { statusLabel } from "../types/shiftWorkspaceTypes";
import type { ShiftWorkspace } from "../types/shiftWorkspaceTypes";
import { RatingBanner } from "./ShiftWorkspaceComponents";

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
  return (
    <section
      style={{
        marginTop: 12,
        padding: "15px 16px",
        borderRadius: 20,
        border: "1px solid rgba(226,232,240,0.95)",
        background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
        boxShadow: "0 10px 24px rgba(15,23,42,0.045)",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 950, color: "var(--wm-er-text)" }}>
        Employer Controls
      </div>

      <div style={{ marginTop: 5, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
        Broadcast adds a group update. Reply adds a direct worker update. Updates are stored locally
        in this workspace.
      </div>

      {workspace.status === "left" && (
        <WorkerLeftNotice workspace={workspace} onOpenPost={onOpenPost} />
      )}

      {readOnly && (
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.45 }}>
          Read-only: this workspace is {statusLabel(workspace.status)}.
        </div>
      )}

      {isCompleted && <RatingBanner workspace={workspace} hasRating={hasRating} onRate={onRate} />}

      <div style={{ marginTop: 13, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
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
      style={{
        marginTop: 10,
        padding: "10px 14px",
        borderRadius: 14,
        background: "rgba(220,38,38,0.06)",
        border: "1px solid rgba(220,38,38,0.18)",
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
