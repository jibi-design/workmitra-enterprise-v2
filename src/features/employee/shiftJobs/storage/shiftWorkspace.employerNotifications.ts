// App name: Job Mitra
// File name: shiftWorkspace.employerNotifications.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\storage\shiftWorkspace.employerNotifications.ts

import type { EmployerNote } from "../types/shiftWorkspace.types";
import {
  EMPLOYER_NOTIFICATIONS_CHANGED_EVENT,
  EMPLOYER_NOTIFICATIONS_KEY,
} from "./shiftWorkspace.keys";
import { createLocalId, safeDispatch, safeParseArray, safeSetJson } from "./shiftWorkspace.utils";

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

  const existing = safeParseArray<EmployerNote>(localStorage.getItem(EMPLOYER_NOTIFICATIONS_KEY));
  const next = [note, ...existing].slice(0, 150);

  safeSetJson(EMPLOYER_NOTIFICATIONS_KEY, next);
  safeDispatch(EMPLOYER_NOTIFICATIONS_CHANGED_EVENT);
}
