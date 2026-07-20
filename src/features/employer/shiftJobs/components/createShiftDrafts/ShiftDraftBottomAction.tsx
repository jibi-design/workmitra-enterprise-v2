// App name: Job Mitra
// File name: ShiftDraftBottomAction.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\createShiftDrafts\ShiftDraftBottomAction.tsx

import { formatDraftTime } from "./shiftDraftUi.helpers";

type ShiftDraftBottomActionProps = {
  readonly draftId: string | null;
  readonly lastSavedAt: number | null;
  readonly onSaveDraft: () => void;
  readonly onDeleteCurrentDraft: () => void;
};

export function ShiftDraftBottomAction({
  draftId,
  lastSavedAt,
  onSaveDraft,
  onDeleteCurrentDraft,
}: ShiftDraftBottomActionProps) {
  return (
    <section
      className="wm-er-card"
      style={{
        marginTop: 12,
        padding: 14,
        borderRadius: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        background: "rgba(255,255,255,0.96)",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 950, color: "var(--wm-er-text)" }}>
          Not ready to publish?
        </div>

        <div
          style={{
            marginTop: 4,
            fontSize: 11,
            fontWeight: 700,
            color: "var(--wm-er-muted)",
            lineHeight: 1.45,
          }}
        >
          Save as local draft and finish this shift later.
          {draftId && lastSavedAt ? ` Last saved ${formatDraftTime(lastSavedAt)}.` : ""}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexShrink: 0,
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        {draftId && (
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
            Delete
          </button>
        )}

        <button
          type="button"
          className="wm-outlineBtn"
          onClick={onSaveDraft}
          style={{ fontSize: 12 }}
        >
          Save Draft
        </button>
      </div>
    </section>
  );
}
