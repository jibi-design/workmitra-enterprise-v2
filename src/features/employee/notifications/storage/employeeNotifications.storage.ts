// src/features/employee/notifications/storage/employeeNotifications.storage.ts
//
// Employee notification storage — stable-reference cache for useSyncExternalStore.
// Domains: shift, career, workforce, employment.

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
const MAX_ITEMS = 200;

/* ── Stable-reference cache for useSyncExternalStore ── */
let _cacheRaw: string | null = null;
let _cacheList: EmployeeNotification[] = [];
let _cacheUnread = 0;

/* ------------------------------------------------ */
/* Guards                                           */
/* ------------------------------------------------ */
function isDomain(x: unknown): x is EmployeeNotificationDomain {
  return x === "shift" || x === "career" || x === "workforce" || x === "employment";
}

/* ------------------------------------------------ */
/* localStorage helpers                             */
/* ------------------------------------------------ */
function safeGet(): string | null {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

function safeSet(v: string) {
  try { localStorage.setItem(KEY, v); } catch { /* safe */ }
}

function notify() {
  try { window.dispatchEvent(new Event(CHANGED_EVENT)); } catch { /* safe */ }
}

function newId(): string {
  return `en_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

/* ------------------------------------------------ */
/* Parse                                            */
/* ------------------------------------------------ */
function safeParse(raw: string | null): EmployeeNotification[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((n): n is EmployeeNotification =>
      !!n && typeof n === "object" &&
      typeof (n as EmployeeNotification).id === "string" &&
      isDomain((n as EmployeeNotification).domain) &&
      typeof (n as EmployeeNotification).title === "string" &&
      typeof (n as EmployeeNotification).createdAt === "number" &&
      typeof (n as EmployeeNotification).isRead === "boolean",
    );
  } catch { return []; }
}

/* ------------------------------------------------ */
/* Cache read — stable reference                    */
/* ------------------------------------------------ */
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
  _cacheList = safeParse(raw).sort((a, b) => b.createdAt - a.createdAt);
  _cacheUnread = _cacheList.filter((n) => !n.isRead).length;
  return _cacheList;
}

/* ------------------------------------------------ */
/* Write — always invalidates cache                 */
/* ------------------------------------------------ */
function write(list: EmployeeNotification[]) {
  safeSet(JSON.stringify(list.slice(0, MAX_ITEMS)));
  _cacheRaw = null; // force cache rebuild on next read
  notify();
}

/* ------------------------------------------------ */
/* Push helper                                      */
/* ------------------------------------------------ */
function push(domain: EmployeeNotificationDomain, title: string, body?: string, route?: string) {
  const all = readCached();
  const item: EmployeeNotification = {
    id: newId(),
    domain,
    title,
    body,
    createdAt: Date.now(),
    isRead: false,
    route,
  };
  write([item, ...all]);
}

/* ------------------------------------------------ */
/* Storage API                                      */
/* ------------------------------------------------ */
export const employeeNotificationsStorage = {
  getAll(): EmployeeNotification[] {
    return readCached();
  },

  getUnreadCount(): number {
    readCached();
    return _cacheUnread;
  },

  subscribe(listener: () => void): () => void {
    const h = () => listener();
    const onStorage = (e: StorageEvent) => { if (e.key === KEY || e.key === null) listener(); };
    window.addEventListener(CHANGED_EVENT, h);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CHANGED_EVENT, h);
      window.removeEventListener("storage", onStorage);
    };
  },

  markRead(id: string) {
    const next = readCached().map((n) => n.id === id ? { ...n, isRead: true } : n);
    write(next);
  },

  markAllRead() {
    const next = readCached().map((n) => n.isRead ? n : { ...n, isRead: true });
    write(next);
  },

  deleteOne(id: string) {
    write(readCached().filter((n) => n.id !== id));
  },

  clearAll() {
    try { localStorage.removeItem(KEY); } catch { /* safe */ }
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

  pushShift(title: string, body?: string, route?: string) { push("shift", title, body, route); },
  pushCareer(title: string, body?: string, route?: string) { push("career", title, body, route); },
  pushWorkforce(title: string, body?: string, route?: string) { push("workforce", title, body, route); },
  pushEmployment(title: string, body?: string, route?: string) { push("employment", title, body, route); },
} as const;