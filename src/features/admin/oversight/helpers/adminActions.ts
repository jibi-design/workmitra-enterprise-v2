// src/features/admin/oversight/helpers/adminActions.ts
//
// Admin-specific actions: notifications, global broadcast,
// seed demo data. Phase-0 localStorage only.

import { pushAdminAuditEntry } from "./adminDataHelpers";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type AdminNotification = {
  id: string;
  kind: "system" | "broadcast_sent" | "user_action" | "alert";
  title: string;
  body?: string;
  createdAt: number;
  isRead: boolean;
};

export type BroadcastTarget = "all" | "employers" | "employees";

// ─────────────────────────────────────────────────────────────────────────────
// Keys & Events
// ─────────────────────────────────────────────────────────────────────────────

const ADMIN_NOTIF_KEY = "wm_admin_notifications_v1";
const ADMIN_NOTIF_CHANGED = "wm:admin-notifications-changed";
const EMPLOYEE_NOTIF_KEY = "wm_employee_notifications_v1";
const EMPLOYEE_NOTIF_CHANGED = "wm:employee-notifications-changed";

// ─────────────────────────────────────────────────────────────────────────────
// Safe Helpers
// ─────────────────────────────────────────────────────────────────────────────

function safeArr<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const p = JSON.parse(raw) as unknown;
    return Array.isArray(p) ? (p as T[]) : [];
  } catch {
    return [];
  }
}

function safeWrite(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function dispatch(event: string): void {
  try {
    window.dispatchEvent(new Event(event));
  } catch {
    /* ignore */
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin Notifications
// ─────────────────────────────────────────────────────────────────────────────

export function getAdminNotifications(): AdminNotification[] {
  return safeArr<AdminNotification>(ADMIN_NOTIF_KEY).sort(
    (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
  );
}

export function pushAdminNotification(kind: AdminNotification["kind"], title: string, body?: string): void {
  const existing = safeArr<AdminNotification>(ADMIN_NOTIF_KEY);
  const entry: AdminNotification = {
    id: uid("an"),
    kind,
    title,
    body,
    createdAt: Date.now(),
    isRead: false,
  };
  safeWrite(ADMIN_NOTIF_KEY, [entry, ...existing].slice(0, 200));
  dispatch(ADMIN_NOTIF_CHANGED);
}

export function markAdminNotificationRead(notifId: string): void {
  const list = safeArr<AdminNotification>(ADMIN_NOTIF_KEY);
  const updated = list.map((n) =>
    n.id === notifId ? { ...n, isRead: true } : n,
  );
  safeWrite(ADMIN_NOTIF_KEY, updated);
  dispatch(ADMIN_NOTIF_CHANGED);
}

export function markAllAdminNotificationsRead(): void {
  const list = safeArr<AdminNotification>(ADMIN_NOTIF_KEY);
  const updated = list.map((n) => ({ ...n, isRead: true }));
  safeWrite(ADMIN_NOTIF_KEY, updated);
  dispatch(ADMIN_NOTIF_CHANGED);
}

export function getUnreadAdminCount(): number {
  return safeArr<AdminNotification>(ADMIN_NOTIF_KEY).filter((n) => !n.isRead).length;
}

// ─────────────────────────────────────────────────────────────────────────────
// Global Broadcast
// ─────────────────────────────────────────────────────────────────────────────

export function sendBroadcast(target: BroadcastTarget, title: string, body: string): void {
  if (!title.trim()) return;

  const now = Date.now();

  if (target === "all" || target === "employees") {
    const empNotifs = safeArr<Record<string, unknown>>(EMPLOYEE_NOTIF_KEY);
    const empEntry = {
      id: uid("bn"),
      domain: "system" as const,
      title: `[Admin] ${title}`,
      body,
      createdAt: now,
      isRead: false,
    };
    safeWrite(EMPLOYEE_NOTIF_KEY, [empEntry, ...empNotifs].slice(0, 100));
    dispatch(EMPLOYEE_NOTIF_CHANGED);
  }

  const targetLabel = target === "all" ? "All Users" : target === "employers" ? "Employers" : "Employees";

  pushAdminNotification(
    "broadcast_sent",
    `Broadcast sent to ${targetLabel}`,
    `Title: ${title}. ${body ? `Message: ${body}` : ""}`.trim(),
  );

  pushAdminAuditEntry(
    "broadcast_sent",
    `Broadcast: ${title}`,
    `Target: ${targetLabel}. ${body || ""}`.trim(),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin Notification Event Name (for subscription)
// ─────────────────────────────────────────────────────────────────────────────

export const ADMIN_NOTIF_EVENT = ADMIN_NOTIF_CHANGED;