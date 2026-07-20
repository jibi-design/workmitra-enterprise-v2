// App name: Job Mitra
// File name: careerNotifications.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\helpers\careerNotifications.ts

// Employee notification push (domain: "career") and Employer activity log push.
// Uses shared notification guard helpers to keep future UI changes safe.

import type {
  CareerNotification,
  EmployerCareerActivityEntry,
  EmployerCareerActivityKind,
} from "../types/careerTypes";

import {
  uid,
  safeParse,
  safeRead,
  safeWrite,
  isRecord,
  notifyEmployeeNotesChanged,
} from "./careerStorageUtils";
import { EMPLOYEE_NOTES_KEY } from "../../shiftJobs/storage/employerShift.keys";

import { readCareerActivityAll, writeCareerActivityAll } from "./careerNormalizers";

import {
  cleanNotificationRoute,
  cleanNotificationText,
  cleanOptionalNotificationText,
  DEFAULT_NOTIFICATION_DEDUPE_WINDOW_MS,
  DEFAULT_NOTIFICATION_TEXT_LIMITS,
  hasRecentNotificationDuplicate,
  normalizeAnyDomainNotificationInput,
  uniqueLatestNotifications,
  type NotificationLike,
} from "../../../../shared/notifications/guards";

const MAX_EMPLOYEE_NOTIFICATIONS = 100;
const MAX_ACTIVITY_ITEMS = 300;

function makeActivitySignature(entry: {
  postId: string;
  kind: EmployerCareerActivityKind;
  title: string;
  body?: string;
  route?: string;
}): string {
  return `${entry.postId}|${entry.kind}|${entry.title}|${entry.body ?? ""}|${entry.route ?? ""}`.toLowerCase();
}

function hasRecentActivity(
  existing: EmployerCareerActivityEntry[],
  signature: string,
  now: number,
): boolean {
  return existing.some((item) => {
    const itemSignature = makeActivitySignature({
      postId: item.postId,
      kind: item.kind,
      title: item.title,
      body: item.body,
      route: item.route,
    });

    return (
      itemSignature === signature &&
      Math.abs(now - item.createdAt) <= DEFAULT_NOTIFICATION_DEDUPE_WINDOW_MS
    );
  });
}

function readExistingEmployeeNotifications(): NotificationLike[] {
  return safeParse<unknown>(safeRead(EMPLOYEE_NOTES_KEY))
    .map((item) => normalizeAnyDomainNotificationInput(item))
    .filter((item): item is NotificationLike => item !== null);
}

export function pushEmployeeCareerNotification(title: string, body: string, route?: string): void {
  const cleanTitle = cleanNotificationText(title, DEFAULT_NOTIFICATION_TEXT_LIMITS.title);
  const cleanBody = cleanNotificationText(body, DEFAULT_NOTIFICATION_TEXT_LIMITS.body);
  const safeRoute = cleanNotificationRoute(route);

  if (!cleanTitle || !cleanBody) return;

  const now = Date.now();
  const existing = readExistingEmployeeNotifications();

  const note: CareerNotification = {
    id: uid("cn"),
    domain: "career",
    title: cleanTitle,
    body: cleanBody,
    createdAt: now,
    isRead: false,
    route: safeRoute,
  };

  if (hasRecentNotificationDuplicate(existing, note)) return;

  safeWrite(
    EMPLOYEE_NOTES_KEY,
    uniqueLatestNotifications([note, ...existing], MAX_EMPLOYEE_NOTIFICATIONS),
  );
  notifyEmployeeNotesChanged();
}

export function hasSimilarCareerNote(signature: string): boolean {
  const cleanSignature = cleanNotificationText(
    signature,
    DEFAULT_NOTIFICATION_TEXT_LIMITS.body,
  ).toLowerCase();
  if (!cleanSignature) return false;

  const existing = safeParse<Record<string, unknown>>(safeRead(EMPLOYEE_NOTES_KEY));

  return existing.some(
    (note) =>
      isRecord(note) &&
      typeof note["body"] === "string" &&
      note["body"].toLowerCase().includes(cleanSignature),
  );
}

export function pushCareerActivity(entry: {
  postId: string;
  kind: EmployerCareerActivityKind;
  title: string;
  body?: string;
  route?: string;
  createdAt?: number;
}): void {
  const postId = cleanNotificationText(entry.postId, 120);
  const title = cleanNotificationText(entry.title, DEFAULT_NOTIFICATION_TEXT_LIMITS.title);
  const body = cleanOptionalNotificationText(entry.body, DEFAULT_NOTIFICATION_TEXT_LIMITS.body);
  const route = cleanNotificationRoute(entry.route);
  const now =
    typeof entry.createdAt === "number" && Number.isFinite(entry.createdAt) && entry.createdAt > 0
      ? entry.createdAt
      : Date.now();

  if (!postId || !title) return;

  const existing = readCareerActivityAll();
  const signature = makeActivitySignature({
    postId,
    kind: entry.kind,
    title,
    body,
    route,
  });

  if (hasRecentActivity(existing, signature, now)) return;

  const item: EmployerCareerActivityEntry = {
    id: uid("cal"),
    postId,
    kind: entry.kind,
    createdAt: now,
    title,
    body,
    route,
  };

  writeCareerActivityAll([item, ...existing].slice(0, MAX_ACTIVITY_ITEMS));
}
