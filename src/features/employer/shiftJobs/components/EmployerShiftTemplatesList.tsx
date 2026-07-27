// App name: Job Mitra | EmployerShiftTemplatesList.tsx — glass cards (Wave 3)

import type { ShiftTemplate } from "../storage/shiftTemplatesStorage";

type Props = {
  templates: ShiftTemplate[];
  renameId: string | null;
  renameValue: string;
  deleteId: string | null;
  onRenameValue: (value: string) => void;
  onRenameSave: () => void;
  onRenameCancel: () => void;
  onRenameOpen: (template: ShiftTemplate) => void;
  onDeleteRequest: (id: string) => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  onUse: (template: ShiftTemplate) => void;
};

export function EmployerShiftTemplatesList({
  templates,
  renameId,
  renameValue,
  deleteId,
  onRenameValue,
  onRenameSave,
  onRenameCancel,
  onRenameOpen,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
  onUse,
}: Props) {
  return (
    <div
      style={{ display: "grid", gap: "var(--wm-stack-gap)" }}
      data-testid="employer-shift-templates-list"
    >
      {templates.map((template) => (
        <article
          key={template.id}
          className="wm-shift-surface-glass wm-shift-surface-glass--shift wm-shift-surface-glass--compact"
          data-testid={`shift-template-card-${template.id}`}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            {renameId === template.id ? (
              <div style={{ display: "flex", gap: 8, flex: 1, flexWrap: "wrap" }}>
                <input
                  className="wm-input"
                  value={renameValue}
                  onChange={(event) => onRenameValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") onRenameSave();
                    if (event.key === "Escape") onRenameCancel();
                  }}
                  placeholder="Template name"
                  maxLength={60}
                  style={{ flex: 1, fontSize: 13, minWidth: 140 }}
                  autoFocus
                />
                <button
                  type="button"
                  className="wm-primarybtn"
                  onClick={onRenameSave}
                  disabled={!renameValue.trim()}
                >
                  Save
                </button>
                <button type="button" className="wm-outlineBtn" onClick={onRenameCancel}>
                  Cancel
                </button>
              </div>
            ) : (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--wm-er-accent-shift, #16a34a)",
                  }}
                >
                  {template.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--wm-er-text)", marginTop: 2 }}>
                  {template.jobName} — {template.companyName}
                </div>
              </div>
            )}
          </div>

          <div className="wm-shift-seg-tab-row" style={{ marginTop: 8, gap: 6 }}>
            <span className="wm-shift-pill wm-shift-pill--outline" style={{ fontSize: 11 }}>
              {template.category}
            </span>
            <span className="wm-shift-pill wm-shift-pill--outline" style={{ fontSize: 11 }}>
              {template.vacancies} {template.vacancies === 1 ? "worker" : "workers"}
            </span>
            <span className="wm-shift-pill wm-shift-pill--outline" style={{ fontSize: 11 }}>
              Pay: {template.payPerDay}/day
            </span>
            {template.mustHave.length > 0 ? (
              <span className="wm-shift-pill wm-shift-pill--outline" style={{ fontSize: 11 }}>
                {template.mustHave.length} requirements
              </span>
            ) : null}
            {(template.quickQuestions?.length ?? 0) > 0 ? (
              <span className="wm-shift-pill wm-shift-pill--outline" style={{ fontSize: 11 }}>
                {template.quickQuestions!.length} questions
              </span>
            ) : null}
          </div>

          {deleteId === template.id ? (
            <div
              className="wm-shift-surface-glass wm-shift-surface-glass--inset"
              style={{
                marginTop: 10,
                border: "1px solid rgba(220,38,38,0.15)",
                background: "rgba(220,38,38,0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 12, color: "var(--wm-error, #dc2626)" }}>
                Delete this template?
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" className="wm-dangerBtn" onClick={onDeleteConfirm}>
                  Delete
                </button>
                <button type="button" className="wm-outlineBtn" onClick={onDeleteCancel}>
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          {deleteId !== template.id && renameId !== template.id ? (
            <div
              style={{
                marginTop: 12,
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className="wm-outlineBtn"
                style={{ color: "var(--wm-error, #dc2626)" }}
                onClick={() => onDeleteRequest(template.id)}
              >
                Delete
              </button>
              <button
                type="button"
                className="wm-outlineBtn"
                onClick={() => onRenameOpen(template)}
              >
                Rename
              </button>
              <button type="button" className="wm-primarybtn" onClick={() => onUse(template)}>
                Use Template
              </button>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
