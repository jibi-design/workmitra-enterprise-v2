// App name: Job Mitra
// File name: EmployerShiftWorkspacesList.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerShiftWorkspacesList.tsx

import { useSyncExternalStore } from "react";
import {
  formatWorkspaceDateRange,
  formatWorkspaceLastActivity,
  getWorkspaceStatusLabel,
} from "../helpers/employerShiftWorkspaces.helpers";
import type {
  EmployerWorkspaceLite,
  EmployerWorkspaceMode,
} from "../types/employerShiftWorkspaces.types";
import { EnterpriseEmpty } from "../../../../shared/components/enterprise";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { GatedCallButton } from "../../../shared/calling";
import { getEmployerBusinessKey } from "../../company/helpers/employerDualId.helpers";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";
import { getEmployerShiftPost } from "../storage/employerShift.postActions.crud";
import {
  getSiteMembershipTruth,
  resolveShiftOpsSiteIdForPost,
  subscribeSiteMembershipTruth,
} from "../../../shared/shiftOps/shiftJobsMembershipBridge";

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
    <section
      className="wm-shiftWorkspacesList"
      style={{ display: "grid", gap: 12, minHeight: 240 }}
      data-testid="employer-shift-workspaces-list"
    >
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
  const nav = useNavigate();

  return (
    <EnterpriseEmpty
      domain="shift"
      title={allCount === 0 ? "No work groups yet" : "No groups match your search"}
      subtitle={
        allCount === 0
          ? isGroups
            ? "Groups are created when you confirm workers for a shift."
            : "Broadcasts can be sent after a group is created."
          : "Try changing your search or filter."
      }
      primaryLabel={allCount === 0 ? "Open shift posts" : undefined}
      onPrimary={allCount === 0 ? () => nav(ROUTE_PATHS.employerShiftPosts) : undefined}
      testId="shift-workspaces-empty"
    />
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
  const initiatorMl = getEmployerBusinessKey(employerSettingsStorage.get()) ?? "";
  const receiverMl = workspace.workerMlId?.trim() ?? "";
  const post = getEmployerShiftPost(workspace.postId);
  const groupId = resolveShiftOpsSiteIdForPost(post ?? {});
  // Primitives only — object snapshots from getSiteMembershipTruth() are new refs each
  // read and would infinite-loop useSyncExternalStore (Maximum update depth exceeded).
  const membershipStatus = useSyncExternalStore(
    subscribeSiteMembershipTruth,
    () => getSiteMembershipTruth(groupId, receiverMl)?.status ?? "",
    () => getSiteMembershipTruth(groupId, receiverMl)?.status ?? "",
  );

  return (
    <article
      className="wm-shift-card wm-shift-card--employer wm-shift-pressable"
      style={{
        padding: 14,
        borderLeft: needsAttention
          ? "4px solid #dc2626"
          : "4px solid var(--wm-er-accent-shift, #16a34a)",
      }}
      data-testid={`employer-shift-workspace-card-${workspace.id}`}
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
            borderRadius: "var(--wm-radius-pill)",
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
            borderRadius: "var(--wm-radius-button)",
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
          alignItems: "flex-start",
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

        {receiverMl ? (
          <GatedCallButton
            groupId={groupId}
            membershipStatus={membershipStatus || null}
            workerMlId={receiverMl}
            initiatorMl={initiatorMl}
            peerLabel={workspace.workerName}
            extraDisabled={!initiatorMl || workspace.status === "completed"}
            shiftEndAt={workspace.endAt}
            workspaceStatus={workspace.status}
          />
        ) : (
          <button
            type="button"
            data-testid="call-worker-button"
            className="wm-outlineBtn"
            disabled
            aria-disabled
            title="Worker ID not available yet"
            style={{ fontSize: 12 }}
          >
            Call
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
