// App name: Job Mitra
// File name: ShiftWorkspaceUpdateFeed.tsx
// Neutral tokens + reply limit affordance (P2-1 / P2-9)

import { useCallback, useState } from "react";

import {
  badgeStyle,
  clampText,
  detectSenderTag,
  fmtTime,
  updateKindLabel,
  updateKindTone,
  updateRowStyle,
} from "../helpers/shiftWorkspaceDisplayHelpers";
import { shiftWorkspacesStorage } from "../../shiftJobs/storage/shiftWorkspaces.storage";
import type { ShiftWorkspace } from "../../shiftJobs/storage/shiftWorkspaces.storage";
import {
  formatWorkspaceSendError,
  isWorkspaceMessageApiEnabled,
  sendAndSyncWorkspaceMessage,
} from "../../../shift/services/workspaceMessageSync.service";

import { ShiftWorkspaceReplyBox, REPLY_LIMIT } from "./ShiftWorkspaceReplyBox";

type Props = {
  workspace: ShiftWorkspace;
  readOnly: boolean;
  onReplySuccess: () => void;
  onReplyError: (message: string) => void;
};

export function ShiftWorkspaceUpdateFeed({
  workspace,
  readOnly,
  onReplySuccess,
  onReplyError,
}: Props) {
  const [replyText, setReplyText] = useState("");

  const sendReply = useCallback(() => {
    if (readOnly) return;

    const message = clampText(replyText, REPLY_LIMIT);
    if (!message) return;

    void (async () => {
      if (isWorkspaceMessageApiEnabled()) {
        let synced = false;
        try {
          synced = await sendAndSyncWorkspaceMessage({
            role: "employee",
            postId: workspace.postId,
            kind: "direct",
            title: "Reply (Employee)",
            body: message,
            jobName: workspace.jobName,
            startAt: workspace.startAt,
          });
        } catch (error) {
          onReplyError(formatWorkspaceSendError(error));
          return;
        }
        if (!synced) {
          onReplyError("Could not match this work group to a live server shift. Refresh, then try again.");
          return;
        }
        setReplyText("");
        onReplySuccess();
        return;
      }
      shiftWorkspacesStorage.replyToEmployer(workspace.id, message);
      setReplyText("");
      onReplySuccess();
    })();
  }, [
    readOnly,
    replyText,
    workspace.id,
    workspace.postId,
    workspace.jobName,
    workspace.startAt,
    onReplySuccess,
    onReplyError,
  ]);

  return (
    <section
      className="wm-shift-surface-glass wm-shift-surface-glass--shift wm-animateIn wm-shift-stagger--feed"
      data-testid="shift-workspace-updates"
      style={{ padding: 16 }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div>
          <div style={{ fontWeight: 950, fontSize: 14, color: "var(--wm-neutral-900)" }}>
            Work group
          </div>

          <div
            style={{ marginTop: 4, fontSize: 12, color: "var(--wm-neutral-600)", lineHeight: 1.45 }}
          >
            This is your shift work group. Employer announcements and replies live here.
          </div>
        </div>

        <span className="wm-shift-pill wm-shift-pill--outline" style={{ fontSize: 10 }}>
          {workspace.updates.length}
        </span>
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        {workspace.updates.length === 0 ? (
          <div
            className="wm-shift-surface-glass"
            style={{
              padding: "12px 14px",
              fontSize: 12,
              color: "var(--wm-neutral-600)",
              lineHeight: 1.45,
            }}
          >
            No updates yet. Employer updates will appear here.
          </div>
        ) : (
          workspace.updates.map((update) => <WorkspaceUpdateCard key={update.id} update={update} />)
        )}
      </div>

      <ShiftWorkspaceReplyBox
        readOnly={readOnly}
        replyText={replyText}
        onReplyTextChange={setReplyText}
        onSendReply={sendReply}
      />
    </section>
  );
}

function WorkspaceUpdateCard({ update }: { update: ShiftWorkspace["updates"][number] }) {
  const rowStyle = updateRowStyle(update);
  const sender = detectSenderTag(update);

  return (
    <article
      style={{
        border: rowStyle.border,
        background: rowStyle.bg,
        borderRadius: "var(--wm-radius-chip)",
        padding: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 950,
              color: "var(--wm-neutral-900)",
              lineHeight: 1.3,
            }}
          >
            {update.title}
          </div>

          <div style={{ marginTop: 7, display: "flex", gap: 6, flexWrap: "wrap" }}>
            <UpdatePill label={updateKindLabel(update.kind)} tone={updateKindTone(update.kind)} />

            {sender && !isDuplicateSystemPill(update.kind, sender.text) && (
              <UpdatePill label={sender.text} tone={sender.tone} />
            )}
          </div>
        </div>

        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "var(--wm-neutral-600)",
            whiteSpace: "nowrap",
          }}
        >
          {fmtTime(update.createdAt)}
        </div>
      </div>

      {update.body && (
        <div
          style={{
            marginTop: 9,
            fontSize: 12,
            color: "var(--wm-neutral-600)",
            fontWeight: 600,
            lineHeight: 1.5,
          }}
        >
          {update.body}
        </div>
      )}
    </article>
  );
}

function UpdatePill({ label, tone }: { label: string; tone: Parameters<typeof badgeStyle>[0] }) {
  return (
    <span
      style={{
        height: 22,
        padding: "0 8px",
        borderRadius: "var(--wm-radius-pill)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        fontWeight: 850,
        ...badgeStyle(tone),
      }}
    >
      {label}
    </span>
  );
}

function isDuplicateSystemPill(kind: string, senderText: string): boolean {
  return kind === "system" && senderText.toLowerCase() === "system";
}
