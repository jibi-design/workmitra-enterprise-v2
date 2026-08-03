// App name: Job Mitra
// File name: employerNotifications.storage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\notifications\storage\employerNotifications.storage.ts

// Employer notification storage — supports all domains.
// Domains: shift, career, hr, console, workforce.

import {
  cleanNotificationRoute,
  cleanNotificationText,
  cleanOptionalNotificationText,
  DEFAULT_NOTIFICATION_DEDUPE_WINDOW_MS,
  DEFAULT_NOTIFICATION_MAX_ITEMS,
  DEFAULT_NOTIFICATION_TEXT_LIMITS,
  hasRecentNotificationDuplicate,
  normalizeNotificationInput,
  parseNotificationJson,
  uniqueLatestNotifications,
} from "../../../../shared/notifications/guards";
import { resolveShiftEmployerScopedKey } from "../../../shared/shift/shiftEmployerScope";

export type EmployerNotificationDomain =
  "shift" | "career" | "hr" | "console" | "workforce" | "employment";

export type EmployerNotification = {
  id: string;
  domain: EmployerNotificationDomain;
  title: string;
  body?: string;
  createdAt: number;
  isRead: boolean;
  route?: string;
};

const CHANGED_EVENT = "wm:employer-notifications-changed";
const MAX_NOTIFICATIONS = DEFAULT_NOTIFICATION_MAX_ITEMS;

function storageKey(): string {
  return resolveShiftEmployerScopedKey("shift_notifications_v1");
}

const VALID_DOMAINS: readonly EmployerNotificationDomain[] = [
  "shift",
  "career",
  "hr",
  "console",
  "workforce",
  "employment",
] as const;

let cacheRaw: string | null = null;
let cacheList: EmployerNotification[] = [];
let cacheUnread = 0;

function safeRead(): string | null {
  try {
    return localStorage.getItem(storageKey());
  } catch {
    return null;
  }
}

function safeWrite(list: EmployerNotification[]) {
  try {
    localStorage.setItem(
      storageKey(),
      JSON.stringify(uniqueLatestNotifications(list, MAX_NOTIFICATIONS)),
    );
  } catch {
    // demo-safe
  }
}

function safeDispatch(eventName: string) {
  try {
    window.dispatchEvent(new Event(eventName));
  } catch {
    // demo-safe
  }
}

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function unreadCountOf(list: EmployerNotification[]): number {
  let count = 0;

  for (const item of list) {
    if (!item.isRead) count++;
  }

  return count;
}

function readAllCached(): EmployerNotification[] {
  const raw = safeRead();

  if (raw === null) {
    if (cacheRaw === null && cacheList.length === 0) return cacheList;

    cacheRaw = null;
    cacheList = [];
    cacheUnread = 0;
    return cacheList;
  }

  if (raw === cacheRaw) return cacheList;

  cacheRaw = raw;
  cacheList = uniqueLatestNotifications(
    parseNotificationJson(raw)
      .map((item) => normalizeNotificationInput<EmployerNotificationDomain>(item, VALID_DOMAINS))
      .filter((item): item is EmployerNotification => item !== null),
    MAX_NOTIFICATIONS,
  );
  cacheUnread = unreadCountOf(cacheList);
  return cacheList;
}

function pushNotification(
  domain: EmployerNotificationDomain,
  title: string,
  body?: string,
  route?: string,
) {
  const cleanTitle = cleanNotificationText(title, DEFAULT_NOTIFICATION_TEXT_LIMITS.title);
  if (!cleanTitle) return;

  const existing = readAllCached();

  const note: EmployerNotification = {
    id: makeId("en"),
    domain,
    title: cleanTitle,
    body: cleanOptionalNotificationText(body, DEFAULT_NOTIFICATION_TEXT_LIMITS.body),
    createdAt: Date.now(),
    isRead: false,
    route: cleanNotificationRoute(route),
  };

  if (hasRecentNotificationDuplicate(existing, note, DEFAULT_NOTIFICATION_DEDUPE_WINDOW_MS)) return;

  safeWrite([note, ...existing]);
  cacheRaw = null;
  safeDispatch(CHANGED_EVENT);
}

export const employerNotificationsStorage = {
  subscribe(onStoreChange: () => void): () => void {
    const handler = () => {
      cacheRaw = null;
      onStoreChange();
    };

    window.addEventListener("storage", handler);
    window.addEventListener(CHANGED_EVENT, handler);
    window.addEventListener("wm:shift-employer-scope-changed", handler);
    window.addEventListener("focus", handler);
    document.addEventListener("visibilitychange", handler);

    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener(CHANGED_EVENT, handler);
      window.removeEventListener("wm:shift-employer-scope-changed", handler);
      window.removeEventListener("focus", handler);
      document.removeEventListener("visibilitychange", handler);
    };
  },

  getAll(): EmployerNotification[] {
    return readAllCached();
  },

  getByDomain(domain: EmployerNotificationDomain): EmployerNotification[] {
    return readAllCached().filter((n) => n.domain === domain);
  },

  getUnreadCount(): number {
    readAllCached();
    return cacheUnread;
  },

  markRead(idVal: string) {
    const cleanId = cleanNotificationText(idVal, 120);
    if (!cleanId) return;

    safeWrite(readAllCached().map((n) => (n.id === cleanId ? { ...n, isRead: true } : n)));
    cacheRaw = null;
    safeDispatch(CHANGED_EVENT);
  },

  markAllRead() {
    safeWrite(readAllCached().map((n) => (n.isRead ? n : { ...n, isRead: true })));
    cacheRaw = null;
    safeDispatch(CHANGED_EVENT);
  },

  pushShift(title: string, body?: string, route?: string) {
    pushNotification("shift", title, body, route);
  },

  pushCareer(title: string, body?: string, route?: string) {
    pushNotification("career", title, body, route);
  },

  pushHR(title: string, body?: string, route?: string) {
    pushNotification("hr", title, body, route);
  },

  pushConsole(title: string, body?: string, route?: string) {
    pushNotification("console", title, body, route);
  },

  pushWorkforce(title: string, body?: string, route?: string) {
    pushNotification("workforce", title, body, route);
  },

  pushEmployment(title: string, body?: string, route?: string) {
    pushNotification("employment", title, body, route);
  },

  clearAll() {
    try {
      localStorage.removeItem(storageKey());
    } catch {
      // demo-safe
    }

    cacheRaw = null;
    cacheList = [];
    cacheUnread = 0;
    safeDispatch(CHANGED_EVENT);
  },

  deleteOne(idVal: string) {
    const cleanId = cleanNotificationText(idVal, 120);
    if (!cleanId) return;

    safeWrite(readAllCached().filter((n) => n.id !== cleanId));
    cacheRaw = null;
    safeDispatch(CHANGED_EVENT);
  },

  autoCleanup() {
    const cutoff = Date.now() - 30 * 86_400_000;
    const list = readAllCached();
    const cleaned = list.filter((n) => n.createdAt >= cutoff);

    if (cleaned.length < list.length) {
      safeWrite(cleaned);
      cacheRaw = null;
      safeDispatch(CHANGED_EVENT);
    }
  },

  _eventName: CHANGED_EVENT,
  get _key() {
    return storageKey();
  },
} as const;
