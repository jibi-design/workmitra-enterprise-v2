// src/features/employer/workforceOps/components/WorkforceCategoryChips.tsx
//
// Reusable category chip selector for Workforce Ops Hub.
// Two modes: display (read-only chips) and select (toggle chips with counts).

import { useMemo } from "react";
import { workforceCategoryService } from "../services/workforceCategoryService";
import type { WorkforceCategory } from "../types/workforceTypes";
import { IconPlus } from "./workforceIcons";
import { AMBER, AMBER_BG, categoryChipStyle } from "./workforceStyles";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Display Mode — Read-only chips for showing assigned categories             */
/* ─────────────────────────────────────────────────────────────────────────── */

type DisplayProps = {
  categoryIds: string[];
  size?: "sm" | "md";
};

export function WorkforceCategoryDisplay({ categoryIds, size = "md" }: DisplayProps) {
  const categories = useMemo(() => workforceCategoryService.getAll(), []);
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.id, c.name);
    return map;
  }, [categories]);

  if (categoryIds.length === 0) {
    return <span style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>No categories</span>;
  }

  const chipSize = size === "sm"
    ? { padding: "2px 8px", fontSize: 10 }
    : { padding: "4px 10px", fontSize: 11 };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: size === "sm" ? 4 : 6 }}>
      {categoryIds.map((catId) => (
        <span
          key={catId}
          style={{
            ...chipSize,
            borderRadius: 999,
            background: AMBER_BG,
            color: AMBER,
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          {categoryMap.get(catId) ?? catId}
        </span>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Select Mode — Toggle chips for selecting categories                        */
/* ─────────────────────────────────────────────────────────────────────────── */

type SelectProps = {
  selected: string[];
  onChange: (selected: string[]) => void;
  staffCounts?: Map<string, number>;
  showAll?: boolean;
  allLabel?: string;
  allCount?: number;
};

export function WorkforceCategorySelect({
  selected,
  onChange,
  staffCounts,
  showAll = false,
  allLabel = "All",
  allCount,
}: SelectProps) {
  const categories = useMemo(() => workforceCategoryService.getAll(), []);

  const isAllSelected = selected.length === 0;

  function handleToggle(catId: string) {
    if (selected.includes(catId)) {
      onChange(selected.filter((id) => id !== catId));
    } else {
      onChange([...selected, catId]);
    }
  }

  function handleSelectAll() {
    onChange([]);
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {showAll && (
        <button
          type="button"
          onClick={handleSelectAll}
          style={{
            ...categoryChipStyle,
            cursor: "pointer",
            background: isAllSelected ? AMBER : AMBER_BG,
            color: isAllSelected ? "#fff" : AMBER,
          }}
        >
          {allLabel}{allCount !== undefined ? ` (${allCount})` : ""}
        </button>
      )}

      {categories.map((cat: WorkforceCategory) => {
        const isActive = selected.includes(cat.id);
        const count = staffCounts?.get(cat.id);

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleToggle(cat.id)}
            style={{
              ...categoryChipStyle,
              cursor: "pointer",
              background: isActive ? AMBER : AMBER_BG,
              color: isActive ? "#fff" : AMBER,
            }}
          >
            {isActive ? "✓ " : <><IconPlus /> </>}
            {cat.name}
            {count !== undefined ? ` (${count})` : ""}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Filter Mode — Single-select filter (for staff list, announcement list)     */
/* ─────────────────────────────────────────────────────────────────────────── */

type FilterProps = {
  selectedId: string | null;
  onSelect: (categoryId: string | null) => void;
  staffCounts?: Map<string, number>;
  totalCount?: number;
};

export function WorkforceCategoryFilter({
  selectedId,
  onSelect,
  staffCounts,
  totalCount,
}: FilterProps) {
  const categories = useMemo(() => workforceCategoryService.getAll(), []);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      <button
        type="button"
        onClick={() => onSelect(null)}
        style={{
          ...categoryChipStyle,
          cursor: "pointer",
          background: selectedId === null ? AMBER : AMBER_BG,
          color: selectedId === null ? "#fff" : AMBER,
        }}
      >
        All{totalCount !== undefined ? ` (${totalCount})` : ""}
      </button>

      {categories.map((cat: WorkforceCategory) => {
        const isActive = selectedId === cat.id;
        const count = staffCounts?.get(cat.id);

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(isActive ? null : cat.id)}
            style={{
              ...categoryChipStyle,
              cursor: "pointer",
              background: isActive ? AMBER : AMBER_BG,
              color: isActive ? "#fff" : AMBER,
            }}
          >
            {cat.name}{count !== undefined ? ` (${count})` : ""}
          </button>
        );
      })}
    </div>
  );
}