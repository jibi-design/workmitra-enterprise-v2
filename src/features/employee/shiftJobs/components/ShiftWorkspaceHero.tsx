// App name: Job Mitra | ShiftWorkspaceHero.tsx — DomainHero (Wave C)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { EmployerTrustBadge } from "../../../../shared/employerProfile/EmployerTrustBadge";
import {
  badgeStyle,
  fmtDateRange,
  statusBadgeLabel,
  statusTone,
} from "../helpers/shiftWorkspaceDisplayHelpers";
import type { ShiftWorkspace } from "../types/shiftWorkspace.types";

export function ShiftWorkspaceHero({
  workspace,
  title,
  safeMapsLink,
  isPlannerDomain = false,
}: {
  workspace: ShiftWorkspace;
  title: string;
  safeMapsLink?: string;
  isPlannerDomain?: boolean;
}) {
  const topTone = statusTone(workspace.status);

  return (
    <DomainHero
      variant={isPlannerDomain ? "planner" : "shift"}
      audience="employee"
      icon={<WorkspaceHeroIcon />}
      title={title}
      subtitle={`${workspace.locationName} · ${fmtDateRange(workspace.startAt, workspace.endAt)}`}
      description={
        isPlannerDomain
          ? "Confirmed project day workspace — updates and crew notes stay here."
          : "Confirmed shift work group — updates, location, and status live here."
      }
      trailing={
        <span
          className="wm-domainHeroBadge"
          style={{ ...badgeStyle(topTone), height: 28, fontSize: 11 }}
        >
          {statusBadgeLabel(workspace.status)}
        </span>
      }
    >
      {(workspace.locationAddress || safeMapsLink) && (
        <div
          className={
            isPlannerDomain
              ? "wm-shift-surface-glass"
              : "wm-shift-surface-glass wm-shift-surface-glass--shift"
          }
          style={{ padding: "10px 11px", marginTop: 4 }}
        >
          {workspace.locationAddress ? (
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "var(--wm-er-muted)",
                lineHeight: 1.45,
              }}
            >
              {workspace.locationAddress}
            </div>
          ) : null}

          {safeMapsLink ? (
            <a
              href={safeMapsLink}
              target="_blank"
              rel="noreferrer"
              className={
                isPlannerDomain
                  ? "wm-planner-btnGhost wm-shift-pressable"
                  : "wm-outlineBtn wm-shift-pressable"
              }
              style={{
                marginTop: workspace.locationAddress ? 8 : 0,
                display: "inline-flex",
                minHeight: 44,
                padding: "0 12px",
                fontSize: 12,
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              Open location in Maps
            </a>
          ) : null}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <EmployerTrustBadge variant="full" />
      </div>
    </DomainHero>
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
