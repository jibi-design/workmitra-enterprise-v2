// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceAnnounceDashActions.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceAnnounceDashActions.tsx

import type { CSSProperties } from "react";
import type { WorkforceAnnouncement } from "../../../../shared/domains/workforce/types/workforceTypes";
import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  announcement: WorkforceAnnouncement;
  isTerminal: boolean;
  selectedCount: number;
  confirmGroupOpen: boolean;
  saveTemplateOpen: boolean;
  templateName: string;
  templateError: string;
  actionError: string;
  onStatusChange: (status: WorkforceAnnouncement["status"]) => void;
  onOpenConfirmGroup: () => void;
  onConfirmGroup: () => void;
  onCancelConfirmGroup: () => void;
  onOpenSaveTemplate: () => void;
  onTemplateNameChange: (value: string) => void;
  onSaveTemplate: () => void;
  onCancelSaveTemplate: () => void;
};

const actionSmBtnStyle = (color: string): CSSProperties => ({
  padding: "4px 10px",
  borderRadius: 6,
  border: `1px solid ${color}`,
  background: "transparent",
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 800,
  color,
});

export function EmployerWorkforceAnnounceDashActions({
  announcement,
  isTerminal,
  selectedCount,
  confirmGroupOpen,
  saveTemplateOpen,
  templateName,
  templateError,
  actionError,
  onStatusChange,
  onOpenConfirmGroup,
  onConfirmGroup,
  onCancelConfirmGroup,
  onOpenSaveTemplate,
  onTemplateNameChange,
  onSaveTemplate,
  onCancelSaveTemplate,
}: Props) {
  return (
    <>
      {!isTerminal && (
        <div className="wm-er-card" style={{ marginTop: 14 }}>
          <div
            style={{ fontSize: 13, fontWeight: 900, color: "var(--wm-er-text)", marginBottom: 10 }}
          >
            Actions
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {announcement.status === "open" && (
              <button
                className="wm-primarybtn"
                type="button"
                onClick={() => onStatusChange("analyzing")}
                style={{ width: "100%", background: "var(--wm-warning)", padding: "10px" }}
              >
                Start Analysis
              </button>
            )}

            {announcement.status === "analyzing" && (
              <>
                <button
                  className="wm-primarybtn"
                  type="button"
                  onClick={onOpenConfirmGroup}
                  style={{ width: "100%", background: "var(--wm-success)", padding: "10px" }}
                >
                  Confirm & Create Group ({selectedCount} selected)
                </button>

                <button
                  type="button"
                  onClick={() => onStatusChange("open")}
                  style={actionSmBtnStyle(AMBER)}
                >
                  Back to Open
                </button>
              </>
            )}

            {announcement.status === "confirmed" && (
              <button
                className="wm-primarybtn"
                type="button"
                onClick={() => onStatusChange("completed")}
                style={{ width: "100%", background: "var(--wm-er-muted)", padding: "10px" }}
              >
                Mark as Completed
              </button>
            )}

            <button
              type="button"
              onClick={() => onStatusChange("cancelled")}
              style={actionSmBtnStyle("var(--wm-error)")}
            >
              Cancel Announcement
            </button>
          </div>
        </div>
      )}

      {confirmGroupOpen && (
        <div
          className="wm-er-card"
          style={{ marginTop: 10, border: "2px solid var(--wm-success)" }}
        >
          <div style={{ fontSize: 14, fontWeight: 900, color: "var(--wm-success)" }}>
            Confirm & Create Group
          </div>

          <div style={{ fontSize: 12, color: "var(--wm-er-text)", marginTop: 6, lineHeight: 1.5 }}>
            This will create a Work Group with {selectedCount} member
            {selectedCount !== 1 ? "s" : ""}. Staff will be notified.
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button
              className="wm-primarybtn"
              type="button"
              onClick={onConfirmGroup}
              style={{ background: "var(--wm-success)", padding: "8px 16px" }}
            >
              Yes, Create Group
            </button>

            <button
              type="button"
              onClick={onCancelConfirmGroup}
              style={actionSmBtnStyle("var(--wm-er-text)")}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!isTerminal && (
        <div className="wm-er-card" style={{ marginTop: 10 }}>
          {!saveTemplateOpen ? (
            <button
              type="button"
              onClick={onOpenSaveTemplate}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                color: AMBER,
              }}
            >
              Save as Template
            </button>
          ) : (
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "var(--wm-er-text)",
                  marginBottom: 6,
                }}
              >
                Template Name
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  className="wm-input"
                  placeholder="e.g. Weekend Setup"
                  value={templateName}
                  onChange={(event) => onTemplateNameChange(event.target.value)}
                  style={{ flex: 1, fontSize: 13 }}
                  maxLength={60}
                  autoFocus
                />

                <button
                  className="wm-primarybtn"
                  type="button"
                  onClick={onSaveTemplate}
                  disabled={!templateName.trim()}
                  style={{ background: AMBER, fontSize: 12, padding: "6px 14px" }}
                >
                  Save
                </button>

                <button
                  type="button"
                  onClick={onCancelSaveTemplate}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    color: "var(--wm-er-muted)",
                    fontWeight: 700,
                  }}
                >
                  Cancel
                </button>
              </div>

              {templateError && (
                <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-error)" }}>
                  {templateError}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {actionError && (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            borderRadius: 8,
            background: "rgba(220,38,38,0.06)",
          }}
        >
          <div style={{ fontSize: 12, color: "var(--wm-error)" }}>{actionError}</div>
        </div>
      )}
    </>
  );
}
