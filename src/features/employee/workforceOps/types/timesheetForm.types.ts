/**
 * Job Mitra | timesheetForm.types.ts
 * Shared types for the Employee Timesheet feature.
 * Extracted here to break the circular import between
 * EmployeeWorkforceTimesheetContent and EmployeeWorkforceTimesheetGroups.
 */

export type TimesheetMode = "days" | "hours";

export type TimesheetEntry = {
  groupId: string;
  groupName: string;
  date: string;
  shiftName: string;
  signInAt: number;
  signOutAt: number | null;
  hoursWorked: number | null;
};

export type TimesheetGroup = {
  groupName: string;
  totalHours: number;
  uniqueDays: Set<string>;
  entries: TimesheetEntry[];
};
