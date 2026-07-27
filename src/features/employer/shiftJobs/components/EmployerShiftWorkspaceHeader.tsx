// App name: Job Mitra | EmployerShiftWorkspaceHeader.tsx — DomainHero (Wave 2)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { fmtDateRange, statusLabel } from "../types/shiftWorkspaceTypes";
import type { ShiftWorkspace } from "../types/shiftWorkspaceTypes";

type EmployerShiftWorkspaceHeaderProps = {
  workspace: ShiftWorkspace;
};

export function EmployerShiftWorkspaceHeader({ workspace }: EmployerShiftWorkspaceHeaderProps) {
  const title = `${workspace.companyName} - ${workspace.jobName}`;
  const range = fmtDateRange(workspace.startAt, workspace.endAt);

  return (
    <DomainHero
      variant="shift"
      audience="employer"
      icon={<WorkspaceHeroIcon />}
      title={title}
      subtitle={`${workspace.locationName} · ${range}`}
      description="Confirmed work group — updates, workers, and attendance intent live here."
      trailing={<span className="wm-domainHeroBadge">{statusLabel(workspace.status)}</span>}
    >
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--wm-kpi-grid-gap)" }}
      >
        <InfoBox label="Workspace ID" value={workspace.id.slice(-6).toUpperCase()} />
        <InfoBox
          label="Last activity"
          value={new Date(workspace.lastActivityAt).toLocaleDateString()}
        />
      </div>
    </DomainHero>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="wm-shift-surface-glass wm-shift-surface-glass--inset" style={{ minWidth: 0 }}>
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

function WorkspaceHeroIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z"
      />
    </svg>
  );
}
