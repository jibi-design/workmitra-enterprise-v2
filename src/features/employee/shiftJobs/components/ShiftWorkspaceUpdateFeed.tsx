// App name: Job Mitra
// File name: ShiftWorkspaceUpdateFeed.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\ShiftWorkspaceUpdateFeed.tsx

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

type Props = {
  workspace: ShiftWorkspace;
  readOnly: boolean;
  onReplySuccess: () => void;
};

export function ShiftWorkspaceUpdateFeed({ workspace, readOnly, onReplySuccess }: Props) {
  const [replyText, setReplyText] = useState("");

  const sendReply = useCallback(() => {
    if (readOnly) return;

    const message = clampText(replyText, 360);
    if (!message) return;

    shiftWorkspacesStorage.replyToEmployer(workspace.id, message);
    setReplyText("");
    onReplySuccess();
  }, [readOnly, replyText, workspace.id, onReplySuccess]);

  return (
    <section
      className="wm-ee-card"
      style={{
        marginTop: 12,
        padding: 16,
        borderRadius: 20,
        border: "1px solid rgba(226,232,240,0.95)",
        background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
        boxShadow: "0 10px 24px rgba(15,23,42,0.045)",
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
        <div>
          <div style={{ fontWeight: 950, fontSize: 14, color: "var(--wm-emp-text)" }}>Updates</div>

          <div
            style={{ marginTop: 4, fontSize: 12, color: "var(--wm-emp-muted)", lineHeight: 1.45 }}
          >
            Shift updates, replies, and local workspace records.
          </div>
        </div>

        <span
          style={{
            padding: "5px 9px",
            borderRadius: 999,
            background: "rgba(22,163,74,0.08)",
            border: "1px solid rgba(22,163,74,0.16)",
            color: "var(--wm-er-accent-shift, #16a34a)",
            fontSize: 10,
            fontWeight: 950,
            whiteSpace: "nowrap",
          }}
        >
          {workspace.updates.length}
        </span>
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        {workspace.updates.length === 0 ? (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 14,
              background: "rgba(248,250,252,0.96)",
              border: "1px solid rgba(226,232,240,0.9)",
              fontSize: 12,
              color: "var(--wm-emp-muted)",
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
        borderRadius: 16,
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
            style={{ fontSize: 13, fontWeight: 950, color: "var(--wm-emp-text)", lineHeight: 1.3 }}
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
            color: "var(--wm-emp-muted)",
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
            color: "var(--wm-emp-muted)",
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
        borderRadius: 999,
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
  return (
    <div style={{ marginTop: 14, borderTop: "1px solid rgba(226,232,240,0.95)", paddingTop: 14 }}>
      <div style={{ fontWeight: 950, fontSize: 14, color: "var(--wm-emp-text)" }}>
        Reply to Employer
      </div>

      {readOnly ? (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: "var(--wm-emp-muted)",
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
              style={{ height: 92, paddingTop: 10, fontFamily: "inherit" }}
              value={replyText}
              onChange={(event) => onReplyTextChange(event.target.value)}
              placeholder="Type your reply"
              maxLength={360}
            />

            <div
              style={{
                marginTop: 5,
                fontSize: 11,
                color: "var(--wm-emp-muted)",
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <span>Keep it clear and professional.</span>
              <span>{replyText.length}/360</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onSendReply}
            disabled={!replyText.trim()}
            style={{
              width: "100%",
              marginTop: 12,
              padding: "11px 12px",
              borderRadius: 14,
              border: "none",
              background: replyText.trim()
                ? "var(--wm-er-accent-shift, #16a34a)"
                : "rgba(148,163,184,0.45)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 950,
              cursor: replyText.trim() ? "pointer" : "not-allowed",
              boxShadow: replyText.trim() ? "0 10px 22px rgba(22,163,74,0.16)" : "none",
            }}
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
