// src/features/employee/shiftJobs/components/ShiftWorkspaceUpdateFeed.tsx
//
// Updates feed + reply section for ShiftWorkspacePage.

import { useState, useCallback } from "react";

import { shiftWorkspacesStorage } from "../storage/shiftWorkspaces.storage";
import type { ShiftWorkspace } from "../storage/shiftWorkspaces.storage";
import {
  fmtTime,
  updateKindLabel,
  updateKindTone,
  detectSenderTag,
  updateRowStyle,
  badgeStyle,
  clampText,
} from "../helpers/shiftWorkspaceDisplayHelpers";

/* ── Props ─────────────────────────────────────── */

type Props = {
  workspace: ShiftWorkspace;
  readOnly: boolean;
  onReplySuccess: () => void;
};

/* ── Component ─────────────────────────────────── */

export function ShiftWorkspaceUpdateFeed({ workspace, readOnly, onReplySuccess }: Props) {
  const [replyText, setReplyText] = useState("");

  const sendReply = useCallback(() => {
    if (readOnly) return;
    const msg = clampText(replyText, 360);
    if (!msg) return;
    shiftWorkspacesStorage.replyToEmployer(workspace.id, msg);
    setReplyText("");
    onReplySuccess();
  }, [readOnly, replyText, workspace.id, onReplySuccess]);

  return (
    <div className="wm-ee-card" style={{ marginTop: 12 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--wm-emp-text)" }}>
        Updates
      </div>

      {/* ── Feed ── */}
      <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
        {workspace.updates.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--wm-emp-muted)" }}>
            No updates yet. Employer updates will appear here.
          </div>
        ) : (
          workspace.updates.map((u) => {
            const st = updateRowStyle(u);
            const sender = detectSenderTag(u);
            return (
              <div key={u.id} style={{ border: st.border, background: st.bg, borderRadius: 12, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-emp-text)" }}>
                      {u.title}
                    </div>
                    <span style={{
                      height: 22, padding: "0 8px", borderRadius: 999,
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700,
                      ...badgeStyle(updateKindTone(u.kind)),
                    }}>
                      {updateKindLabel(u.kind)}
                    </span>
                    {sender && (
                      <span style={{
                        height: 22, padding: "0 8px", borderRadius: 999,
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 700,
                        ...badgeStyle(sender.tone),
                      }}>
                        {sender.text}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--wm-emp-muted)" }}>
                    {fmtTime(u.createdAt)}
                  </div>
                </div>
                {u.body && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "var(--wm-emp-muted)", fontWeight: 500, lineHeight: 1.5 }}>
                    {u.body}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Reply ── */}
      <div style={{ marginTop: 12, borderTop: "1px solid var(--wm-er-divider)", paddingTop: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--wm-emp-text)" }}>
          Reply to Employer
        </div>
        {readOnly ? (
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--wm-emp-muted)", fontWeight: 500 }}>
            Reply is disabled because this workspace is read-only.
          </div>
        ) : (
          <>
            <div className="wm-field" style={{ marginTop: 10 }}>
              <textarea
                className="wm-input"
                style={{ height: 90, paddingTop: 10, fontFamily: "inherit" }}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                maxLength={360}
              />
              <div style={{
                marginTop: 4, fontSize: 11, color: "var(--wm-emp-muted)",
                display: "flex", justifyContent: "space-between",
              }}>
                <span>Keep it clear and professional.</span>
                <span>{replyText.length}/360</span>
              </div>
            </div>
            <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
              <button
                className="wm-primarybtn" type="button"
                onClick={sendReply} disabled={!replyText.trim()}
              >
                Send Reply
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}