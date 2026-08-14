/** Job Mitra | employeeHomeDynamicNudges.helpers.ts | Upcoming + unified broadcast signals */

import {
  personalCalendarShiftStorage,
  type PersonalCalendarShiftBlock,
} from "../../shiftJobs/storage/personalCalendarShift.storage";
import { shiftWorkspacesStorage } from "../../shiftJobs/storage/shiftWorkspaces.storage";
import {
  employeeNotificationsStorage,
  type EmployeeNotification,
  type EmployeeNotificationDomain,
} from "../../notifications/storage/employeeNotifications.storage";
import {
  DOMAIN_BY_KEY,
  domainAccentCssVar,
  type DomainRegistryKey,
} from "../../../../shared/config/domainRegistry";
import { n, readDemo } from "./employeeHomeHelpers";

const STREAM_DOMAINS = new Set<EmployeeNotificationDomain>(["shift", "career", "employment"]);

const DEMO_FORCE_KEY = "wm_employee_home_nudge_demo_force_v1";
export const EMPLOYEE_HOME_NUDGE_DEMO_EVENT = "wm:employee-home-nudge-demo";

export type HomeNudgeDemoForce = {
  upcoming: boolean;
  /** When set, forces a broadcast banner in that domain accent. */
  broadcastDomain: DomainRegistryKey | null;
  /** Bumps so re-trigger shows after dismiss of same demo type. */
  generation: number;
};

const EMPTY_DEMO_FORCE: HomeNudgeDemoForce = {
  upcoming: false,
  broadcastDomain: null,
  generation: 0,
};

let demoForceCacheRaw: string | null = "__init__";
let demoForceCache: HomeNudgeDemoForce = EMPTY_DEMO_FORCE;
let demoForceGeneration = 0;

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(base.getDate() + days);
  return next;
}

/** Map notification / stream source → Day-1 domain accent key (registry SoT). */
export function resolveNudgeAccentDomain(
  notification: EmployeeNotification | null,
  workspaceUnread: number,
): DomainRegistryKey {
  if (notification) {
    const route = (notification.route ?? "").toLowerCase();
    const title = notification.title.toLowerCase();
    if (
      route.includes("/planner") ||
      route.includes("gig") ||
      title.includes("project") ||
      title.includes("plan ")
    ) {
      return "planner";
    }
    if (notification.domain === "career") return "career";
    if (notification.domain === "employment") return "vault";
    if (route.includes("/vault")) return "vault";
    return "shift";
  }
  if (workspaceUnread > 0) return "shift";
  return "shift";
}

export function nudgeAccentCssVar(key: DomainRegistryKey): string {
  return domainAccentCssVar(key);
}

export function nudgeDomainTitle(key: DomainRegistryKey): string {
  return DOMAIN_BY_KEY[key].title;
}

export type UpcomingShiftNudge = {
  count: number;
  nearest: PersonalCalendarShiftBlock | null;
  fingerprint: string;
  accentDomain: DomainRegistryKey;
  isDemoForce: boolean;
};

export type UnifiedBroadcastNudge = {
  totalUnread: number;
  notificationUnread: number;
  workspaceUnread: number;
  latest: EmployeeNotification | null;
  fingerprint: string;
  label: string;
  accentDomain: DomainRegistryKey;
  isDemoForce: boolean;
};

/** Stable refs for useSyncExternalStore (Object.is). */
let upcomingCache: UpcomingShiftNudge = {
  count: 0,
  nearest: null,
  fingerprint: "0",
  accentDomain: "shift",
  isDemoForce: false,
};
let upcomingCacheKey = "0";

let broadcastCache: UnifiedBroadcastNudge = {
  totalUnread: 0,
  notificationUnread: 0,
  workspaceUnread: 0,
  latest: null,
  fingerprint: "0",
  label: "New broadcasts & alerts",
  accentDomain: "shift",
  isDemoForce: false,
};
let broadcastCacheKey = "0";

function readDemoForce(): HomeNudgeDemoForce {
  if (!import.meta.env.DEV) return EMPTY_DEMO_FORCE;
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(DEMO_FORCE_KEY);
  } catch {
    raw = null;
  }
  if (raw === demoForceCacheRaw) return demoForceCache;
  demoForceCacheRaw = raw;
  if (!raw) {
    demoForceCache = EMPTY_DEMO_FORCE;
    return demoForceCache;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<HomeNudgeDemoForce>;
    const domain = parsed.broadcastDomain;
    const validDomain =
      domain === "shift" ||
      domain === "career" ||
      domain === "planner" ||
      domain === "vault" ||
      domain === "labs"
        ? domain
        : null;
    demoForceCache = {
      upcoming: Boolean(parsed.upcoming),
      broadcastDomain: validDomain,
      generation:
        typeof parsed.generation === "number" && Number.isFinite(parsed.generation)
          ? parsed.generation
          : 0,
    };
  } catch {
    demoForceCache = EMPTY_DEMO_FORCE;
  }
  return demoForceCache;
}

function writeDemoForce(next: HomeNudgeDemoForce): void {
  if (!import.meta.env.DEV) return;
  try {
    sessionStorage.setItem(DEMO_FORCE_KEY, JSON.stringify(next));
  } catch {
    // Fail-silent
  }
  demoForceCacheRaw = "__dirty__";
  try {
    window.dispatchEvent(new Event(EMPLOYEE_HOME_NUDGE_DEMO_EVENT));
  } catch {
    // Fail-silent
  }
}

export function getHomeNudgeDemoForce(): HomeNudgeDemoForce {
  return readDemoForce();
}

export function setHomeNudgeDemoForce(patch: Partial<HomeNudgeDemoForce>): void {
  const current = readDemoForce();
  writeDemoForce({
    upcoming: patch.upcoming ?? current.upcoming,
    broadcastDomain:
      patch.broadcastDomain === undefined ? current.broadcastDomain : patch.broadcastDomain,
    generation: patch.generation ?? current.generation,
  });
}

export function clearHomeNudgeDemoForce(): void {
  clearDismissKey("wm_employee_upcoming_shift_nudge_dismissed_v1");
  clearDismissKey("wm_employee_unified_broadcast_nudge_dismissed_v1");
  writeDemoForce(EMPTY_DEMO_FORCE);
}

function clearDismissKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Fail-silent
  }
}

/** DEV: force upcoming nudge visible (clears prior dismiss). */
export function demoForceUpcomingShiftNudge(): void {
  clearDismissKey("wm_employee_upcoming_shift_nudge_dismissed_v1");
  demoForceGeneration += 1;
  setHomeNudgeDemoForce({ upcoming: true, generation: demoForceGeneration });
}

/** DEV: force broadcast banner for a domain accent (clears prior dismiss). */
export function demoForceBroadcastNudge(domain: DomainRegistryKey): void {
  clearDismissKey("wm_employee_unified_broadcast_nudge_dismissed_v1");
  demoForceGeneration += 1;
  setHomeNudgeDemoForce({ broadcastDomain: domain, generation: demoForceGeneration });
}

function computeUpcomingShiftNudge(): UpcomingShiftNudge {
  const force = readDemoForce();
  if (force.upcoming) {
    return {
      count: 1,
      nearest: null,
      fingerprint: `demo-force|upcoming|${force.generation}`,
      accentDomain: "shift",
      isDemoForce: true,
    };
  }

  const today = new Date();
  const todayKey = toDateKey(today);
  const endKey = toDateKey(addDays(today, 7));

  const upcoming = personalCalendarShiftStorage
    .getActive()
    .filter((block) => block.status === "confirmed")
    .filter((block) => block.dateKey >= todayKey && block.dateKey <= endKey)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey) || a.syncedAt - b.syncedAt);

  let count = upcoming.length;
  const nearest = upcoming[0] ?? null;

  if (count === 0) {
    const demoCount = n(readDemo().counts?.upcomingShifts7d, 0);
    if (demoCount > 0) {
      count = demoCount;
    }
  }

  const fingerprint =
    count === 0 ? "0" : nearest ? `${count}|${nearest.id}|${nearest.dateKey}` : `demo|${count}`;

  return {
    count,
    nearest,
    fingerprint,
    accentDomain: "shift",
    isDemoForce: false,
  };
}

function computeUnifiedBroadcastNudge(): UnifiedBroadcastNudge {
  const force = readDemoForce();
  if (force.broadcastDomain) {
    const domain = force.broadcastDomain;
    return {
      totalUnread: 1,
      notificationUnread: 1,
      workspaceUnread: 0,
      latest: null,
      fingerprint: `demo-force|broadcast|${domain}|${force.generation}`,
      label: `${nudgeDomainTitle(domain)} broadcast preview`,
      accentDomain: domain,
      isDemoForce: true,
    };
  }

  const notifications = employeeNotificationsStorage
    .getAll()
    .filter((item) => STREAM_DOMAINS.has(item.domain) && !item.isRead)
    .sort((a, b) => b.createdAt - a.createdAt);

  const notificationUnread = notifications.length;
  const latest = notifications[0] ?? null;

  const workspaceUnread = shiftWorkspacesStorage
    .getAll()
    .reduce((sum, ws) => sum + Math.max(0, ws.unreadCount || 0), 0);

  const demoAlerts = n(readDemo().counts?.alerts, 0);
  const liveTotal = notificationUnread + workspaceUnread;
  const totalUnread = liveTotal > 0 ? liveTotal : demoAlerts;

  const accentDomain = resolveNudgeAccentDomain(latest, workspaceUnread);

  const fingerprint =
    totalUnread === 0
      ? "0"
      : `${totalUnread}|${notificationUnread}|${workspaceUnread}|${latest?.id ?? "demo"}|${latest?.createdAt ?? 0}|${accentDomain}`;

  let label = "New broadcasts & alerts";
  if (latest?.title) {
    label = latest.title;
  } else if (workspaceUnread > 0) {
    label = `${workspaceUnread} workspace update${workspaceUnread === 1 ? "" : "s"}`;
  } else if (totalUnread > 0) {
    label = `${totalUnread} unread alert${totalUnread === 1 ? "" : "s"}`;
  }

  return {
    totalUnread,
    notificationUnread,
    workspaceUnread,
    latest,
    fingerprint,
    label,
    accentDomain,
    isDemoForce: false,
  };
}

export function getUpcomingShiftNudgeSnapshot(): UpcomingShiftNudge {
  const next = computeUpcomingShiftNudge();
  const key = `${next.fingerprint}|${next.isDemoForce ? 1 : 0}`;
  if (key === upcomingCacheKey) {
    return upcomingCache;
  }
  upcomingCacheKey = key;
  upcomingCache = next;
  return upcomingCache;
}

export function getUnifiedBroadcastNudgeSnapshot(): UnifiedBroadcastNudge {
  const next = computeUnifiedBroadcastNudge();
  const key = `${next.fingerprint}|${next.isDemoForce ? 1 : 0}`;
  if (key === broadcastCacheKey) {
    return broadcastCache;
  }
  broadcastCacheKey = key;
  broadcastCache = next;
  return broadcastCache;
}

export function subscribeUpcomingShiftNudge(onStoreChange: () => void): () => void {
  const unsubCal = personalCalendarShiftStorage.subscribe(onStoreChange);
  const onDemo = () => onStoreChange();
  window.addEventListener(EMPLOYEE_HOME_NUDGE_DEMO_EVENT, onDemo);
  return () => {
    unsubCal();
    window.removeEventListener(EMPLOYEE_HOME_NUDGE_DEMO_EVENT, onDemo);
  };
}

export function subscribeUnifiedBroadcastNudge(onStoreChange: () => void): () => void {
  const unsubNotif = employeeNotificationsStorage.subscribe(onStoreChange);
  const unsubWs = shiftWorkspacesStorage.subscribe(onStoreChange);
  const onDemo = () => onStoreChange();
  window.addEventListener(EMPLOYEE_HOME_NUDGE_DEMO_EVENT, onDemo);
  return () => {
    unsubNotif();
    unsubWs();
    window.removeEventListener(EMPLOYEE_HOME_NUDGE_DEMO_EVENT, onDemo);
  };
}

export function subscribeHomeNudgeDemoForce(onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();
  window.addEventListener(EMPLOYEE_HOME_NUDGE_DEMO_EVENT, handler);
  return () => window.removeEventListener(EMPLOYEE_HOME_NUDGE_DEMO_EVENT, handler);
}

/** Stable string snapshot for demo panel useSyncExternalStore. */
export function getHomeNudgeDemoForceSnapshot(): string {
  const force = readDemoForce();
  return `${force.upcoming ? 1 : 0}|${force.broadcastDomain ?? ""}|${force.generation}`;
}
