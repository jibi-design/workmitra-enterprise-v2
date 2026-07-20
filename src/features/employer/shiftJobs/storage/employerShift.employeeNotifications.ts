// App name: Job Mitra
// File name: employerShift.employeeNotifications.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\storage\employerShift.employeeNotifications.ts

import { EMPLOYEE_NOTES_KEY } from "./employerShift.keys";
import type { EmployeeNotification } from "./employerShift.types";
import {
  createLocalId,
  notifyEmployeeNotesChanged,
  safeParse,
  safeWrite,
} from "./employerShift.utils";

export function pushEmployeeNotification(title: string, body: string, route?: string): void {
  const note: EmployeeNotification = {
    id: createLocalId("en"),
    domain: "shift",
    title,
    body,
    createdAt: Date.now(),
    isRead: false,
    route,
  };

  const existing = safeParse<EmployeeNotification>(localStorage.getItem(EMPLOYEE_NOTES_KEY));
  safeWrite(EMPLOYEE_NOTES_KEY, [note, ...existing].slice(0, 150));
  notifyEmployeeNotesChanged();
}
