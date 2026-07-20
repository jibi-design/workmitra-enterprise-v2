// App: Job Mitra / WorkMitra_Enterprise_v2
// File: BulkNoticeSpecificEmployeesSelector.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\bulkNotifications\BulkNoticeSpecificEmployeesSelector.tsx

import { NOTIF_INPUT_STYLE, NOTIF_LABEL_STYLE } from "../../helpers/bulkNotificationsHelpers";
import type { HRCandidateRecord } from "../../types/hrManagement.types";

type Props = {
  selectedIds: Set<string>;
  empSearch: string;
  employees: HRCandidateRecord[];
  filteredEmployees: HRCandidateRecord[];
  onEmpSearchChange: (value: string) => void;
  onToggleEmployee: (id: string) => void;
};

export function BulkNoticeSpecificEmployeesSelector({
  selectedIds,
  empSearch,
  employees,
  filteredEmployees,
  onEmpSearchChange,
  onToggleEmployee,
}: Props) {
  return (
    <div style={{ marginTop: 12 }}>
      <label style={NOTIF_LABEL_STYLE}>
        Select Employees *{" "}
        {selectedIds.size > 0 && (
          <span style={{ fontWeight: 600, color: "var(--wm-er-accent-console)" }}>
            ({selectedIds.size} selected)
          </span>
        )}
      </label>

      <input
        type="text"
        value={empSearch}
        onChange={(event) => onEmpSearchChange(event.target.value)}
        placeholder="Search by name, role, department..."
        style={{ ...NOTIF_INPUT_STYLE, marginBottom: 8 }}
      />

      <div
        style={{
          maxHeight: 240,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {filteredEmployees.map((record) => {
          const isSelected = selectedIds.has(record.id);

          return (
            <button
              key={record.id}
              type="button"
              onClick={() => onToggleEmployee(record.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                textAlign: "left",
                width: "100%",
                border: isSelected
                  ? "2px solid var(--wm-er-accent-console, #0369a1)"
                  : "1px solid var(--wm-er-border, #e5e7eb)",
                borderRadius: 8,
                background: isSelected ? "rgba(3, 105, 161,0.04)" : "#fff",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  border: `2px solid ${
                    isSelected
                      ? "var(--wm-er-accent-console, #0369a1)"
                      : "var(--wm-er-border, #e5e7eb)"
                  }`,
                  background: isSelected ? "var(--wm-er-accent-console, #0369a1)" : "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {isSelected && (
                  <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#fff"
                      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                    />
                  </svg>
                )}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: "var(--wm-er-text)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {record.employeeName}
                </div>

                <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 1 }}>
                  {record.jobTitle}
                  {record.department && ` · ${record.department}`}
                </div>
              </div>
            </button>
          );
        })}

        {filteredEmployees.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "16px 0",
              color: "var(--wm-er-muted)",
              fontSize: 12,
            }}
          >
            {employees.length === 0 ? "No active employees." : "No employees match your search."}
          </div>
        )}
      </div>
    </div>
  );
}
