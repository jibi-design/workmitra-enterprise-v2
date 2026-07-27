// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceStaffDetailCategories.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceStaffDetailCategories.tsx

import type {
  WorkforceCategory,
  WorkforceStaff,
} from "../../../../shared/domains/workforce/types/workforceTypes";
import {
  IconCategory,
  IconEdit,
  IconPlus,
} from "../../../../shared/domains/workforce/ui/workforceIcons";
import {
  AMBER,
  AMBER_BG,
  categoryChipStyle,
  sectionIconWrapStyle,
  sectionTitleStyle,
} from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  staff: WorkforceStaff;
  categories: WorkforceCategory[];
  categoryMap: Map<string, string>;
  editingCats: boolean;
  selectedCats: string[];
  onEditOrSave: () => void;
  onToggleCategory: (categoryId: string) => void;
};

const inlineEditBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: AMBER,
  padding: 4,
  borderRadius: "var(--wm-radius-8)",
  display: "inline-flex",
  alignItems: "center",
};

export function EmployerWorkforceStaffDetailCategories({
  staff,
  categories,
  categoryMap,
  editingCats,
  selectedCats,
  onEditOrSave,
  onToggleCategory,
}: Props) {
  return (
    <div className="wm-er-card" style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={sectionTitleStyle}>
          <div style={sectionIconWrapStyle}>
            <IconCategory />
          </div>
          Categories
        </div>

        <button
          type="button"
          onClick={onEditOrSave}
          style={{ ...inlineEditBtnStyle, fontSize: 12, fontWeight: 700 }}
        >
          {editingCats ? "Save" : <IconEdit />}
        </button>
      </div>

      {!editingCats ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
          {staff.categories.map((catId) => (
            <span key={catId} style={categoryChipStyle}>
              {categoryMap.get(catId) ?? catId}
            </span>
          ))}

          {staff.categories.length === 0 && (
            <span style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>
              No categories assigned
            </span>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
          {categories.map((cat) => {
            const isSelected = selectedCats.includes(cat.id);

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onToggleCategory(cat.id)}
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

          {selectedCats.length === 0 && (
            <div style={{ fontSize: 11, color: "var(--wm-error)", marginTop: 4 }}>
              At least one category is required.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
