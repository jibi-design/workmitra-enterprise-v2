// App name: Job Mitra
// File name: EmployerShiftWorkspacesList.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerShiftWorkspacesList.tsx

import {
  formatWorkspaceDateRange,
  formatWorkspaceLastActivity,
  getWorkspaceStatusLabel,
} from "../helpers/employerShiftWorkspaces.helpers";
import type {
  EmployerWorkspaceLite,
  EmployerWorkspaceMode,
} from "../types/employerShiftWorkspaces.types";

type EmployerShiftWorkspacesListProps = {
  mode: EmployerWorkspaceMode;
  allCount: number;
  workspaces: EmployerWorkspaceLite[];
  onOpenWorkspace: (workspaceId: string) => void;
  onOpenPost: (postId: string) => void;
};

export function EmployerShiftWorkspacesList({
  mode,
  allCount,
  workspaces,
  onOpenWorkspace,
  onOpenPost,
}: EmployerShiftWorkspacesListProps) {
  return (
    <section style={{ marginTop: 12, display: "grid", gap: 12, minHeight: 240 }}>
      {workspaces.length === 0 && <EmptyState mode={mode} allCount={allCount} />}

      {workspaces.map((workspace) => (
        <WorkspaceCard
          key={workspace.id}
          mode={mode}
          workspace={workspace}
          onOpenWorkspace={onOpenWorkspace}
          onOpenPost={onOpenPost}
        />
      ))}
    </section>
  );
}

function EmptyState({ mode, allCount }: { mode: EmployerWorkspaceMode; allCount: number }) {
  const isGroups = mode === "groups";

  return (
    <div
      className="wm-er-card"
      style={{
        textAlign: "center",
        padding: "24px 18px",
        borderRadius: 22,
      }}
    >
      <div style={{ fontWeight: 950, fontSize: 15, color: "var(--wm-er-text)" }}>
        {allCount === 0 ? "No work groups yet" : "No groups match your search"}
      </div>

      <div style={{ marginTop: 7, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
        {allCount === 0
          ? isGroups
            ? "Groups are created when you confirm workers for a shift."
            : "Broadcasts can be sent after a group is created."
          : "Try changing your search or filter."}
      </div>
    </div>
  );
}

function WorkspaceCard({
  mode,
  workspace,
  onOpenWorkspace,
  onOpenPost,
}: {
  mode: EmployerWorkspaceMode;
  workspace: EmployerWorkspaceLite;
  onOpenWorkspace: (workspaceId: string) => void;
  onOpenPost: (postId: string) => void;
}) {
  const title = `${workspace.companyName} - ${workspace.jobName}`;
  const statusLabel = getWorkspaceStatusLabel(workspace.status);
  const needsAttention = workspace.status === "left" || workspace.status === "replaced";
  const isGroups = mode === "groups";

  return (
    <article
      style={{
        padding: 14,
        borderRadius: 20,
        border: "1px solid rgba(226,232,240,0.95)",
        borderLeft: needsAttention
          ? "4px solid #dc2626"
          : "4px solid var(--wm-er-accent-shift, #16a34a)",
        background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
        boxShadow: "0 10px 24px rgba(15,23,42,0.045)",
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
            {workspace.locationName} -{" "}
            {formatWorkspaceDateRange(workspace.startAt, workspace.endAt)}
          </div>
        </div>

        <span
          style={{
            padding: "5px 9px",
            borderRadius: 999,
            background: needsAttention ? "rgba(220,38,38,0.08)" : "rgba(22,163,74,0.08)",
            border: needsAttention
              ? "1px solid rgba(220,38,38,0.16)"
              : "1px solid rgba(22,163,74,0.16)",
            color: needsAttention ? "#dc2626" : "var(--wm-er-accent-shift, #16a34a)",
            fontSize: 10,
            fontWeight: 950,
            whiteSpace: "nowrap",
          }}
        >
          {statusLabel}
        </span>
      </div>

      <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <MiniInfo
          label="Last activity"
          value={formatWorkspaceLastActivity(workspace.lastActivityAt)}
        />
        <MiniInfo label="Status" value={statusLabel} highlight={!needsAttention} />
      </div>

      {needsAttention && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 10px",
            borderRadius: 12,
            background: "rgba(220,38,38,0.06)",
            border: "1px solid rgba(220,38,38,0.16)",
            fontSize: 11,
            fontWeight: 800,
            color: "#dc2626",
            lineHeight: 1.45,
          }}
        >
          Needs attention. Review the worker status and fill the vacancy if needed.
        </div>
      )}

      <div
        style={{
          marginTop: 12,
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {isGroups && (
          <button
            className="wm-outlineBtn"
            type="button"
            onClick={() => onOpenPost(workspace.postId)}
            style={{ fontSize: 12 }}
          >
            View Post
          </button>
        )}

        <button
          className="wm-primarybtn"
          type="button"
          onClick={() => onOpenWorkspace(workspace.id)}
          style={{ fontSize: 12 }}
        >
          {isGroups
            ? "Open Group"
            : workspace.status === "active"
              ? "Open Broadcasts"
              : "View Messages"}
        </button>
      </div>
    </article>
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
          color: highlight ? "var(--wm-er-accent-shift, #16a34a)" : "var(--wm-er-text)",
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
