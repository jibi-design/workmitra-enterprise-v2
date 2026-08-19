// Shared double-confirmation Delete Account modal (Play / App Store).
// Requires password re-auth + typing "DELETE" before confirm.

import { useState, useCallback } from "react";
import { useOverlayBackClose } from "../native/useOverlayBackClose";

interface DeleteAccountModalProps {
  open: boolean;
  onCancel: () => void;
  /** Called after password + DELETE confirmation. */
  onConfirm: (password: string) => void | Promise<void>;
  /** Describes what data will be lost. Defaults to generic message. */
  deletionMessage?: string;
  busy?: boolean;
  errorMessage?: string | null;
}

export function DeleteAccountModal({
  open,
  onCancel,
  onConfirm,
  deletionMessage,
  busy = false,
  errorMessage = null,
}: DeleteAccountModalProps) {
  useOverlayBackClose(open, busy ? undefined : onCancel);
  if (!open) return null;
  return (
    <DeleteAccountInner
      onCancel={onCancel}
      onConfirm={onConfirm}
      deletionMessage={deletionMessage}
      busy={busy}
      errorMessage={errorMessage}
    />
  );
}

interface InnerProps {
  onCancel: () => void;
  onConfirm: (password: string) => void | Promise<void>;
  deletionMessage?: string;
  busy: boolean;
  errorMessage: string | null;
}

function DeleteAccountInner({
  onCancel,
  onConfirm,
  deletionMessage,
  busy,
  errorMessage,
}: InnerProps) {
  const [typed, setTyped] = useState("");
  const [password, setPassword] = useState("");
  const canDelete = typed === "DELETE" && password.length >= 1 && !busy;

  const handleCancel = useCallback(() => {
    if (busy) return;
    onCancel();
  }, [busy, onCancel]);

  const handleConfirm = useCallback(() => {
    if (!canDelete) return;
    void onConfirm(password);
  }, [canDelete, onConfirm, password]);

  return (
    <div style={overlayStyle} onClick={handleCancel} role="presentation">
      <div
        style={cardStyle}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wm-delete-account-title"
        data-testid="delete-account-modal"
      >
        <div style={iconCircleStyle}>
          <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="var(--wm-error)"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z"
            />
          </svg>
        </div>

        <h3 id="wm-delete-account-title" style={titleStyle}>
          Delete Account
        </h3>

        <p style={messageStyle}>
          {deletionMessage ??
            "This will permanently remove all your data including profile, history, and settings."}
        </p>
        <p style={{ ...messageStyle, fontWeight: 700, color: "var(--wm-error)" }}>
          This action cannot be undone.
        </p>

        <div style={{ marginTop: 16, marginBottom: 12, textAlign: "left" }}>
          <label style={inputLabelStyle} htmlFor="wm-delete-account-password">
            Confirm with your password
          </label>
          <input
            id="wm-delete-account-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Current password"
            disabled={busy}
            style={inputStyle}
            data-testid="delete-account-password"
          />
        </div>

        <div style={{ marginBottom: 20, textAlign: "left" }}>
          <label style={inputLabelStyle} htmlFor="wm-delete-account-confirm">
            Type <strong>DELETE</strong> to confirm
          </label>
          <input
            id="wm-delete-account-confirm"
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="DELETE"
            autoFocus
            disabled={busy}
            style={inputStyle}
            data-testid="delete-account-confirm-text"
            onKeyDown={(e) => {
              if (e.key === "Enter" && canDelete) handleConfirm();
            }}
          />
        </div>

        {errorMessage ? (
          <p style={{ ...messageStyle, color: "var(--wm-error)", marginBottom: 12 }} role="alert">
            {errorMessage}
          </p>
        ) : null}

        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={handleCancel} style={cancelBtnStyle} disabled={busy}>
            Keep Account
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canDelete}
            style={canDelete ? deleteBtnActiveStyle : deleteBtnDisabledStyle}
            data-testid="delete-account-submit"
          >
            {busy ? "Deleting…" : "Delete Everything"}
          </button>
        </div>
      </div>
    </div>
  );
}

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
