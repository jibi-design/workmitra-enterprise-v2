// App name: Job Mitra
// File name: EmployerShiftWorkspacesHeader.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerShiftWorkspacesHeader.tsx

import type { EmployerWorkspaceMode } from "../types/employerShiftWorkspaces.types";

type EmployerShiftWorkspacesHeaderProps = {
  mode: EmployerWorkspaceMode;
  onBack: () => void;
};

export function EmployerShiftWorkspacesHeader({
  mode,
  onBack,
}: EmployerShiftWorkspacesHeaderProps) {
  const isGroups = mode === "groups";

  return (
    <section
      style={{
        marginTop: 2,
        padding: "16px 16px",
        borderRadius: 22,
        border: "1px solid rgba(22,163,74,0.16)",
        background:
          "linear-gradient(135deg, rgba(22,163,74,0.13), rgba(255,255,255,0.98) 48%, rgba(240,253,244,0.86))",
        boxShadow: "0 18px 40px rgba(15,23,42,0.07)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{ fontSize: 18, fontWeight: 950, color: "var(--wm-er-text)", lineHeight: 1.25 }}
          >
            {isGroups ? "My Work Groups" : "Broadcasts"}
          </div>

          <div
            style={{ marginTop: 5, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.45 }}
          >
            {isGroups
              ? "Manage confirmed worker groups."
              : "Send group updates to confirmed shift workers."}
          </div>
        </div>

        <button
          className="wm-outlineBtn"
          type="button"
          onClick={onBack}
          style={{ fontSize: 12, whiteSpace: "nowrap" }}
        >
          Back
        </button>
      </div>

      <div
        style={{
          marginTop: 12,
          padding: "9px 11px",
          borderRadius: 14,
          background: "rgba(255,255,255,0.72)",
          border: "1px solid rgba(226,232,240,0.9)",
          fontSize: 11,
          fontWeight: 750,
          color: "var(--wm-er-muted)",
          lineHeight: 1.45,
        }}
      >
        {isGroups
          ? "A work group is created after you confirm workers for a shift. Use it to manage updates and worker communication."
          : "Broadcasts are local workspace updates for confirmed workers. Open a group to send a broadcast."}
      </div>
    </section>
  );
}
