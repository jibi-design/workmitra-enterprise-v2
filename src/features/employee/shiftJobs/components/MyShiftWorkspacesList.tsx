// App name: Job Mitra
// File name: MyShiftWorkspacesList.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\MyShiftWorkspacesList.tsx

import type { ShiftWorkspace } from "../../shiftJobs/storage/shiftWorkspaces.storage";
import {
  formatWorkspaceDateRange,
  getWorkspaceCategoryLabel,
  getWorkspaceEmptyBody,
  getWorkspaceEmptyTitle,
  getWorkspaceStatusLabel,
} from "../helpers/myShiftWorkspaces.helpers";
import type { MyShiftWorkspaceTab } from "../types/myShiftWorkspaces.types";

type WorkspacesDomain = "shift" | "planner";

const SHIFT_ACCENT = "var(--wm-er-accent-shift, #16a34a)";
const PLANNER_ACCENT = "var(--wm-planner-accent, #0891b2)";

type MyShiftWorkspacesListProps = {
  tab: MyShiftWorkspaceTab;
  workspaces: ShiftWorkspace[];
  onOpenWorkspace: (workspaceId: string) => void;
  domain?: WorkspacesDomain;
};

export function MyShiftWorkspacesList({
  tab,
  workspaces,
  onOpenWorkspace,
  domain = "shift",
}: MyShiftWorkspacesListProps) {
  return (
    <div style={{ marginTop: 12, display: "grid", gap: 12, minHeight: 240 }}>
      {workspaces.length === 0 && <WorkspaceEmptyState tab={tab} domain={domain} />}

      {workspaces.map((workspace) => (
        <WorkspaceCard
          key={workspace.id}
          workspace={workspace}
          onOpenWorkspace={onOpenWorkspace}
          domain={domain}
        />
      ))}
    </div>
  );
}

function WorkspaceEmptyState({
  tab,
  domain,
}: {
  tab: MyShiftWorkspaceTab;
  domain: WorkspacesDomain;
}) {
  const isPlanner = domain === "planner";
  return (
    <section
      className="wm-ee-card"
      style={{
        padding: "24px 18px",
        borderRadius: 22,
        textAlign: "center",
        background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
        boxShadow: "0 10px 24px rgba(15,23,42,0.045)",
      }}
    >
      <div style={{ fontWeight: 950, fontSize: 15, color: "var(--wm-er-text)" }}>
        {isPlanner ? getPlannerWorkspaceEmptyTitle(tab) : getWorkspaceEmptyTitle(tab)}
      </div>

      <div style={{ marginTop: 7, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
        {isPlanner ? getPlannerWorkspaceEmptyBody(tab) : getWorkspaceEmptyBody(tab)}
      </div>
    </section>
  );
}

function getPlannerWorkspaceEmptyTitle(tab: MyShiftWorkspaceTab): string {
  if (tab === "active") return "No active project workspaces";
  if (tab === "upcoming") return "No upcoming project workspaces";
  if (tab === "completed") return "No completed project workspaces";
  if (tab === "closed") return "No closed project workspaces";
  return "No project workspaces";
}

function getPlannerWorkspaceEmptyBody(tab: MyShiftWorkspaceTab): string {
  if (tab === "active") return "Confirmed Gig project days appear here with crew updates.";
  if (tab === "upcoming") return "Upcoming confirmed project days appear here before work starts.";
  if (tab === "completed") return "Completed project workspaces appear here after work finishes.";
  if (tab === "closed") return "Closed or replaced project workspaces appear here.";
  return "Apply to a multi-day project plan to create workspaces here.";
}

function WorkspaceCard({
  workspace,
  onOpenWorkspace,
  domain,
}: {
  workspace: ShiftWorkspace;
  onOpenWorkspace: (workspaceId: string) => void;
  domain: WorkspacesDomain;
}) {
  const isPlanner = domain === "planner";
  const accent = isPlanner ? PLANNER_ACCENT : SHIFT_ACCENT;
  const accentSoftBg = isPlanner ? "rgba(8,145,178,0.08)" : "rgba(22,163,74,0.08)";
  const accentSoftBorder = isPlanner ? "rgba(8,145,178,0.16)" : "rgba(22,163,74,0.16)";

  const title = `${workspace.companyName} - ${workspace.jobName}`;
  const range = formatWorkspaceDateRange(workspace.startAt, workspace.endAt);
  const status = getWorkspaceStatusLabel(workspace.status);
  const unreadText = workspace.unreadCount > 0 ? `${workspace.unreadCount} unread` : "Up to date";

  return (
    <button
      type="button"
      onClick={() => onOpenWorkspace(workspace.id)}
      aria-label={`Open work group ${workspace.jobName} at ${workspace.companyName}`}
      style={{
        width: "100%",
        textAlign: "left",
        padding: 14,
        borderRadius: 20,
        border: "1px solid rgba(226,232,240,0.95)",
        borderLeft: `4px solid ${accent}`,
        background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
        boxShadow: "0 10px 24px rgba(15,23,42,0.045)",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 950,
              color: "var(--wm-er-text)",
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </div>

          <div
            style={{ marginTop: 4, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.45 }}
          >
            {workspace.locationName} · {range}
          </div>
        </div>

        <span
          style={{
            padding: "5px 9px",
            borderRadius: 999,
            background: accentSoftBg,
            border: `1px solid ${accentSoftBorder}`,
            color: accent,
            fontSize: 10,
            fontWeight: 950,
            whiteSpace: "nowrap",
          }}
        >
          {status}
        </span>
      </div>

      <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <MiniInfo
          label="Category"
          value={getWorkspaceCategoryLabel(workspace.category)}
          accent={accent}
        />
        <MiniInfo
          label="Updates"
          value={unreadText}
          highlight={workspace.unreadCount > 0}
          accent={accent}
        />
      </div>

      <div style={{ marginTop: 11, display: "flex", justifyContent: "flex-end" }}>
        <span style={{ fontSize: 12, fontWeight: 950, color: accent }}>
          {isPlanner ? "Open Workspace" : "Open Group"}
        </span>
      </div>
    </button>
  );
}

function MiniInfo({
  label,
  value,
  highlight = false,
  accent = SHIFT_ACCENT,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  accent?: string;
}) {
  return (
    <div
      style={{
        padding: "8px 8px",
        borderRadius: 12,
        background: "rgba(248,250,252,0.96)",
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
          letterSpacing: 0.35,
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 3,
          fontSize: 11,
          fontWeight: 900,
          color: highlight ? accent : "var(--wm-er-text)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  );
}
