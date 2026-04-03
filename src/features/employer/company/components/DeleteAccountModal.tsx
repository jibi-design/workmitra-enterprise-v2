// src/features/employer/company/components/DeleteAccountModal.tsx
// Double-confirmation Delete Account modal.
// Session 7: User must type "DELETE" to enable the delete button.
// Pattern: Inner component mounts fresh each open → useState resets naturally.

import { useState, useCallback } from "react";

/* ------------------------------------------------ */
/* Public wrapper — controls visibility              */
/* ------------------------------------------------ */
interface DeleteAccountModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteAccountModal({ open, onCancel, onConfirm }: DeleteAccountModalProps) {
  if (!open) return null;
  return <DeleteAccountInner onCancel={onCancel} onConfirm={onConfirm} />;
}

/* ------------------------------------------------ */
/* Inner component — mounts fresh each time          */
/* ------------------------------------------------ */
interface InnerProps {
  onCancel: () => void;
  onConfirm: () => void;
}

function DeleteAccountInner({ onCancel, onConfirm }: InnerProps) {
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
        {/* Warning icon */}
        <div style={iconCircleStyle}>
          <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="var(--wm-error)"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z"
            />
          </svg>
        </div>

        {/* Title */}
        <h3 style={titleStyle}>Delete Account</h3>

        {/* Warning message */}
        <p style={messageStyle}>
          This will permanently remove all your employer data including job posts,
          applications, staff records, and workspaces.
        </p>
        <p style={{ ...messageStyle, fontWeight: 700, color: "var(--wm-error)" }}>
          This action cannot be undone.
        </p>

        {/* Type DELETE input */}
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

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={handleCancel} style={cancelBtnStyle}>
            Keep My Account
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
  background: "rgba(0, 0, 0, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 380,
  borderRadius: 16,
  background: "var(--wm-er-card)",
  padding: "28px 24px 24px",
  textAlign: "center",
  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
};

const iconCircleStyle: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: "50%",
  background: "rgba(220, 38, 38, 0.08)",
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
  color: "var(--wm-er-muted)",
  fontWeight: 500,
};

const inputLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--wm-er-text)",
  marginBottom: 8,
  textAlign: "left",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 42,
  borderRadius: "var(--wm-radius-10)",
  border: "2px solid rgba(220, 38, 38, 0.25)",
  background: "var(--wm-er-bg)",
  padding: "0 12px",
  fontSize: 15,
  fontWeight: 700,
  color: "var(--wm-er-text)",
  outline: "none",
  boxSizing: "border-box",
  letterSpacing: 1.5,
  textAlign: "center",
};

const cancelBtnStyle: React.CSSProperties = {
  flex: 1,
  height: 42,
  borderRadius: "var(--wm-radius-14)",
  border: "1px solid var(--wm-er-border)",
  background: "var(--wm-er-card)",
  fontWeight: 800,
  fontSize: 13,
  color: "var(--wm-er-text)",
  cursor: "pointer",
};

const deleteBtnActiveStyle: React.CSSProperties = {
  flex: 1,
  height: 42,
  borderRadius: "var(--wm-radius-14)",
  border: 0,
  background: "var(--wm-error)",
  fontWeight: 800,
  fontSize: 13,
  color: "#fff",
  cursor: "pointer",
};

const deleteBtnDisabledStyle: React.CSSProperties = {
  ...deleteBtnActiveStyle,
  background: "var(--wm-er-bg)",
  color: "var(--wm-er-muted)",
  border: "1px solid var(--wm-er-border)",
  cursor: "not-allowed",
};