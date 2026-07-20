// src/shared/components/DeleteAccountModal.tsx
// Shared double-confirmation Delete Account modal.
// User must type "DELETE" to enable the delete button.
// Both Employee and Employer settings use this component.

import { useState, useCallback } from "react";

/* ------------------------------------------------ */
/* Public wrapper — controls visibility              */
/* ------------------------------------------------ */
interface DeleteAccountModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  /** Describes what data will be lost. Defaults to generic message. */
  deletionMessage?: string;
}

export function DeleteAccountModal({
  open,
  onCancel,
  onConfirm,
  deletionMessage,
}: DeleteAccountModalProps) {
  if (!open) return null;
  return (
    <DeleteAccountInner
      onCancel={onCancel}
      onConfirm={onConfirm}
      deletionMessage={deletionMessage}
    />
  );
}

/* ------------------------------------------------ */
/* Inner component — mounts fresh each open          */
/* ------------------------------------------------ */
interface InnerProps {
  onCancel: () => void;
  onConfirm: () => void;
  deletionMessage?: string;
}

function DeleteAccountInner({ onCancel, onConfirm, deletionMessage }: InnerProps) {
  const [typed, setTyped] = useState("");
  const canDelete = typed === "DELETE";

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const handleConfirm = useCallback(() => {
    if (!canDelete) return;
    onConfirm();
  }, [canDelete, onConfirm]);

  return (
    <div style={overlayStyle} onClick={handleCancel}>
      <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
        <div style={iconCircleStyle}>
          <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="var(--wm-error)"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z"
            />
          </svg>
        </div>

        <h3 style={titleStyle}>Delete Account</h3>

        <p style={messageStyle}>
          {deletionMessage ??
            "This will permanently remove all your data including profile, history, and settings."}
        </p>
        <p style={{ ...messageStyle, fontWeight: 700, color: "var(--wm-error)" }}>
          This action cannot be undone.
        </p>

        <div style={{ marginTop: 16, marginBottom: 20 }}>
          <label style={inputLabelStyle}>
            Type <strong>DELETE</strong> to confirm:
          </label>
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="DELETE"
            autoFocus
            style={inputStyle}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canDelete) handleConfirm();
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={handleCancel} style={cancelBtnStyle}>
            Keep Account
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canDelete}
            style={canDelete ? deleteBtnActiveStyle : deleteBtnDisabledStyle}
          >
            Delete Everything
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Modal styles                                     */
/* ------------------------------------------------ */
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 9999,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 380,
  borderRadius: 16,
  background: "var(--wm-card, #fff)",
  padding: "28px 24px 24px",
  textAlign: "center",
  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
};

const iconCircleStyle: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: "50%",
  background: "rgba(220,38,38,0.08)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 12,
};

const titleStyle: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: 18,
  fontWeight: 800,
  color: "var(--wm-error)",
};

const messageStyle: React.CSSProperties = {
  margin: "0 0 4px",
  fontSize: 13,
  lineHeight: 1.5,
  color: "var(--wm-text-muted, #64748b)",
  fontWeight: 500,
};

const inputLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--wm-text, #1e293b)",
  marginBottom: 8,
  textAlign: "left",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 42,
  borderRadius: 10,
  border: "2px solid rgba(220,38,38,0.25)",
  background: "var(--wm-bg, #f8fafc)",
  padding: "0 12px",
  fontSize: 15,
  fontWeight: 700,
  color: "var(--wm-text, #1e293b)",
  outline: "none",
  boxSizing: "border-box",
  letterSpacing: 1.5,
  textAlign: "center",
};

const cancelBtnStyle: React.CSSProperties = {
  flex: 1,
  height: 42,
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.12)",
  background: "var(--wm-card, #fff)",
  fontWeight: 800,
  fontSize: 13,
  color: "var(--wm-text, #1e293b)",
  cursor: "pointer",
};

const deleteBtnActiveStyle: React.CSSProperties = {
  flex: 1,
  height: 42,
  borderRadius: 14,
  border: 0,
  background: "var(--wm-error)",
  fontWeight: 800,
  fontSize: 13,
  color: "#fff",
  cursor: "pointer",
};

const deleteBtnDisabledStyle: React.CSSProperties = {
  ...deleteBtnActiveStyle,
  background: "var(--wm-bg, #f8fafc)",
  color: "var(--wm-text-muted, #94a3b8)",
  border: "1px solid rgba(0,0,0,0.1)",
  cursor: "not-allowed",
};
