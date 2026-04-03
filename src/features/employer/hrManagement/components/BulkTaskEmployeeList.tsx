// src/features/employer/hrManagement/components/BulkTaskEmployeeList.tsx

import type { CSSProperties } from "react";
import type { HRCandidateRecord } from "../types/hrManagement.types";

/* ------------------------------------------------ */
/* Styles                                           */
/* ------------------------------------------------ */
const INPUT: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 13,
  border: "1px solid var(--wm-er-border, #e5e7eb)",
  borderRadius: 8,
  outline: "none",
  background: "#fff",
  color: "var(--wm-er-text)",
  boxSizing: "border-box" as const,
};

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type BulkTaskEmployeeListProps = {
  employees: HRCandidateRecord[];
  filteredEmployees: HRCandidateRecord[];
  selectedIds: Set<string>;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  allSelected: boolean;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function BulkTaskEmployeeList({
  employees,
  filteredEmployees,
  selectedIds,
  searchQuery,
  onSearchChange,
  onToggle,
  onSelectAll,
  onDeselectAll,
  allSelected,
}: BulkTaskEmployeeListProps) {
  return (
    <div style={{
      marginTop: 10, padding: 16, background: "#fff", borderRadius: 12,
      border: "1px solid var(--wm-er-border, #e5e7eb)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 12,
      }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)" }}>
            Select Employees *
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
            {selectedIds.size > 0
              ? `${selectedIds.size} employee${selectedIds.size > 1 ? "s" : ""} selected`
              : "Tap to select employees for this task"
            }
          </div>
        </div>
        <button type="button" onClick={allSelected ? onDeselectAll : onSelectAll}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 12, fontWeight: 800, color: "var(--wm-er-accent-console)", padding: 0,
          }}>
          {allSelected ? "Deselect All" : "Select All"}
        </button>
      </div>

      <input type="text" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by name, role, department..."
        style={{ ...INPUT, marginBottom: 10 }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {filteredEmployees.map((record) => {
          const isSelected = selectedIds.has(record.id);
          return (
            <button key={record.id} type="button" onClick={() => onToggle(record.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px",
                border: isSelected ? "2px solid var(--wm-er-accent-console, #0369a1)" : "1px solid var(--wm-er-border, #e5e7eb)",
                borderRadius: 8,
                background: isSelected ? "rgba(3, 105, 161, 0.04)" : "#fff",
                cursor: "pointer", textAlign: "left", width: "100%",
              }}>
              <span style={{
                width: 20, height: 20, borderRadius: 4,
                border: `2px solid ${isSelected ? "var(--wm-er-accent-console, #0369a1)" : "var(--wm-er-border, #e5e7eb)"}`,
                background: isSelected ? "var(--wm-er-accent-console, #0369a1)" : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {isSelected && (
                  <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#fff" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                )}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 800, fontSize: 13, color: "var(--wm-er-text)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {record.employeeName}
                </div>
                <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 1 }}>
                  {record.jobTitle}{record.department && ` · ${record.department}`}
                </div>
              </div>
            </button>
          );
        })}

        {filteredEmployees.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px 0", color: "var(--wm-er-muted)", fontSize: 13 }}>
            {employees.length === 0 ? "No active employees found." : "No employees match your search."}
          </div>
        )}
      </div>
    </div>
  );
}
