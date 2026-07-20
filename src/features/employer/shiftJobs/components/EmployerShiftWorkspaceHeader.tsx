// App name: Job Mitra
// File name: EmployerShiftWorkspaceHeader.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerShiftWorkspaceHeader.tsx

import { fmtDateRange, statusLabel } from "../types/shiftWorkspaceTypes";
import type { ShiftWorkspace } from "../types/shiftWorkspaceTypes";

type EmployerShiftWorkspaceHeaderProps = {
  workspace: ShiftWorkspace;
};

export function EmployerShiftWorkspaceHeader({ workspace }: EmployerShiftWorkspaceHeaderProps) {
  const title = `${workspace.companyName} - ${workspace.jobName}`;
  const range = fmtDateRange(workspace.startAt, workspace.endAt);

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
            {title}
          </div>

          <div
            style={{ marginTop: 5, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.45 }}
          >
            {workspace.locationName} · {range}
          </div>
        </div>

        <span
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            background: "rgba(22,163,74,0.08)",
            border: "1px solid rgba(22,163,74,0.16)",
            color: "var(--wm-er-accent-shift, #16a34a)",
            fontSize: 11,
            fontWeight: 950,
            whiteSpace: "nowrap",
          }}
        >
          {statusLabel(workspace.status)}
        </span>
      </div>

      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <InfoBox label="Workspace ID" value={workspace.id.slice(-6).toUpperCase()} />
        <InfoBox
          label="Last activity"
          value={new Date(workspace.lastActivityAt).toLocaleDateString()}
        />
      </div>
    </section>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "9px 10px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.72)",
        border: "1px solid rgba(226,232,240,0.9)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 900,
          color: "var(--wm-er-muted)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 3, fontSize: 12, fontWeight: 900, color: "var(--wm-er-text)" }}>
        {value}
      </div>
    </div>
  );
}
