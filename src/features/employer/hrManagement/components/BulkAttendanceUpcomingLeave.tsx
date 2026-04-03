// src/features/employer/hrManagement/components/BulkAttendanceUpcomingLeave.tsx
//
// Upcoming leave preview (Next 7 Days) for Bulk Attendance page.

import { useMemo } from "react";
import { attendanceLogStorage } from "../storage/attendanceLog.storage";
import { leaveManagementStorage } from "../storage/leaveManagement.storage";
import type { EmployeeRow } from "../helpers/bulkAttendanceHelpers";
import { formatShortDate } from "../helpers/bulkAttendanceHelpers";

type UpcomingLeave = {
  employeeName: string;
  date: string;
  leaveType: string;
};

function buildUpcomingLeaves(rows: EmployeeRow[]): UpcomingLeave[] {
  const today = new Date();
  const leaves: UpcomingLeave[] = [];

  for (let i = 1; i <= 7; i++) {
    const future = new Date(today);
    future.setDate(today.getDate() + i);
    const dateKey = attendanceLogStorage.toDateKey(future);

    for (const row of rows) {
      try {
                const allRequests = leaveManagementStorage.getByCandidate(row.record.id);
        for (const req of allRequests) {
          if (req.status !== "approved") continue;
          const reqStart = attendanceLogStorage.toDateKey(new Date(req.fromDate));
          const reqEnd = attendanceLogStorage.toDateKey(new Date(req.toDate));
          if (dateKey >= reqStart && dateKey <= reqEnd) {
            leaves.push({
              employeeName: row.record.employeeName,
              date: dateKey,
              leaveType: req.leaveType.charAt(0).toUpperCase() + req.leaveType.slice(1) + " Leave",
            });
          }
        }
      } catch {
        // Skip gracefully if method not available
      }
    }
  }

  return leaves;
}

type Props = {
  rows: EmployeeRow[];
};

export function BulkAttendanceUpcomingLeave({ rows }: Props) {
  const upcomingLeaves = useMemo(() => buildUpcomingLeaves(rows), [rows]);

  return (
    <div style={{
      padding: 14, background: "#fff", borderRadius: 10,
      border: "1px solid var(--wm-er-border, #e5e7eb)",
    }}>
      <div style={{ fontWeight: 900, fontSize: 13, color: "var(--wm-er-text)", marginBottom: 8 }}>
        Upcoming Leave (Next 7 Days)
      </div>
      {upcomingLeaves.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {upcomingLeaves.map((leave, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 10px", background: "#fffbeb", borderRadius: 6,
              border: "1px solid #fcd34d",
            }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 13, color: "var(--wm-er-text)" }}>{leave.employeeName}</span>
                <span style={{ fontSize: 12, color: "#d97706", marginLeft: 6 }}>({leave.leaveType})</span>
              </div>
              <span style={{ fontSize: 12, color: "var(--wm-er-muted)", fontWeight: 600 }}>
                {formatShortDate(leave.date)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", padding: "8px 0" }}>
          No upcoming leave in next 7 days.
        </div>
      )}
    </div>
  );
}