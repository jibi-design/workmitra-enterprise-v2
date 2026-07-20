// App name: Job Mitra
// File name: ShiftDraftControlPanel.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\createShiftDrafts\ShiftDraftControlPanel.tsx

import type { EmployerShiftPostDraft } from "../../storage/employerShiftDraft.storage";
import { formatDraftTime } from "./shiftDraftUi.helpers";

type ShiftDraftControlPanelProps = {
  readonly draftId: string | null;
  readonly lastSavedAt: number | null;
  readonly otherDrafts: readonly EmployerShiftPostDraft[];
  readonly onSaveDraft: () => void;
  readonly onDeleteCurrentDraft: () => void;
  readonly onDeleteDraft: (draftId: string) => void;
  readonly onResumeDraft: (draft: EmployerShiftPostDraft) => void;
};

export function ShiftDraftControlPanel({
  draftId,
  lastSavedAt,
  otherDrafts,
  onSaveDraft,
  onDeleteCurrentDraft,
  onDeleteDraft,
  onResumeDraft,
}: ShiftDraftControlPanelProps) {
  const showTopSaveButton = Boolean(draftId) || otherDrafts.length === 0;
  const showTopDeleteButton = Boolean(draftId);

  return (
    <section
      className="wm-er-card"
      style={{
        marginTop: 12,
        padding: 14,
        borderRadius: 20,
        border: "1px solid rgba(245,158,11,0.2)",
        background:
          "linear-gradient(135deg, rgba(255,251,235,0.98), rgba(255,255,255,0.98) 58%, rgba(240,253,244,0.7))",
        boxShadow: "0 12px 28px rgba(15,23,42,0.045)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 950, color: "var(--wm-er-text)" }}>
            Draft saving
          </div>

          <div
            style={{
              marginTop: 5,
              fontSize: 12,
              fontWeight: 700,
              color: "var(--wm-er-muted)",
              lineHeight: 1.5,
            }}
          >
            Save this shift locally and continue later. Drafts are not visible to workers until you
            publish.
          </div>

          {draftId && (
            <div
              style={{
                marginTop: 8,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 9px",
                borderRadius: 999,
                background: "rgba(22,163,74,0.1)",
                color: "#15803d",
                fontSize: 11,
                fontWeight: 900,
              }}
            >
              Current draft {lastSavedAt ? `· saved ${formatDraftTime(lastSavedAt)}` : ""}
            </div>
          )}
        </div>

        {(showTopSaveButton || showTopDeleteButton) && (
          <div
            style={{
              display: "flex",
              gap: 8,
              flexShrink: 0,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            {showTopDeleteButton && (
              <button
                type="button"
                className="wm-outlineBtn"
                onClick={onDeleteCurrentDraft}
                style={{
                  fontSize: 12,
                  color: "#b91c1c",
                  borderColor: "rgba(185,28,28,0.22)",
                }}
              >
                Delete Draft
              </button>
            )}

            {showTopSaveButton && (
              <button
                type="button"
                className="wm-primarybtn"
                onClick={onSaveDraft}
                style={{ fontSize: 12, whiteSpace: "nowrap" }}
              >
                Save Draft
              </button>
            )}
          </div>
        )}
      </div>

      {otherDrafts.length > 0 && (
        <div style={{ marginTop: 13, display: "grid", gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 950, color: "var(--wm-er-text)" }}>
            Continue saved drafts
          </div>

          {otherDrafts.map((draft) => (
            <div
              key={draft.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                padding: "10px 11px",
                borderRadius: 16,
                background: "rgba(255,255,255,0.82)",
                border: "1px solid rgba(148,163,184,0.18)",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 950,
                    color: "var(--wm-er-text)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {draft.titlePreview}
                </div>

                <div
                  style={{
                    marginTop: 3,
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--wm-er-muted)",
                  }}
                >
                  Last saved {formatDraftTime(draft.updatedAt)}
                </div>
              </div>

              <div style={{ display: "flex", gap: 7, flexShrink: 0, alignItems: "center" }}>
                <button
                  type="button"
                  className="wm-outlineBtn"
                  onClick={() => onDeleteDraft(draft.id)}
                  style={{
                    fontSize: 12,
                    color: "#b91c1c",
                    borderColor: "rgba(185,28,28,0.22)",
                  }}
                >
                  Delete
                </button>

                <button
                  type="button"
                  className="wm-outlineBtn"
                  onClick={() => onResumeDraft(draft)}
                  style={{ fontSize: 12 }}
                >
                  Continue
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
