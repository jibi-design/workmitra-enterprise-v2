// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceStaffFilters.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceStaffFilters.tsx

import type { WorkforceCategory } from "../../../../shared/domains/workforce/types/workforceTypes";
import { IconSearch } from "../../../../shared/domains/workforce/ui/workforceIcons";
import {
  AMBER,
  AMBER_BG,
  categoryChipStyle,
} from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  searchQuery: string;
  selectedCategoryId: string | null;
  categories: WorkforceCategory[];
  staffCount: number;
  categoryCounts: Map<string, number>;
  onSearchChange: (value: string) => void;
  onCategoryChange: (categoryId: string | null) => void;
};

export function EmployerWorkforceStaffFilters({
  searchQuery,
  selectedCategoryId,
  categories,
  staffCount,
  categoryCounts,
  onSearchChange,
  onCategoryChange,
}: Props) {
  return (
    <>
      <div style={{ marginTop: 14, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--wm-er-muted)",
            pointerEvents: "none",
          }}
        >
          <IconSearch />
        </div>

        <input
          type="text"
          className="wm-input"
          placeholder="Search by name, ID, city, or category..."
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          style={{ width: "100%", paddingLeft: 38, fontSize: 13 }}
        />
      </div>

      {categories.length > 0 && (
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
          <button
            type="button"
            onClick={() => onCategoryChange(null)}
            style={{
              ...categoryChipStyle,
              cursor: "pointer",
              background: selectedCategoryId === null ? AMBER : AMBER_BG,
              color: selectedCategoryId === null ? "#fff" : AMBER,
            }}
          >
            All ({staffCount})
          </button>

          {categories.map((category) => {
            const count = categoryCounts.get(category.id) ?? 0;
            const isActive = selectedCategoryId === category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategoryChange(isActive ? null : category.id)}
                style={{
                  ...categoryChipStyle,
                  cursor: "pointer",
                  background: isActive ? AMBER : AMBER_BG,
                  color: isActive ? "#fff" : AMBER,
                }}
              >
                {category.name} ({count})
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
