
// src/features/employer/hrManagement/components/RosterEmployeeSelector.tsx

import type { CSSProperties } from "react";
import type { HRCandidateRecord } from "../types/hrManagement.types";

/* ------------------------------------------------ */
/* Styles                                           */
/* ------------------------------------------------ */
const INPUT: CSSProperties = {
  width: "100%", padding: "10px 12px", fontSize: 13,
  border: "1px solid var(--wm-er-border, #e5e7eb)",
  borderRadius: 8, outline: "none", background: "#fff",
  color: "var(--wm-er-text)", boxSizing: "border-box" as const,
};

const LABEL: CSSProperties = {
  fontSize: 12, fontWeight: 800, color: "var(--wm-er-text)",
  display: "block", marginBottom: 4,
};

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type RosterEmployeeSelectorProps = {
  employees: HRCandidateRecord[];
  filteredEmployees: HRCandidateRecord[];
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedIds: Set<string>;
  conflictIds: Set<string>;
  search: string;
  onSearchChange: (val: string) => void;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  allFilteredSelected: boolean;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function RosterEmployeeSelector({
  employees,
  filteredEmployees,
  categories,
  selectedCategory,
  onCategoryChange,
  selectedIds,
  conflictIds,
  search,
  onSearchChange,
  onToggle,
  onSelectAll,
  onDeselectAll,
  allFilteredSelected,
}: RosterEmployeeSelectorProps) {
  return (
    <>
      {/* Category Filter */}
      <div style={{ marginBottom: 12 }}>
        <label style={LABEL}>Filter by Category</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const label = cat === "all" ? "All Staff" : cat;
            const count = cat === "all"
              ? employees.length
              : employees.filter((e) => (e.department?.trim() ?? "") === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                style={{
                  padding: "5px 10px", fontSize: 11,
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? "#fff" : "var(--wm-er-muted)",
                  background: isActive ? "#b45309" : "#f3f4f6",
                  border: "none", borderRadius: 6, cursor: "pointer",
                }}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Employee Selection */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <label style={{ ...LABEL, marginBottom: 0 }}>
            Select Employees *
            {selectedIds.size > 0 && (
              <span style={{ fontWeight: 600, color: "var(--wm-er-muted)", marginLeft: 6 }}>
                ({selectedIds.size} selected)
              </span>
            )}
          </label>
          <button
            type="button"
            onClick={allFilteredSelected ? onDeselectAll : onSelectAll}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 11, fontWeight: 800, color: "#0369a1", padding: 0,
            }}
          >
            {allFilteredSelected ? "Deselect All" : "Select All"}
          </button>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or role..."
          style={{ ...INPUT, marginBottom: 6 }}
        />

        <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
          {filteredEmployees.map((emp) => {
            const isSelected = selectedIds.has(emp.id);
            const hasConflict = conflictIds.has(emp.id);
            return (
              <button
                key={emp.id}
                type="button"
                onClick={() => onToggle(emp.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 10px", borderRadius: 6, textAlign: "left", width: "100%",
                  border: isSelected
                    ? `2px solid ${hasConflict ? "#d97706" : "#0369a1"}`
                    : "1px solid var(--wm-er-border, #e5e7eb)",
                  background: isSelected
                    ? hasConflict ? "rgba(217, 119, 6, 0.04)" : "rgba(3, 105, 161, 0.04)"
                    : "#fff",
                  cursor: "pointer",
                }}
              >
                <span style={{
                  width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                  border: `2px solid ${isSelected ? (hasConflict ? "#d97706" : "#0369a1") : "var(--wm-er-border, #e5e7eb)"}`,
                  background: isSelected ? (hasConflict ? "#d97706" : "#0369a1") : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isSelected && (
                    <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#fff" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  )}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "var(--wm-er-text)" }}>
                    {emp.employeeName}
                    {hasConflict && <span style={{ fontSize: 10, color: "#d97706", marginLeft: 4 }}>⚠️ already assigned</span>}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--wm-er-muted)" }}>
                    {emp.jobTitle}{emp.department && ` · ${emp.department}`}
                  </div>
                </div>
              </button>
            );
          })}
          {filteredEmployees.length === 0 && (
            <div style={{ padding: "14px 0", textAlign: "center", fontSize: 12, color: "var(--wm-er-muted)" }}>
              No employees in this category.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
