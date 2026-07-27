// App: Job Mitra / WorkMitra_Enterprise_v2
// File: WorkforcePostEventRatingModalShell.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\WorkforcePostEventRatingModalShell.tsx

import type { ReactNode } from "react";
import { IconClose } from "../../../../shared/domains/workforce/ui/workforceIcons";

type Props = {
  groupName: string;
  children: ReactNode;
  errors: string[];
  isSubmitting: boolean;
  ratedCount: number;
  activeMemberCount: number;
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
  borderRadius: "var(--wm-radius-chip)",
  width: "100%",
  maxWidth: 440,
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
  gap: 14,
};

const footerStyle: React.CSSProperties = {
  padding: "12px 18px 16px",
  borderTop: "1px solid var(--wm-er-border)",
  display: "flex",
  justifyContent: "flex-end",
};

export function WorkforcePostEventRatingModalShell({
  groupName,
  children,
  errors,
  isSubmitting,
  ratedCount,
  activeMemberCount,
  onClose,
  onSubmit,
}: Props) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
        <div style={headerStyle}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--wm-er-text)" }}>
              Rate Your Team
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>
              {groupName}
            </div>
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
                borderRadius: "var(--wm-radius-8)",
                background: "rgba(220,38,38,0.06)",
              }}
            >
              {errors.map((error, index) => (
                <div
                  key={index}
                  style={{ fontSize: 12, color: "var(--wm-error)", fontWeight: 600 }}
                >
                  {error}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={footerStyle}>
          <button
            className="wm-primarybtn"
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || ratedCount === 0}
            style={{
              background:
                ratedCount === activeMemberCount
                  ? "var(--wm-er-accent-workforce, #b45309)"
                  : "#d1d5db",
              fontSize: 13,
              padding: "8px 20px",
              cursor: ratedCount === 0 ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? "Saving..." : `Submit Ratings (${ratedCount}/${activeMemberCount})`}
          </button>
        </div>
      </div>
    </div>
  );
}
