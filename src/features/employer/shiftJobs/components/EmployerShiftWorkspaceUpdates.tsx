// App name: Job Mitra
// File name: EmployerShiftWorkspaceUpdates.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerShiftWorkspaceUpdates.tsx

import type { ShiftWorkspace } from "../types/shiftWorkspaceTypes";
import { UpdateCard } from "./ShiftWorkspaceComponents";

type EmployerShiftWorkspaceUpdatesProps = {
  workspace: ShiftWorkspace;
};

export function EmployerShiftWorkspaceUpdates({ workspace }: EmployerShiftWorkspaceUpdatesProps) {
  return (
    <section
      className="wm-shift-surface-glass wm-shift-surface-glass--shift"
      data-testid="employer-shift-workspace-updates"
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 950, color: "var(--wm-er-text)" }}>
            Workspace Updates
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: "var(--wm-er-muted)" }}>
            Broadcasts, replies, and system updates for this shift.
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 900, color: "var(--wm-er-accent-shift)" }}>
          Total: {workspace.updates.length}
        </div>
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        {workspace.updates.length === 0 ? (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "var(--wm-radius-chip)",
              background: "rgba(248,250,252,0.96)",
              border: "1px solid rgba(226,232,240,0.9)",
              fontSize: 12,
              color: "var(--wm-er-muted)",
            }}
          >
            No updates yet.
          </div>
        ) : (
          workspace.updates.map((update) => <UpdateCard key={update.id} u={update} />)
        )}
      </div>
    </section>
  );
}
