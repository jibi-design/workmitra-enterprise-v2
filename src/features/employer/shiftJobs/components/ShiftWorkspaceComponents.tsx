// App name: Job Mitra
// File name: ShiftWorkspaceComponents.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\ShiftWorkspaceComponents.tsx

import type { CSSProperties, ReactNode } from "react";
import type { ShiftWorkspace, ShiftWorkspaceUpdate } from "../types/shiftWorkspaceTypes";
import {
  detectSenderTag,
  fmtTime,
  updateKindLabel,
  updateKindPillClass,
  updateRowStyle,
} from "../types/shiftWorkspaceTypes";

type Draft = {
  title: string;
  body: string;
};

type BroadcastModalProps = {
  draft: Draft;
  onDraftChange: (draft: Draft) => void;
  onSend: () => void;
  onClose: () => void;
};

type ReplyModalProps = {
  draft: Draft;
  onDraftChange: (draft: Draft) => void;
  onSend: () => void;
  onClose: () => void;
  readOnly: boolean;
};

type ModalFrameProps = {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
};

type ModalActionsProps = {
  onClose: () => void;
  onSend: () => void;
  sendLabel: string;
  disabled?: boolean;
};

type RatingBannerProps = {
  workspace: ShiftWorkspace;
  hasRating: boolean;
  onRate: () => void;
};

const SHIFT_PRIMARY_BUTTON_STYLE: CSSProperties = {
  background: "var(--wm-er-accent-shift, #16a34a)",
  color: "#fff",
  border: "none",
  boxShadow: "0 10px 22px rgba(22,163,74,0.16)",
};

export function BroadcastModal({ draft, onDraftChange, onSend, onClose }: BroadcastModalProps) {
  return (
    <ModalFrame
      title="Broadcast Announcement"
      subtitle="Adds a group update to this local workspace."
      onClose={onClose}
    >
      <div className="wm-field" style={{ marginTop: 12 }}>
        <div className="wm-label">Title</div>
        <input
          className="wm-input"
          value={draft.title}
          onChange={(event) => onDraftChange({ ...draft, title: event.target.value })}
          placeholder="Announcement"
        />
      </div>

      <div className="wm-field" style={{ marginTop: 12 }}>
        <div className="wm-label">Message (optional)</div>
        <textarea
          className="wm-input"
          style={{ height: 110, paddingTop: 10 }}
          value={draft.body}
          onChange={(event) => onDraftChange({ ...draft, body: event.target.value })}
          placeholder="Type shift update details"
        />
      </div>

      <ModalActions onClose={onClose} onSend={onSend} sendLabel="Send Broadcast" />
    </ModalFrame>
  );
}

export function ReplyModal({ draft, onDraftChange, onSend, onClose, readOnly }: ReplyModalProps) {
  return (
    <ModalFrame
      title="Reply to Worker"
      subtitle="Adds a direct update to this local workspace."
      onClose={onClose}
    >
      <div className="wm-field" style={{ marginTop: 12 }}>
        <div className="wm-label">Message</div>
        <textarea
          className="wm-input"
          style={{ height: 120, paddingTop: 10 }}
          value={draft.body}
          onChange={(event) => onDraftChange({ ...draft, body: event.target.value })}
          placeholder="Type your reply"
        />

        <div style={{ marginTop: 6, fontSize: 11, color: "var(--wm-er-muted)" }}>
          Keep it short and operational.
        </div>
      </div>

      <ModalActions onClose={onClose} onSend={onSend} sendLabel="Send Reply" disabled={readOnly} />
    </ModalFrame>
  );
}

function ModalFrame({ title, subtitle, onClose, children }: ModalFrameProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.52)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 60,
      }}
      onClick={onClose}
    >
      <div
        className="wm-er-card"
        style={{
          width: "100%",
          maxWidth: 520,
          margin: 0,
          borderRadius: "var(--wm-radius-employee-card)",
          boxShadow: "0 24px 60px rgba(15,23,42,0.22)",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ fontSize: 16, fontWeight: 950, color: "var(--wm-er-text)" }}>{title}</div>

        <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.45 }}>
          {subtitle}
        </div>

        {children}
      </div>
    </div>
  );
}

function ModalActions({ onClose, onSend, sendLabel, disabled = false }: ModalActionsProps) {
  return (
    <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 10 }}>
      <button className="wm-outlineBtn" type="button" onClick={onClose}>
        Cancel
      </button>

      <button
        className="wm-primarybtn"
        type="button"
        onClick={onSend}
        disabled={disabled}
        aria-disabled={disabled}
        style={disabled ? undefined : SHIFT_PRIMARY_BUTTON_STYLE}
      >
        {sendLabel}
      </button>
    </div>
  );
}

export function UpdateCard({ u }: { u: ShiftWorkspaceUpdate }) {
  const metaPill = detectSenderTag(u);
  const style = updateRowStyle(u);
  const showMetaPill =
    Boolean(metaPill) && !(u.kind === "system" && metaPill?.text.toLowerCase() === "system");

  return (
    <article
      style={{
        border: style.border,
        background: style.bg,
        borderRadius: "var(--wm-radius-chip)",
        padding: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "baseline",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "var(--wm-er-text)" }}>{u.title}</div>

          <span className={updateKindPillClass(u.kind)} style={{ fontSize: 10, fontWeight: 850 }}>
            {updateKindLabel(u.kind)}
          </span>

          {showMetaPill && metaPill && (
            <span className={metaPill.className} style={{ fontSize: 10, fontWeight: 850 }}>
              {metaPill.text}
            </span>
          )}
        </div>

        <div style={{ fontSize: 11, fontWeight: 750, color: "var(--wm-er-muted)" }}>
          {fmtTime(u.createdAt)}
        </div>
      </div>

      {u.body && (
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
          {u.body}
        </div>
      )}
    </article>
  );
}

export function RatingBanner({ hasRating, onRate }: RatingBannerProps) {
  if (hasRating) {
    return (
      <div
        style={{
          marginTop: 10,
          padding: "9px 12px",
          borderRadius: "var(--wm-radius-button)",
          background: "rgba(22,163,74,0.06)",
          border: "1px solid rgba(22,163,74,0.15)",
          fontSize: 12,
          fontWeight: 850,
          color: "#15803d",
        }}
      >
        Rating submitted. Thank you.
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 10,
        padding: "12px 14px",
        borderRadius: "var(--wm-radius-chip)",
        background: "rgba(217,119,6,0.06)",
        border: "1px solid rgba(217,119,6,0.18)",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 900, color: "#92400e" }}>Rate this worker</div>

      <div style={{ fontSize: 11, color: "#92400e", marginTop: 3, opacity: 0.9, lineHeight: 1.5 }}>
        Honest feedback helps maintain worker quality.
      </div>

      <button
        type="button"
        onClick={onRate}
        style={{
          marginTop: 9,
          height: 36,
          padding: "0 16px",
          borderRadius: "var(--wm-radius-10)",
          border: "none",
          background: "var(--wm-er-accent-shift, #16a34a)",
          color: "#fff",
          fontWeight: 850,
          fontSize: 12,
          cursor: "pointer",
        }}
      >
        Rate Worker
      </button>
    </div>
  );
}
