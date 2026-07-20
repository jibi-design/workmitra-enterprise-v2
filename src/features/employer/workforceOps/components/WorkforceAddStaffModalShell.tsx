// App: Job Mitra / WorkMitra_Enterprise_v2
// File: WorkforceAddStaffModalShell.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\WorkforceAddStaffModalShell.tsx

import type { ReactNode } from "react";
import { IconClose } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  children: ReactNode;
  errors: string[];
  canSubmit: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: 16,
};

const modalStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  width: "100%",
  maxWidth: 420,
  maxHeight: "90vh",
  overflow: "auto",
  boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 18px 12px",
  borderBottom: "1px solid var(--wm-er-border)",
};

const bodyStyle: React.CSSProperties = {
  padding: "16px 18px",
  display: "grid",
  gap: 16,
};

const footerStyle: React.CSSProperties = {
  padding: "12px 18px 16px",
  borderTop: "1px solid var(--wm-er-border)",
  display: "flex",
  gap: 8,
  justifyContent: "flex-end",
};

export function WorkforceAddStaffModalShell({
  children,
  errors,
  canSubmit,
  onClose,
  onSubmit,
}: Props) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
        <div style={headerStyle}>
          <div style={{ fontSize: 16, fontWeight: 900, color: "var(--wm-er-text)" }}>
            Add Staff Member
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--wm-er-muted)",
              padding: 4,
            }}
          >
            <IconClose />
          </button>
        </div>

        <div style={bodyStyle}>
          {children}

          {errors.length > 0 && (
            <div
              style={{
                padding: 10,
                borderRadius: 8,
                background: "rgba(220,38,38,0.06)",
                border: "1px solid rgba(220,38,38,0.15)",
              }}
            >
              {errors.map((error, index) => (
                <div
                  key={index}
                  style={{ fontSize: 12, color: "var(--wm-error)", lineHeight: 1.4 }}
                >
                  {error}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={footerStyle}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--wm-radius-10)",
              border: "1px solid var(--wm-er-border)",
              background: "#fff",
              fontSize: 13,
              fontWeight: 700,
              color: "var(--wm-er-text)",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            className="wm-primarybtn"
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            style={{
              background: canSubmit ? AMBER : "var(--wm-er-muted)",
              fontSize: 13,
              padding: "8px 20px",
            }}
          >
            Add Staff
          </button>
        </div>
      </div>
    </div>
  );
}
