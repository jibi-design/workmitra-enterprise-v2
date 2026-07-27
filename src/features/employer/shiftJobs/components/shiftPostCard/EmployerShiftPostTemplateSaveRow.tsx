// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerShiftPostTemplateSaveRow.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\shiftPostCard\EmployerShiftPostTemplateSaveRow.tsx

import type { ShiftPost } from "../../storage/employerShift.storage";

type Props = {
  post: ShiftPost;
  isSaving: boolean;
  templateName: string;
  onTemplateNameChange: (value: string) => void;
  onStartSaveTemplate: (post: ShiftPost) => void;
  onCancelSaveTemplate: () => void;
  onSaveTemplate: (post: ShiftPost) => void;
};

export function EmployerShiftPostTemplateSaveRow({
  post,
  isSaving,
  templateName,
  onTemplateNameChange,
  onStartSaveTemplate,
  onCancelSaveTemplate,
  onSaveTemplate,
}: Props) {
  return (
    <div
      style={{
        borderTop: "1px solid var(--wm-er-border)",
        padding: "8px 14px",
        background: "var(--wm-er-surface)",
      }}
    >
      {!isSaving ? (
        <button
          type="button"
          onClick={() => onStartSaveTemplate(post)}
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--wm-er-muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          Save as Template
        </button>
      ) : (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            className="wm-input"
            value={templateName}
            onChange={(event) => onTemplateNameChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onSaveTemplate(post);
              if (event.key === "Escape") onCancelSaveTemplate();
            }}
            placeholder="Template name"
            maxLength={60}
            style={{ flex: 1, fontSize: 12, height: 34 }}
            autoFocus
          />

          <button
            type="button"
            onClick={() => onSaveTemplate(post)}
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: "0 12px",
              height: 34,
              borderRadius: "var(--wm-radius-8)",
              border: "none",
              background: "var(--wm-er-accent-shift, #16a34a)",
              color: "#fff",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Save
          </button>

          <button
            type="button"
            onClick={onCancelSaveTemplate}
            style={{
              fontSize: 12,
              padding: "0 10px",
              height: 34,
              borderRadius: "var(--wm-radius-8)",
              border: "1px solid var(--wm-er-border)",
              background: "none",
              color: "var(--wm-er-muted)",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
