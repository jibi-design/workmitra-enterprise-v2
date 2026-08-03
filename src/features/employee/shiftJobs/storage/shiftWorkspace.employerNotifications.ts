// App name: Job Mitra
// File name: shiftWorkspace.employerNotifications.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\storage\shiftWorkspace.employerNotifications.ts

import type { EmployerNote } from "../types/shiftWorkspace.types";
import { EMPLOYER_NOTIFICATIONS_CHANGED_EVENT } from "./shiftWorkspace.keys";
import { createLocalId, safeDispatch, safeParseArray, safeSetJson } from "./shiftWorkspace.utils";
import { resolveShiftEmployerScopedKey } from "../../../shared/shift/shiftEmployerScope";

export function pushEmployerNotificationShift(title: string, body: string, route?: string): void {
  const now = Date.now();

  const note: EmployerNote = {
    id: createLocalId("en"),
    domain: "shift",
    title,
    body,
    createdAt: now,
    isRead: false,
    route,
  };

  const key = resolveShiftEmployerScopedKey("shift_notifications_v1");
  const existing = safeParseArray<EmployerNote>(localStorage.getItem(key));
  const next = [note, ...existing].slice(0, 150);

  safeSetJson(key, next);
  safeDispatch(EMPLOYER_NOTIFICATIONS_CHANGED_EVENT);
}
