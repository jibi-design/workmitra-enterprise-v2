// src/features/employer/hrManagement/components/BulkAttendanceEmployeeRow.tsx
//
// Single employee row for Bulk Attendance — status buttons + time display.

import { attendanceLogStorage } from "../storage/attendanceLog.storage";
import type { AttendanceDayStatus } from "../types/attendanceLog.types";
import type { EmployeeRow } from "../helpers/bulkAttendanceHelpers";

const STATUS_OPTIONS: { value: AttendanceDayStatus; label: string; color: string; bg: string }[] = [
  { value: "present", label: "Present", color: "#15803d", bg: "#dcfce7" },
  { value: "absent",  label: "Absent",  color: "#dc2626", bg: "#fee2e2" },
  { value: "leave",   label: "Leave",   color: "#d97706", bg: "#fef3c7" },
  { value: "off",     label: "Off",     color: "#6b7280", bg: "#f3f4f6" },
];

type Props = {
  row: EmployeeRow;
  onMark: (status: AttendanceDayStatus) => void;
};

export function BulkAttendanceEmployeeRow({ row, onMark }: Props) {
  return (
    <div style={{
      padding: "10px 12px", background: "#fff", borderRadius: 8,
      border: `1px solid ${!row.currentStatus && !row.isAutoOff ? "#fca5a5" : "var(--wm-er-border, #e5e7eb)"}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 800, fontSize: 13, color: "var(--wm-er-text)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {row.record.employeeName}
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 1 }}>
            {row.record.jobTitle}
            {row.record.location && ` · ${row.record.location}`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          {STATUS_OPTIONS.map((opt) => {
            const isActive = row.currentStatus === opt.value;
            return (
              <button key={opt.value} type="button" onClick={() => onMark(opt.value)} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                padding: "8px 6px",
                border: isActive ? `2px solid ${opt.color}` : "1px solid var(--wm-er-border, #e5e7eb)",
                borderRadius: 8, background: isActive ? opt.bg : "#fff",
                cursor: "pointer", minWidth: 48,
              }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: opt.color, display: "block" }} />
                <span style={{ fontSize: 9, fontWeight: 800, color: opt.color, letterSpacing: 0.2 }}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      {row.currentStatus === "present" && (row.signInTime || row.signOutTime) && (
        <div style={{ marginTop: 5, fontSize: 11, color: "var(--wm-er-muted)", display: "flex", gap: 10 }}>
          {row.signInTime && <span>In: <strong style={{ color: "var(--wm-er-text)" }}>{row.signInTime}</strong></span>}
          {row.signOutTime && <span>Out: <strong style={{ color: "var(--wm-er-text)" }}>{row.signOutTime}</strong></span>}
          {row.signInTime && row.signOutTime && (() => {
            const hrs = attendanceLogStorage.calculateHours(row.signInTime, row.signOutTime);
            return hrs ? <span>Total: <strong style={{ color: "#15803d" }}>{hrs}h</strong></span> : null;
          })()}
        </div>
      )}
    </div>
  );
}