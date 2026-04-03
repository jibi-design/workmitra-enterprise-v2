// src/features/employer/notifications/storage/employerNotifications.storage.ts
//
// Employer notification storage — supports all domains.
// Domains: shift, career, hr, console, workforce

export type EmployerNotificationDomain = "shift" | "career" | "hr" | "console" | "workforce";

export type EmployerNotification = {
  id: string;
  domain: EmployerNotificationDomain;
  title: string;
  body?: string;
  createdAt: number;
  isRead: boolean;
  route?: string;
};

const KEY = "wm_employer_notifications_v1";
const CHANGED_EVENT = "wm:employer-notifications-changed";
const MAX_NOTIFICATIONS = 200;

type UnknownRecord = Record<string, unknown>;

function isRecord(x: unknown): x is UnknownRecord {
  return typeof x === "object" && x !== null;
}

function getString(r: UnknownRecord, k: string): string | undefined {
  const v = r[k];
  return typeof v === "string" ? v : undefined;
}

function getNumber(r: UnknownRecord, k: string): number | undefined {
  const v = r[k];
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function getBool(r: UnknownRecord, k: string): boolean | undefined {
  const v = r[k];
  return typeof v === "boolean" ? v : undefined;
}

function safeParseArray(raw: string | null): unknown[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const VALID_DOMAINS: EmployerNotificationDomain[] = ["shift", "career", "hr", "console", "workforce"];

function normalize(rawList: unknown[]): EmployerNotification[] {
  const out: EmployerNotification[] = [];

  for (const x of rawList) {
    if (!isRecord(x)) continue;

    const id = getString(x, "id");
    const title = getString(x, "title");
    const createdAt = getNumber(x, "createdAt");
    const isRead = getBool(x, "isRead");

    if (!id || !title || createdAt === undefined || isRead === undefined) continue;

    const domainRaw = getString(x, "domain") as EmployerNotificationDomain | undefined;
    const domain: EmployerNotificationDomain =
      domainRaw && VALID_DOMAINS.includes(domainRaw) ? domainRaw : "shift";

    const body = getString(x, "body");
    const route = getString(x, "route");

    out.push({ id, domain, title, body, createdAt, isRead, route });
  }

  out.sort((a, b) => b.createdAt - a.createdAt);
  return out;
}

function safeWrite(list: EmployerNotification[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // demo-safe ignore
  }
}

function safeDispatch(eventName: string) {
  try {
    window.dispatchEvent(new Event(eventName));
  } catch {
    // ignore
  }
}

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function unreadCountOf(list: EmployerNotification[]): number {
  let n = 0;
  for (const x of list) if (!x.isRead) n++;
  return n;
}

let cacheRaw: string | null = null;
let cacheList: EmployerNotification[] = [];
let cacheUnread = 0;

function readAllCached(): EmployerNotification[] {
  const raw = localStorage.getItem(KEY);

  if (raw === null) {
    if (cacheRaw === null && cacheList.length === 0) return cacheList;
    cacheRaw = null;
    cacheList = [];
    cacheUnread = 0;
    return cacheList;
  }

  if (raw === cacheRaw) return cacheList;

  cacheRaw = raw;
  const list = normalize(safeParseArray(raw));
  cacheList = list;
  cacheUnread = unreadCountOf(list);
  return cacheList;
}

function pushNotification(
  domain: EmployerNotificationDomain,
  title: string,
  body?: string,
  route?: string,
) {
  const note: EmployerNotification = {
    id: makeId("en"),
    domain,
    title,
    body,
    createdAt: Date.now(),
    isRead: false,
    route,
  };

  const existing = readAllCached();
  safeWrite([note, ...existing].slice(0, MAX_NOTIFICATIONS));
  safeDispatch(CHANGED_EVENT);
}

export const employerNotificationsStorage = {
  subscribe(onStoreChange: () => void): () => void {
    const handler = () => onStoreChange();
    window.addEventListener("storage", handler);
    window.addEventListener(CHANGED_EVENT, handler);
    window.addEventListener("focus", handler);
    document.addEventListener("visibilitychange", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener(CHANGED_EVENT, handler);
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
    const list = readAllCached();
    const next = list.map((n) => (n.id === idVal ? { ...n, isRead: true } : n));
    safeWrite(next);
    safeDispatch(CHANGED_EVENT);
  },

  markAllRead() {
    const list = readAllCached();
    const next = list.map((n) => (n.isRead ? n : { ...n, isRead: true }));
    safeWrite(next);
    safeDispatch(CHANGED_EVENT);
  },

  // Domain-specific push methods
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

  clearAll() {
    try { localStorage.removeItem(KEY); } catch { /* safe */ }
    cacheRaw = null;
    cacheList = [];
    cacheUnread = 0;
    safeDispatch(CHANGED_EVENT);
  },

  deleteOne(idVal: string) {
    const list = readAllCached().filter((n) => n.id !== idVal);
    safeWrite(list);
    safeDispatch(CHANGED_EVENT);
  },

  autoCleanup() {
    const cutoff = Date.now() - 30 * 86_400_000;
    const list = readAllCached();
    const cleaned = list.filter((n) => n.createdAt >= cutoff);
    if (cleaned.length < list.length) {
      safeWrite(cleaned);
      safeDispatch(CHANGED_EVENT);
    }
  },

  _eventName: CHANGED_EVENT,
  _key: KEY,
} as const;