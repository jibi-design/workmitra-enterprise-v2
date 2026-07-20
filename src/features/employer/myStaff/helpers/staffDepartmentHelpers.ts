// App: Job Mitra / WorkMitra_Enterprise_v2
// File: staffDepartmentHelpers.ts
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\myStaff\helpers\staffDepartmentHelpers.ts

import type { StaffDepartment, StaffRecord } from "../storage/myStaff.storage";

export function getDisplayDepartment(record: StaffRecord): string {
  return record.departmentName || record.category || "No department assigned";
}

export function getDepartmentHelperText(record: StaffRecord): string {
  if (record.departmentName) {
    return "This employee is assigned to an employer-created department.";
  }

  if (record.category) {
    return "This record still uses the job category. Assign a department when you are ready.";
  }

  return "Create or assign a department to organize active staff.";
}

export function getDepartmentOptions(departments: StaffDepartment[]): StaffDepartment[] {
  return [...departments].sort((a, b) => a.name.localeCompare(b.name));
}

export function canManageDepartment(record: StaffRecord): boolean {
  return record.status !== "exited";
}

export function getLatestDepartmentMoveLabel(record: StaffRecord): string {
  const latest = record.departmentHistory?.[0];
  if (!latest) return "No department movement yet";

  try {
    const date = new Date(latest.movedAt).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return `Moved to ${latest.toDepartmentName} on ${date}`;
  } catch {
    return `Moved to ${latest.toDepartmentName}`;
  }
}
