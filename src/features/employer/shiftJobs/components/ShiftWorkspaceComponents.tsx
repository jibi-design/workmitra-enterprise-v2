// src/features/employer/shiftJobs/components/ShiftWorkspaceComponents.tsx
//
// Sub-components for EmployerShiftWorkspacePage.
// BroadcastModal, ReplyModal, UpdateCard, RatingBanner.

import type { ShiftWorkspace, ShiftWorkspaceUpdate } from "../types/shiftWorkspaceTypes";
import {
  fmtTime, updateKindLabel, updateKindPillClass,
  detectSenderTag, updateRowStyle,
} from "../types/shiftWorkspaceTypes";

/* ------------------------------------------------ */
/* Broadcast Modal                                  */
/* ------------------------------------------------ */
type Draft = { title: string; body: string };

type BroadcastModalProps = {
  draft: Draft;
  onDraftChange: (d: Draft) => void;
  onSend: () => void;
  onClose: () => void;
};

export function BroadcastModal({ draft, onDraftChange, onSend, onClose }: BroadcastModalProps) {
  return (
    <div
      role="dialog" aria-modal="true" aria-label="Broadcast"
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, zIndex: 60,
      }}
      onClick={onClose}
    >
      <div className="wm-er-card" style={{ width: "100%", maxWidth: 520, margin: 0 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontWeight: 700, color: "var(--wm-er-text)" }}>Broadcast Announcement</div>
        <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted)" }}>
          Appears as <b>ANNOUNCEMENT</b> in employee workspace. Employee gets notified.
        </div>
        <div className="wm-field" style={{ marginTop: 12 }}>
          <div className="wm-label">Title</div>
          <input
            className="wm-input"
            value={draft.title}
            onChange={(e) => onDraftChange({ ...draft, title: e.target.value })}
            placeholder="Announcement"
          />
        </div>
        <div className="wm-field" style={{ marginTop: 12 }}>
          <div className="wm-label">Message (optional)</div>
          <textarea
            className="wm-input" style={{ height: 110, paddingTop: 10 }}
            value={draft.body}
            onChange={(e) => onDraftChange({ ...draft, body: e.target.value })}
            placeholder="Type details here"
          />
        </div>
        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="wm-outlineBtn" type="button" onClick={onClose}>Cancel</button>
          <button className="wm-primarybtn" type="button" onClick={onSend}>Send</button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Reply Modal                                      */
/* ------------------------------------------------ */
type ReplyModalProps = {
  draft: Draft;
  onDraftChange: (d: Draft) => void;
  onSend: () => void;
  onClose: () => void;
  readOnly: boolean;
};

export function ReplyModal({ draft, onDraftChange, onSend, onClose, readOnly }: ReplyModalProps) {
  return (
    <div
      role="dialog" aria-modal="true" aria-label="Reply to worker"
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, zIndex: 60,
      }}
      onClick={onClose}
    >
      <div className="wm-er-card" style={{ width: "100%", maxWidth: 520, margin: 0 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontWeight: 700, color: "var(--wm-er-text)" }}>Reply to Worker</div>
        <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted)" }}>
          Sends a <b>DIRECT</b> update. Employee gets notified.
        </div>
        <div className="wm-field" style={{ marginTop: 12 }}>
          <div className="wm-label">Title</div>
          <input
            className="wm-input"
            value={draft.title}
            onChange={(e) => onDraftChange({ ...draft, title: e.target.value })}
            placeholder="Reply (Employer)"
          />
        </div>
        <div className="wm-field" style={{ marginTop: 12 }}>
          <div className="wm-label">Message</div>
          <textarea
            className="wm-input" style={{ height: 120, paddingTop: 10 }}
            value={draft.body}
            onChange={(e) => onDraftChange({ ...draft, body: e.target.value })}
            placeholder="Type your reply"
          />
          <div style={{ marginTop: 6, fontSize: 11, color: "var(--wm-er-muted)" }}>
            Keep it short and operational.
          </div>
        </div>
        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="wm-outlineBtn" type="button" onClick={onClose}>Cancel</button>
          <button
            className="wm-primarybtn" type="button" onClick={onSend}
            disabled={readOnly} aria-disabled={readOnly}
          >
            Send Reply
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Update Card                                      */
/* ------------------------------------------------ */
export function UpdateCard({ u }: { u: ShiftWorkspaceUpdate }) {
  const metaPill = detectSenderTag(u);
  const st = updateRowStyle(u);
  return (
    <div style={{ border: st.border, background: st.bg, borderRadius: 12, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>{u.title}</div>
          <span className={updateKindPillClass(u.kind)} style={{ fontSize: 11, fontWeight: 600 }}>
            {updateKindLabel(u.kind)}
          </span>
          {metaPill && (
            <span className={metaPill.className} style={{ fontSize: 11, fontWeight: 600 }}>
              {metaPill.text}
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--wm-er-muted)" }}>
          {fmtTime(u.createdAt)}
        </div>
      </div>
      {u.body && (
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
          {u.body}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------ */
/* Rating Banner                                    */
/* ------------------------------------------------ */
type RatingBannerProps = {
  workspace: ShiftWorkspace;
  hasRating: boolean;
  onRate: () => void;
};

export function RatingBanner({ hasRating, onRate }: RatingBannerProps) {
  if (hasRating) {
    return (
      <div style={{
        marginTop: 10, padding: "8px 12px", borderRadius: 8,
        background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.15)",
        fontSize: 12, fontWeight: 600, color: "#15803d",
      }}>
        &#10003; You have rated this worker. Thank you!
      </div>
    );
  }
  return (
    <div style={{
      marginTop: 10, padding: "12px 14px", borderRadius: 10,
      background: "rgba(217,119,6,0.06)", border: "1px solid rgba(217,119,6,0.18)",
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>
        Rate this worker
      </div>
      <div style={{ fontSize: 11, color: "#92400e", marginTop: 2, opacity: 0.85, lineHeight: 1.5 }}>
        Your rating helps this worker get better opportunities. Honest feedback builds a stronger workforce.
      </div>
      <button
        type="button"
        onClick={onRate}
        style={{
          marginTop: 8, height: 36, padding: "0 16px", borderRadius: 8, border: "none",
          background: "var(--wm-er-accent-shift, #16a34a)",
          color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 6,
        }}
      >
        &#9733; Rate Worker
      </button>
    </div>
  );
}