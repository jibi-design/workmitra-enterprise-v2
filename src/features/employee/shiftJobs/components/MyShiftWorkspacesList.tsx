// App name: Job Mitra | MyShiftWorkspacesList.tsx — glass + pressable cards (Step 3)

import { EnterpriseEmpty } from "../../../../shared/components/enterprise";
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
    <div
      className="wm-shiftWorkspacesList"
      style={{ display: "grid", gap: 12, minHeight: 240 }}
      data-testid="shift-workspaces-list"
    >
      {workspaces.length === 0 ? <WorkspaceEmptyState tab={tab} domain={domain} /> : null}

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
    <EnterpriseEmpty
      domain={isPlanner ? "planner" : "shift"}
      title={isPlanner ? getPlannerWorkspaceEmptyTitle(tab) : getWorkspaceEmptyTitle(tab)}
      subtitle={isPlanner ? getPlannerWorkspaceEmptyBody(tab) : getWorkspaceEmptyBody(tab)}
      testId="shift-workspaces-empty"
    />
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
  const title = `${workspace.companyName} - ${workspace.jobName}`;
  const range = formatWorkspaceDateRange(workspace.startAt, workspace.endAt);
  const status = getWorkspaceStatusLabel(workspace.status);
  const unreadText = workspace.unreadCount > 0 ? `${workspace.unreadCount} unread` : "Up to date";

  return (
    <button
      type="button"
      className={
        isPlanner
          ? "wm-shift-surface-glass wm-press-card wm-shiftWorkspaceCard"
          : "wm-shift-card wm-shift-pressable wm-shiftWorkspaceCard"
      }
      onClick={() => onOpenWorkspace(workspace.id)}
      aria-label={`Open work group ${workspace.jobName} at ${workspace.companyName}`}
      data-testid={`shift-workspace-card-${workspace.id}`}
      style={{
        width: "100%",
        textAlign: "left",
        padding: 14,
        borderLeft: isPlanner
          ? "4px solid var(--wm-planner-accent, #0891b2)"
          : "4px solid var(--wm-shift-accent, #16a34a)",
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
        <span className="wm-shift-pill wm-shift-pill--outline" style={{ fontSize: 10 }}>
          {status}
        </span>
      </div>

      <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <MiniInfo label="Category" value={getWorkspaceCategoryLabel(workspace.category)} />
        <MiniInfo label="Updates" value={unreadText} highlight={workspace.unreadCount > 0} />
      </div>

      <div style={{ marginTop: 11, display: "flex", justifyContent: "flex-end" }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 950,
            color: isPlanner
              ? "var(--wm-planner-accent, #0891b2)"
              : "var(--wm-shift-accent, #16a34a)",
          }}
        >
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
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="wm-shift-surface-glass" style={{ padding: "8px", minWidth: 0 }}>
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
          color: highlight ? "var(--wm-shift-accent, #16a34a)" : "var(--wm-er-text)",
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
