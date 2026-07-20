// App name: Job Mitra
// File name: employeeNotifications.storage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\notifications\storage\employeeNotifications.storage.ts

// Employee notification storage — stable-reference cache for useSyncExternalStore.
// Domains: shift, career, workforce, employment.

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

export type EmployeeNotificationDomain = "shift" | "career" | "workforce" | "employment";

export type EmployeeNotification = {
  id: string;
  domain: EmployeeNotificationDomain;
  title: string;
  body?: string;
  createdAt: number;
  isRead: boolean;
  route?: string;
};

const KEY = "wm_employee_notifications_v1";
const CHANGED_EVENT = "wm:employee-notifications-changed";
const MAX_ITEMS = DEFAULT_NOTIFICATION_MAX_ITEMS;

const VALID_DOMAINS: readonly EmployeeNotificationDomain[] = [
  "shift",
  "career",
  "workforce",
  "employment",
] as const;

let _cacheRaw: string | null = null;
let _cacheList: EmployeeNotification[] = [];
let _cacheUnread = 0;

function safeGet(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function safeSet(value: string) {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    // demo-safe
  }
}

function notify() {
  try {
    window.dispatchEvent(new Event(CHANGED_EVENT));
  } catch {
    // demo-safe
  }
}

function newId(): string {
  return `en_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function safeParse(raw: string | null): EmployeeNotification[] {
  const parsed = parseNotificationJson(raw);

  return uniqueLatestNotifications(
    parsed
      .map((item) => normalizeNotificationInput<EmployeeNotificationDomain>(item, VALID_DOMAINS))
      .filter((item): item is EmployeeNotification => item !== null),
    MAX_ITEMS,
  );
}

function readCached(): EmployeeNotification[] {
  const raw = safeGet();

  if (raw === null) {
    if (_cacheRaw === null) return _cacheList;

    _cacheRaw = null;
    _cacheList = [];
    _cacheUnread = 0;
    return _cacheList;
  }

  if (raw === _cacheRaw) return _cacheList;

  _cacheRaw = raw;
  _cacheList = safeParse(raw);
  _cacheUnread = _cacheList.filter((n) => !n.isRead).length;
  return _cacheList;
}

function write(list: EmployeeNotification[]) {
  safeSet(JSON.stringify(uniqueLatestNotifications(list, MAX_ITEMS)));
  _cacheRaw = null;
  notify();
}

function push(domain: EmployeeNotificationDomain, title: string, body?: string, route?: string) {
  const cleanTitle = cleanNotificationText(title, DEFAULT_NOTIFICATION_TEXT_LIMITS.title);
  if (!cleanTitle) return;

  const all = readCached();

  const item: EmployeeNotification = {
    id: newId(),
    domain,
    title: cleanTitle,
    body: cleanOptionalNotificationText(body, DEFAULT_NOTIFICATION_TEXT_LIMITS.body),
    createdAt: Date.now(),
    isRead: false,
    route: cleanNotificationRoute(route),
  };

  if (hasRecentNotificationDuplicate(all, item, DEFAULT_NOTIFICATION_DEDUPE_WINDOW_MS)) return;

  write([item, ...all]);
}

export const employeeNotificationsStorage = {
  getAll(): EmployeeNotification[] {
    return readCached();
  },

  getUnreadCount(): number {
    readCached();
    return _cacheUnread;
  },

  subscribe(listener: () => void): () => void {
    const handler = () => listener();
    const onStorage = (event: StorageEvent) => {
      if (event.key === KEY || event.key === null) listener();
    };

    window.addEventListener(CHANGED_EVENT, handler);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(CHANGED_EVENT, handler);
      window.removeEventListener("storage", onStorage);
    };
  },

  markRead(id: string) {
    const cleanId = cleanNotificationText(id, 120);
    if (!cleanId) return;

    write(readCached().map((n) => (n.id === cleanId ? { ...n, isRead: true } : n)));
  },

  markAllRead() {
    write(readCached().map((n) => (n.isRead ? n : { ...n, isRead: true })));
  },

  deleteOne(id: string) {
    const cleanId = cleanNotificationText(id, 120);
    if (!cleanId) return;

    write(readCached().filter((n) => n.id !== cleanId));
  },

  clearAll() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // demo-safe
    }

    _cacheRaw = null;
    _cacheList = [];
    _cacheUnread = 0;
    notify();
  },

  autoCleanup() {
    const cutoff = Date.now() - 30 * 86_400_000;
    const all = readCached();
    const cleaned = all.filter((n) => n.createdAt >= cutoff);

    if (cleaned.length < all.length) write(cleaned);
  },

  pushShift(title: string, body?: string, route?: string) {
    push("shift", title, body, route);
  },

  pushCareer(title: string, body?: string, route?: string) {
    push("career", title, body, route);
  },

  pushWorkforce(title: string, body?: string, route?: string) {
    push("workforce", title, body, route);
  },

  pushEmployment(title: string, body?: string, route?: string) {
    push("employment", title, body, route);
  },
} as const;
