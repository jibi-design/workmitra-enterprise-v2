// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceHomeCategoriesSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceHomeCategoriesSection.tsx

import type { WorkforceCategory } from "../../../../shared/domains/workforce/types/workforceTypes";
import { IconCategory, IconPlus } from "../../../../shared/domains/workforce/ui/workforceIcons";
import {
  addChipBtnStyle,
  AMBER,
  categoryChipStyle,
  sectionIconWrapStyle,
  sectionTitleStyle,
} from "../../../../shared/domains/workforce/ui/workforceStyles";

export type EmployerWorkforceHomeDeleteTarget = {
  id: string;
  name: string;
  assignedCount: number;
};

type Props = {
  categories: WorkforceCategory[];
  showCatInput: boolean;
  catVal: string;
  catErr: string;
  deleteTarget: EmployerWorkforceHomeDeleteTarget | null;
  deleteErr: string;
  onStartDelete: (category: WorkforceCategory) => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onCatValueChange: (value: string) => void;
  onOpenCategoryInput: () => void;
  onAddCategory: () => void;
  onCancelCategoryInput: () => void;
};

export function EmployerWorkforceHomeCategoriesSection({
  categories,
  showCatInput,
  catVal,
  catErr,
  deleteTarget,
  deleteErr,
  onStartDelete,
  onConfirmDelete,
  onCancelDelete,
  onCatValueChange,
  onOpenCategoryInput,
  onAddCategory,
  onCancelCategoryInput,
}: Props) {
  return (
    <div className="wm-er-card" style={{ marginTop: 14 }}>
      <div style={sectionTitleStyle}>
        <div style={sectionIconWrapStyle}>
          <IconCategory />
        </div>
        Staff Categories
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {categories.map((category) => (
          <span
            key={category.id}
            style={{
              ...categoryChipStyle,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {category.name}

            <button
              type="button"
              onClick={() => onStartDelete(category)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: AMBER,
                padding: 0,
                fontSize: 13,
                fontWeight: 900,
                lineHeight: 1,
                marginLeft: 2,
                opacity: 0.6,
              }}
              title={`Delete ${category.name}`}
            >
              ×
            </button>
          </span>
        ))}

        {!showCatInput && (
          <button type="button" style={addChipBtnStyle} onClick={onOpenCategoryInput}>
            <IconPlus /> Add
          </button>
        )}
      </div>

      {showCatInput && (
        <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="text"
            className="wm-input"
            placeholder="Category name"
            value={catVal}
            onChange={(event) => onCatValueChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onAddCategory();
              if (event.key === "Escape") onCancelCategoryInput();
            }}
            style={{ flex: 1, fontSize: 13 }}
            autoFocus
            maxLength={40}
          />

          <button
            className="wm-primarybtn"
            type="button"
            onClick={onAddCategory}
            disabled={!catVal.trim()}
            style={{ background: AMBER, fontSize: 12, padding: "6px 14px" }}
          >
            Add
          </button>

          <button
            type="button"
            onClick={onCancelCategoryInput}
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
      )}

      {catErr && (
        <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-error)" }}>{catErr}</div>
      )}

      {deleteTarget && (
        <div
          style={{
            marginTop: 10,
            padding: 12,
            borderRadius: 10,
            border: "1px solid var(--wm-error)",
            background: "rgba(220,38,38,0.04)",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-error)" }}>
            Delete "{deleteTarget.name}"?
          </div>

          {deleteTarget.assignedCount > 0 ? (
            <div
              style={{ fontSize: 12, color: "var(--wm-er-text)", marginTop: 4, lineHeight: 1.5 }}
            >
              ⚠ {deleteTarget.assignedCount} staff member
              {deleteTarget.assignedCount !== 1 ? "s are" : " is"} assigned to this category. They
              will lose this category assignment.
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4 }}>
              No staff members are assigned to this category.
            </div>
          )}

          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button
              className="wm-primarybtn"
              type="button"
              onClick={onConfirmDelete}
              style={{ background: "var(--wm-error)", fontSize: 12, padding: "6px 14px" }}
            >
              Yes, Delete
            </button>

            <button
              type="button"
              onClick={onCancelDelete}
              style={{
                background: "none",
                border: "1px solid var(--wm-er-border)",
                borderRadius: "var(--wm-radius-10)",
                padding: "6px 14px",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--wm-er-text)",
              }}
            >
              Cancel
            </button>
          </div>

          {deleteErr && (
            <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-error)" }}>{deleteErr}</div>
          )}
        </div>
      )}
    </div>
  );
}
