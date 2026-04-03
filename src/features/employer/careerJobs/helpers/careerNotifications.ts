// src/features/employer/careerJobs/helpers/careerNotifications.ts
//
// Employee notification push (domain: "career") and Employer activity log push.
// Uses the shared employee notification system (wm_employee_notifications_v1).
// Includes duplicate prevention via signature check.

import type {
  CareerNotification,
  EmployerCareerActivityEntry,
  EmployerCareerActivityKind,
} from "../types/careerTypes";

import {
  uid,
  safeParse,
  safeWrite,
  isRecord,
  EMPLOYEE_NOTES_KEY,
  notifyEmployeeNotesChanged,
} from "./careerStorageUtils";

import {
  readCareerActivityAll,
  writeCareerActivityAll,
} from "./careerNormalizers";

// ─────────────────────────────────────────────────────────────────────────────
// Employee Career Notification Push
// ─────────────────────────────────────────────────────────────────────────────

export function pushEmployeeCareerNotification(
  title: string,
  body: string,
  route?: string
): void {
  const note: CareerNotification = {
    id: uid("cn"),
    domain: "career",
    title,
    body,
    createdAt: Date.now(),
    isRead: false,
    route,
  };
  const existing = safeParse<CareerNotification>(
    localStorage.getItem(EMPLOYEE_NOTES_KEY)
  );
  safeWrite(EMPLOYEE_NOTES_KEY, [note, ...existing].slice(0, 100));
  notifyEmployeeNotesChanged();
}

// ─────────────────────────────────────────────────────────────────────────────
// Duplicate Notification Prevention
// ─────────────────────────────────────────────────────────────────────────────

export function hasSimilarCareerNote(signature: string): boolean {
  const existing = safeParse<Record<string, unknown>>(
    localStorage.getItem(EMPLOYEE_NOTES_KEY)
  );
  return existing.some(
    (n) =>
      isRecord(n) &&
      typeof n["body"] === "string" &&
      (n["body"] as string).includes(signature)
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Employer Career Activity Log Push
// ─────────────────────────────────────────────────────────────────────────────

export function pushCareerActivity(
  entry: {
    postId: string;
    kind: EmployerCareerActivityKind;
    title: string;
    body?: string;
    route?: string;
    createdAt?: number;
  }
): void {
  const now = typeof entry.createdAt === "number" ? entry.createdAt : Date.now();
  const item: EmployerCareerActivityEntry = {
    id: uid("cal"),
    postId: entry.postId,
    kind: entry.kind,
    createdAt: now,
    title: entry.title,
    body: entry.body,
    route: entry.route,
  };
  const existing = readCareerActivityAll();
  writeCareerActivityAll([item, ...existing].slice(0, 300));
}