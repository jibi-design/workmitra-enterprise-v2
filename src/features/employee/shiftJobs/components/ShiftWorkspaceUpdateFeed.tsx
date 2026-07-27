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

const REPLY_LIMIT = 360;
const REPLY_WARN_AT = 300;

type Props = {
  workspace: ShiftWorkspace;
  readOnly: boolean;
  onReplySuccess: () => void;
};

export function ShiftWorkspaceUpdateFeed({ workspace, readOnly, onReplySuccess }: Props) {
  const [replyText, setReplyText] = useState("");

  const sendReply = useCallback(() => {
    if (readOnly) return;

    const message = clampText(replyText, REPLY_LIMIT);
    if (!message) return;

    shiftWorkspacesStorage.replyToEmployer(workspace.id, message);
    setReplyText("");
    onReplySuccess();
  }, [readOnly, replyText, workspace.id, onReplySuccess]);

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
            Updates
          </div>

          <div
            style={{ marginTop: 4, fontSize: 12, color: "var(--wm-neutral-600)", lineHeight: 1.45 }}
          >
            Shift updates, replies, and local workspace records.
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

      <ReplyBox
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

function ReplyBox({
  readOnly,
  replyText,
  onReplyTextChange,
  onSendReply,
}: {
  readOnly: boolean;
  replyText: string;
  onReplyTextChange: (value: string) => void;
  onSendReply: () => void;
}) {
  const nearLimit = replyText.length > REPLY_WARN_AT;
  const counterColor = nearLimit ? "var(--wm-amber-700)" : "var(--wm-neutral-600)";

  return (
    <div style={{ marginTop: 14, borderTop: "1px solid rgba(226,232,240,0.95)", paddingTop: 14 }}>
      <div style={{ fontWeight: 950, fontSize: 14, color: "var(--wm-neutral-900)" }}>
        Reply to Employer
      </div>

      {readOnly ? (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: "var(--wm-neutral-600)",
            fontWeight: 600,
            lineHeight: 1.45,
          }}
        >
          Reply is disabled because this work group is read-only.
        </div>
      ) : (
        <>
          <div className="wm-field" style={{ marginTop: 10 }}>
            <textarea
              className="wm-input"
              style={{
                height: 92,
                paddingTop: 10,
                fontFamily: "inherit",
                ...(nearLimit
                  ? {
                      borderColor: "var(--wm-amber-600)",
                      boxShadow:
                        "0 0 0 1px color-mix(in srgb, var(--wm-amber-600) 35%, transparent)",
                    }
                  : null),
              }}
              value={replyText}
              onChange={(event) => onReplyTextChange(event.target.value)}
              placeholder="Type your reply"
              maxLength={REPLY_LIMIT}
              aria-describedby="shift-reply-limit-hint"
            />

            <div
              id="shift-reply-limit-hint"
              style={{
                marginTop: 5,
                fontSize: 11,
                color: counterColor,
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <span>
                {nearLimit
                  ? "Approaching the 360-character limit."
                  : "Keep it clear and professional."}
              </span>
              <span style={{ fontWeight: nearLimit ? 850 : 600 }}>
                {replyText.length}/{REPLY_LIMIT}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="wm-primarybtn wm-shift-pressable"
            onClick={onSendReply}
            disabled={!replyText.trim()}
            style={{ width: "100%", marginTop: 12 }}
          >
            Send Reply
          </button>
        </>
      )}
    </div>
  );
}

function isDuplicateSystemPill(kind: string, senderText: string): boolean {
  return kind === "system" && senderText.toLowerCase() === "system";
}
