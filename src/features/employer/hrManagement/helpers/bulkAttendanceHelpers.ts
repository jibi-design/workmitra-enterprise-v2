// src/features/employer/hrManagement/helpers/bulkAttendanceHelpers.ts
//
// Helper functions for Bulk Attendance page.
// Grouping, filtering, summary calculations, date utilities.

import { hrManagementStorage } from "../storage/hrManagement.storage";
import { attendanceLogStorage } from "../storage/attendanceLog.storage";
import { companyConfigStorage } from "../../company/storage/companyConfig.storage";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import type { AttendanceDayStatus } from "../types/attendanceLog.types";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type EmployeeRow = {
  record: HRCandidateRecord;
  currentStatus: AttendanceDayStatus | null;
  signInTime: string;
  signOutTime: string;
  isAutoOff: boolean;
};

export type DeptGroup = {
  name: string;
  rows: EmployeeRow[];
};

export type AttendanceSummary = {
  total: number;
  present: number;
  absent: number;
  leave: number;
  off: number;
  notMarked: number;
};

export type FilterTab = "all" | AttendanceDayStatus | "not_marked";

// ─────────────────────────────────────────────────────────────────────────────
// Data Builder
// ─────────────────────────────────────────────────────────────────────────────

export function buildRows(dateKey: string): EmployeeRow[] {
  const activeEmployees = hrManagementStorage.getAll().filter((r) => r.status === "active");
  return activeEmployees.map((record) => {
    const entry = attendanceLogStorage.getDayEntry(record.id, dateKey);
    const isAutoOff = companyConfigStorage.isOffDay(dateKey);
    return {
      record,
      currentStatus: entry?.status ?? (isAutoOff ? "off" : null),
      signInTime: entry?.signInTime ?? "",
      signOutTime: entry?.signOutTime ?? "",
      isAutoOff,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Grouping
// ─────────────────────────────────────────────────────────────────────────────

export function groupByDepartment(rows: EmployeeRow[]): DeptGroup[] {
  const map = new Map<string, EmployeeRow[]>();

  for (const row of rows) {
    const dept = row.record.department?.trim() || "";
    const key = dept || "__unassigned__";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(row);
  }

  const groups: DeptGroup[] = [];
  const unassigned = map.get("__unassigned__");
  map.delete("__unassigned__");

  const sorted = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  for (const [name, groupRows] of sorted) {
    groups.push({ name, rows: groupRows });
  }

  if (unassigned && unassigned.length > 0) {
    groups.push({ name: "Unassigned", rows: unassigned });
  }

  return groups;
}

// ─────────────────────────────────────────────────────────────────────────────
// Filtering
// ─────────────────────────────────────────────────────────────────────────────

export function filterRows(rows: EmployeeRow[], searchQuery: string, activeFilter: FilterTab): EmployeeRow[] {
  let result = rows;

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    result = result.filter((r) =>
      r.record.employeeName.toLowerCase().includes(q) ||
      r.record.jobTitle.toLowerCase().includes(q) ||
      (r.record.department?.toLowerCase().includes(q) ?? false) ||
      (r.record.location?.toLowerCase().includes(q) ?? false)
    );
  }

  if (activeFilter !== "all") {
    if (activeFilter === "not_marked") {
      result = result.filter((r) => r.currentStatus === null);
    } else {
      result = result.filter((r) => r.currentStatus === activeFilter);
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────

export function calcSummary(rows: EmployeeRow[]): AttendanceSummary {
  return {
    total: rows.length,
    present: rows.filter((r) => r.currentStatus === "present").length,
    absent: rows.filter((r) => r.currentStatus === "absent").length,
    leave: rows.filter((r) => r.currentStatus === "leave").length,
    off: rows.filter((r) => r.currentStatus === "off").length,
    notMarked: rows.filter((r) => r.currentStatus === null).length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Date Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function shiftDate(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function formatDateDisplay(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "long", day: "2-digit", month: "short", year: "numeric",
  });
}

export function formatShortDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "short", day: "2-digit", month: "short",
  });
}