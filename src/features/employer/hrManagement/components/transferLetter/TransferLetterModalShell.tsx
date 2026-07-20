// App: Job Mitra / WorkMitra_Enterprise_v2
// File: TransferLetterModalShell.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\transferLetter\TransferLetterModalShell.tsx

import type { ReactNode } from "react";

type Props = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function TransferLetterModalShell({ title, onClose, children }: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: "rgba(0,0,0,0.35)",
      }}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px 16px 0 0",
          width: "100%",
          maxWidth: 480,
          maxHeight: "90vh",
          overflow: "auto",
          padding: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 16, color: "var(--wm-er-text)" }}>{title}</div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              color: "var(--wm-er-muted)",
            }}
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
