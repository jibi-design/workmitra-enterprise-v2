// src/features/employee/notifications/helpers/employeeNotificationService.ts
//
// Central notification service for employee side.
// Listens to domain storage events and auto-pushes notifications.
// Initialized once in EmployeeShell via useEffect.

import {
  handleNotificationChange,
  takeSnapshot,
  type Snapshot,
} from "./employeeNotificationService.detectors.helpers";

let prev: Snapshot | null = null;
let initialized = false;
let cleanupFn: (() => void) | null = null;

/** Initialize once — call in EmployeeShell useEffect */
export function initEmployeeNotificationService(): () => void {
  if (initialized && cleanupFn) return cleanupFn;

  prev = takeSnapshot();
  initialized = true;

  const EVENTS = [
    "wm:employer-shift-posts-changed",
    "wm:employee-shift-applications-changed",
    "wm:employee-shift-workspaces-changed",
    "wm:career-applications-changed",
    "wm:hr-leave-changed",
    "wm:task-assignment-changed",
    "wm:roster-planner-changed",
    "wm:incident-reports-changed",
  ];

  const handler = () => {
    if (!prev) return;
    prev = handleNotificationChange(prev);
  };

  for (const ev of EVENTS) window.addEventListener(ev, handler);

  cleanupFn = () => {
    for (const ev of EVENTS) window.removeEventListener(ev, handler);
    initialized = false;
    prev = null;
    cleanupFn = null;
  };

  return cleanupFn;
}
