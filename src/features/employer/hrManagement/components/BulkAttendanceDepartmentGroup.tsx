// src/features/employer/hrManagement/components/BulkAttendanceDepartmentGroup.tsx
//
// Collapsible department group for Bulk Attendance.
// Shows group header with name + staff count + subtotal, expandable employee rows.

import type { AttendanceDayStatus } from "../types/attendanceLog.types";
import type { DeptGroup } from "../helpers/bulkAttendanceHelpers";
import { BulkAttendanceEmployeeRow } from "./BulkAttendanceEmployeeRow";

// ─────────────────────────────────────────────────────────────────────────────
// Subtotal
// ─────────────────────────────────────────────────────────────────────────────

function GroupSubtotal({ rows }: { rows: DeptGroup["rows"] }) {
  const p = rows.filter((r) => r.currentStatus === "present").length;
  const a = rows.filter((r) => r.currentStatus === "absent").length;
  const l = rows.filter((r) => r.currentStatus === "leave").length;
  const o = rows.filter((r) => r.currentStatus === "off").length;
  const u = rows.filter((r) => r.currentStatus === null).length;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 11 }}>
      {p > 0 && <span style={{ color: "#15803d", fontWeight: 700 }}>Present: {p}</span>}
      {a > 0 && <span style={{ color: "#dc2626", fontWeight: 700 }}>Absent: {a}</span>}
      {l > 0 && <span style={{ color: "#d97706", fontWeight: 700 }}>Leave: {l}</span>}
      {o > 0 && <span style={{ color: "#6b7280", fontWeight: 700 }}>Off: {o}</span>}
      {u > 0 && <span style={{ color: "#dc2626", fontWeight: 700 }}>Unmarked: {u}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  group: DeptGroup;
  isCollapsed: boolean;
  onToggle: () => void;
  onMark: (hrCandidateId: string, status: AttendanceDayStatus) => void;
};

export function BulkAttendanceDepartmentGroup({ group, isCollapsed, onToggle, onMark }: Props) {
  return (
    <div style={{ borderRadius: 10, border: "1px solid var(--wm-er-border, #e5e7eb)", overflow: "hidden" }}>
      {/* Group Header */}
      <button type="button" onClick={onToggle} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px", background: "#f8fafc", border: "none",
        borderBottom: isCollapsed ? "none" : "1px solid var(--wm-er-border, #e5e7eb)",
        cursor: "pointer", textAlign: "left",
      }}>
        <div>
          <span style={{ fontWeight: 900, fontSize: 13, color: "var(--wm-er-text)" }}>{group.name}</span>
          <span style={{ marginLeft: 6, fontSize: 11, color: "var(--wm-er-muted)", fontWeight: 600 }}>
            ({group.rows.length} staff)
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <GroupSubtotal rows={group.rows} />
          <span style={{ fontSize: 14, color: "var(--wm-er-muted)" }}>{isCollapsed ? "▸" : "▾"}</span>
        </div>
      </button>

      {/* Employee Rows */}
      {!isCollapsed && (
        <div style={{ padding: "6px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
          {group.rows.map((row) => (
            <BulkAttendanceEmployeeRow
              key={row.record.id}
              row={row}
              onMark={(status) => onMark(row.record.id, status)}
            />
          ))}
        </div>
      )}
    </div>
  );
}