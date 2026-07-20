// App: Job Mitra / WorkMitra_Enterprise_v2
// File: WorkforceAddStaffCategorySection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\WorkforceAddStaffCategorySection.tsx

import type { WorkforceCategory } from "../../../../shared/domains/workforce/types/workforceTypes";
import { IconPlus } from "../../../../shared/domains/workforce/ui/workforceIcons";
import {
  AMBER,
  AMBER_BG,
  categoryChipStyle,
} from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  catList: WorkforceCategory[];
  selectedCats: string[];
  looked: boolean;
  showNewCat: boolean;
  newCatVal: string;
  newCatErr: string;
  onToggleCat: (catId: string) => void;
  onShowNewCat: () => void;
  onNewCatValueChange: (value: string) => void;
  onAddNewCategory: () => void;
  onCancelNewCategory: () => void;
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "var(--wm-er-text)",
  marginBottom: 4,
};

export function WorkforceAddStaffCategorySection({
  catList,
  selectedCats,
  looked,
  showNewCat,
  newCatVal,
  newCatErr,
  onToggleCat,
  onShowNewCat,
  onNewCatValueChange,
  onAddNewCategory,
  onCancelNewCategory,
}: Props) {
  return (
    <div>
      <div style={labelStyle}>
        Assign Categories <span style={{ color: "var(--wm-error)" }}>*</span>
      </div>

      {catList.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {catList.map((cat) => {
            const isSelected = selectedCats.includes(cat.id);

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onToggleCat(cat.id)}
                style={{
                  ...categoryChipStyle,
                  cursor: "pointer",
                  background: isSelected ? AMBER : AMBER_BG,
                  color: isSelected ? "#fff" : AMBER,
                }}
              >
                {isSelected ? (
                  "✓ "
                ) : (
                  <>
                    <IconPlus />{" "}
                  </>
                )}
                {cat.name}
              </button>
            );
          })}

          {!showNewCat && (
            <button
              type="button"
              onClick={onShowNewCat}
              style={{
                ...categoryChipStyle,
                cursor: "pointer",
                background: "var(--wm-er-bg)",
                color: AMBER,
                border: `1px dashed ${AMBER}`,
              }}
            >
              <IconPlus /> New
            </button>
          )}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>
          No categories yet.
          {!showNewCat && (
            <button
              type="button"
              onClick={onShowNewCat}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: AMBER,
                fontWeight: 700,
                fontSize: 12,
                marginLeft: 4,
              }}
            >
              + Add Category
            </button>
          )}
        </div>
      )}

      {showNewCat && (
        <div style={{ marginTop: 8, display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="text"
            className="wm-input"
            placeholder="Category name"
            value={newCatVal}
            onChange={(event) => onNewCatValueChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onAddNewCategory();
              if (event.key === "Escape") onCancelNewCategory();
            }}
            style={{ flex: 1, fontSize: 12 }}
            autoFocus
            maxLength={40}
          />

          <button
            className="wm-primarybtn"
            type="button"
            onClick={onAddNewCategory}
            disabled={!newCatVal.trim()}
            style={{ background: AMBER, fontSize: 11, padding: "5px 10px" }}
          >
            Add
          </button>

          <button
            type="button"
            onClick={onCancelNewCategory}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 11,
              color: "var(--wm-er-muted)",
              fontWeight: 700,
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {newCatErr && (
        <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-error)" }}>{newCatErr}</div>
      )}

      {selectedCats.length === 0 && looked && (
        <div style={{ fontSize: 11, color: "var(--wm-error)", marginTop: 4 }}>
          At least one category must be selected.
        </div>
      )}
    </div>
  );
}
