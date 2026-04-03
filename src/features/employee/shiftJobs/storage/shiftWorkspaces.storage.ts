// src/features/employee/shiftJobs/storage/shiftWorkspaces.storage.ts

export type ShiftWorkspaceCategory = "construction" | "kitchen" | "office" | "delivery" | "other";

export type ShiftWorkspaceStatus = "active" | "upcoming" | "completed" | "left" | "replaced";

export type ShiftWorkspaceUpdate = {
  id: string;
  createdAt: number; // epoch ms
  kind: "system" | "broadcast" | "direct";
  title: string;
  body?: string;
};

export type ShiftWorkspace = {
  id: string;
  postId: string;

  companyName: string;
  jobName: string;
  category: ShiftWorkspaceCategory;

  locationName: string;
  startAt: number;
  endAt: number;

  status: ShiftWorkspaceStatus;

  lastActivityAt: number; // sort key
  unreadCount: number; // employee-side demo only

  updates: ShiftWorkspaceUpdate[];

  // Exit / audit (employee side)
  exitedAt?: number;
  exitReason?: "emergency" | "sick" | "travel" | "other";
  exitNote?: string;

  // Employer operational audit (Phase-0 demo)
  replacedAt?: number;
  replacedReason?: "no_show" | "schedule_change" | "quality_issue" | "other";

  // S7: Employee rating after job completion
  rating?: 1 | 2 | 3 | 4 | 5;
  ratingComment?: string;
  ratedAt?: number;
};

const KEY = "wm_employee_shift_workspaces_v1";
const POSTS_KEY = "wm_employee_shift_posts_demo_v1";
const APPS_KEY = "wm_employee_shift_applications_v1";

// Same-tab refresh for applications page
const APPS_CHANGED_EVENT = "wm:employee-shift-applications-changed";

// Same-tab refresh for workspaces page
const WORKSPACES_CHANGED_EVENT = "wm:employee-shift-workspaces-changed";

// Employer in-app notifications (Phase-0 localStorage)
const EMPLOYER_NOTES_KEY = "wm_employer_notifications_v1";
const EMPLOYER_NOTES_CHANGED_EVENT = "wm:employer-notifications-changed";

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

function safeParse<T>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function safeWriteApps(list: unknown[]) {
  try {
    localStorage.setItem(APPS_KEY, JSON.stringify(list));
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

function notifyAppsChanged() {
  safeDispatch(APPS_CHANGED_EVENT);
}

function notifyWorkspacesChanged() {
  safeDispatch(WORKSPACES_CHANGED_EVENT);
}

function notifyEmployerNotesChanged() {
  safeDispatch(EMPLOYER_NOTES_CHANGED_EVENT);
}

function safeWrite(list: ShiftWorkspace[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // demo-safe ignore
  }

  // Same-tab refresh for workspace UI (single choke point)
  notifyWorkspacesChanged();
}

function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function clampCategory(x: unknown): ShiftWorkspaceCategory {
  if (x === "construction" || x === "kitchen" || x === "office" || x === "delivery") return x;
  return "other";
}

function clampStatus(x: unknown): ShiftWorkspaceStatus {
  if (x === "active" || x === "upcoming" || x === "completed" || x === "left" || x === "replaced") return x;
  return "active";
}

function clampUpdateKind(x: unknown): ShiftWorkspaceUpdate["kind"] {
  if (x === "broadcast" || x === "direct" || x === "system") return x;
  return "system";
}

function clampExitReason(x: unknown): ShiftWorkspace["exitReason"] | undefined {
  if (x === "emergency" || x === "sick" || x === "travel" || x === "other") return x;
  return undefined;
}

function clampReplacedReason(x: unknown): ShiftWorkspace["replacedReason"] | undefined {
  if (x === "no_show" || x === "schedule_change" || x === "quality_issue" || x === "other") return x;
  return undefined;
}

function normalizeUpdates(updatesRaw: unknown): ShiftWorkspaceUpdate[] {
  if (!Array.isArray(updatesRaw)) return [];

  const out: ShiftWorkspaceUpdate[] = [];

  for (const u of updatesRaw) {
    if (!isRecord(u)) continue;

    const uid = getString(u, "id");
    const createdAt = getNumber(u, "createdAt");
    const title = getString(u, "title");

    if (!uid || createdAt === undefined || !title) continue;

    const kind = clampUpdateKind(u["kind"]);
    const body = typeof u["body"] === "string" ? (u["body"] as string) : undefined;

    out.push({ id: uid, createdAt, kind, title, body });
  }

  // Keep newest first for UI convenience
  out.sort((a, b) => b.createdAt - a.createdAt);
  return out;
}

function deriveLastActivityAt(startAt: number, updates: ShiftWorkspaceUpdate[], rawLast?: number): number {
  if (typeof rawLast === "number" && Number.isFinite(rawLast)) return rawLast;

  const newestUpd = updates.length > 0 ? updates[0].createdAt : undefined;
  if (typeof newestUpd === "number" && Number.isFinite(newestUpd)) return newestUpd;

  return startAt;
}

function normalize(list: unknown[]): ShiftWorkspace[] {
  const out: ShiftWorkspace[] = [];

  for (const raw of list) {
    if (!isRecord(raw)) continue;

    const idVal = getString(raw, "id");
    const postId = getString(raw, "postId");
    const companyName = getString(raw, "companyName");
    const jobName = getString(raw, "jobName");
    const locationName = getString(raw, "locationName");
    const startAt = getNumber(raw, "startAt");
    const endAt = getNumber(raw, "endAt");

    // Required core fields (keep strict)
    if (!idVal || !postId || !companyName || !jobName || !locationName) continue;
    if (startAt === undefined || endAt === undefined) continue;

    const status = clampStatus(raw["status"]);
    const category = clampCategory(raw["category"]);

    const updates = normalizeUpdates(raw["updates"]);

    // Backward-compatible defaults (fix "workspace not opening" issues)
    const unreadCountRaw = getNumber(raw, "unreadCount");
    const unreadCount = unreadCountRaw !== undefined ? Math.max(0, Math.floor(unreadCountRaw)) : 0;

    const lastActivityAtRaw = getNumber(raw, "lastActivityAt");
    const lastActivityAt = deriveLastActivityAt(startAt, updates, lastActivityAtRaw);

    const exitReasonRaw = raw["exitReason"];
    const exitReason =
      exitReasonRaw === "emergency" || exitReasonRaw === "sick" || exitReasonRaw === "travel" || exitReasonRaw === "other"
        ? (exitReasonRaw as ShiftWorkspace["exitReason"])
        : undefined;

    const replacedReasonRaw = raw["replacedReason"];
    const replacedReason =
      replacedReasonRaw === "no_show" ||
      replacedReasonRaw === "schedule_change" ||
      replacedReasonRaw === "quality_issue" ||
      replacedReasonRaw === "other"
        ? (replacedReasonRaw as ShiftWorkspace["replacedReason"])
        : undefined;

    out.push({
      id: idVal,
      postId,
      companyName,
      jobName,
      category,
      locationName,
      startAt,
      endAt,
      status,
      lastActivityAt,
      unreadCount,
      updates,
      exitedAt: getNumber(raw, "exitedAt"),
      exitReason: clampExitReason(exitReason),
      exitNote: typeof raw["exitNote"] === "string" ? (raw["exitNote"] as string) : undefined,
      replacedAt: getNumber(raw, "replacedAt"),
      replacedReason: clampReplacedReason(replacedReason),
    });
  }

  return out;
}

type DemoPost = {
  id: string;
  companyName: string;
  jobName: string;
  category?: ShiftWorkspaceCategory;
  locationName: string;
  startAt: number;
  endAt: number;
};

function seedDemoOnce() {
  const existing = normalize(safeParse<unknown>(localStorage.getItem(KEY)));
  if (existing.length > 0) return;

  const posts = safeParse<DemoPost>(localStorage.getItem(POSTS_KEY)).filter(
    (p) => p && typeof p.id === "string" && typeof p.companyName === "string" && typeof p.jobName === "string"
  );

  const now = Date.now();
  const take = posts.slice(0, 2);

  const demo: ShiftWorkspace[] = take.map((p, idx) => {
    const wsId = id("ws");
    const upd: ShiftWorkspaceUpdate[] = [
      {
        id: id("u"),
        createdAt: now - (idx + 1) * 60 * 60 * 1000,
        kind: "system",
        title: "Workspace created (demo)",
        body: "This workspace becomes real after employer confirmation in later steps.",
      },
    ];

    return {
      id: wsId,
      postId: p.id,
      companyName: p.companyName,
      jobName: p.jobName,
      category: clampCategory(p.category),
      locationName: p.locationName ?? "Location",
      startAt: typeof p.startAt === "number" ? p.startAt : now,
      endAt: typeof p.endAt === "number" ? p.endAt : now,
      status: "active",
      lastActivityAt: upd[0].createdAt,
      unreadCount: 1,
      updates: upd,
    };
  });

  safeWrite(demo);
}

function isReadOnlyWorkspaceStatus(s: ShiftWorkspaceStatus): boolean {
  return s === "left" || s === "replaced" || s === "completed";
}

type AppStatus =
  | "applied"
  | "shortlisted"
  | "waiting"
  | "confirmed"
  | "rejected"
  | "withdrawn"
  | "replaced"
  | "exited";

function clampAppStatus(x: unknown): AppStatus | null {
  if (
    x === "applied" ||
    x === "shortlisted" ||
    x === "waiting" ||
    x === "confirmed" ||
    x === "rejected" ||
    x === "withdrawn" ||
    x === "replaced" ||
    x === "exited"
  ) {
    return x;
  }
  return null;
}

function markApplicationsExitedForPost(postId: string) {
  const raw = safeParse<unknown>(localStorage.getItem(APPS_KEY));
  if (raw.length === 0) return;

  let changed = false;

  const next = raw.map((item) => {
    if (!isRecord(item)) return item;

    const postIdVal = getString(item, "postId");
    const statusVal = clampAppStatus(item["status"]);
    if (!postIdVal || !statusVal) return item;
    if (postIdVal !== postId) return item;

    // Preserve terminal states
    if (statusVal === "rejected" || statusVal === "withdrawn" || statusVal === "replaced" || statusVal === "exited") {
      return item;
    }

    changed = true;
    return { ...item, status: "exited" as const };
  });

  if (changed) {
    safeWriteApps(next);
    notifyAppsChanged();
  }
}

type EmployerNote = {
  id: string;
  domain: "shift" | "career" | "workforce";
  title: string;
  body?: string;
  createdAt: number;
  isRead: boolean;
  route?: string;
};

function pushEmployerNotificationShift(title: string, body: string, route?: string) {
  const now = Date.now();
  const note: EmployerNote = {
    id: id("en"),
    domain: "shift",
    title,
    body,
    createdAt: now,
    isRead: false,
    route,
  };

  const existing = safeParse<EmployerNote>(localStorage.getItem(EMPLOYER_NOTES_KEY));
  const next = [note, ...existing].slice(0, 150);

  try {
    localStorage.setItem(EMPLOYER_NOTES_KEY, JSON.stringify(next));
  } catch {
    // demo-safe ignore
  }

  notifyEmployerNotesChanged();
}

function clampText(raw: string, max: number): string {
  const t = raw.trim();
  if (!t) return "";
  return t.length > max ? t.slice(0, max) : t;
}

export const shiftWorkspacesStorage = {
  seedDemoOnce,

  getAll(): ShiftWorkspace[] {
    seedDemoOnce();
    const list = normalize(safeParse<unknown>(localStorage.getItem(KEY)));
    return list.sort((a, b) => b.lastActivityAt - a.lastActivityAt);
  },

  getById(workspaceId: string): ShiftWorkspace | null {
    const list = this.getAll();
    return list.find((w) => w.id === workspaceId) ?? null;
  },

  markRead(workspaceId: string) {
    const list = this.getAll();
    const next: ShiftWorkspace[] = list.map((w) => (w.id === workspaceId ? { ...w, unreadCount: 0 } : w));
    safeWrite(next);
  },

  addUpdate(workspaceId: string, update: Omit<ShiftWorkspaceUpdate, "id">) {
    const list = this.getAll();
    const next: ShiftWorkspace[] = list.map((w) => {
      if (w.id !== workspaceId) return w;
      const upd: ShiftWorkspaceUpdate = { id: id("u"), ...update };
      const updates: ShiftWorkspaceUpdate[] = [upd, ...w.updates].slice(0, 50);
      return {
        ...w,
        updates,
        lastActivityAt: upd.createdAt,
        unreadCount: w.unreadCount + 1,
      };
    });
    safeWrite(next);
  },

  /**
   * Employee -> Employer reply (Phase-0 demo, localStorage only)
   * - stored as update kind: "direct"
   * - does NOT increase employee unreadCount (sender is employee)
   * - creates an employer in-app notification with route to workspace
   */
  replyToEmployer(workspaceId: string, message: string) {
    const msg = clampText(message, 360);
    if (!msg) return;

    const list = this.getAll();
    const target = list.find((w) => w.id === workspaceId);
    if (!target) return;

    if (isReadOnlyWorkspaceStatus(target.status)) return;

    const now = Date.now();

    const upd: ShiftWorkspaceUpdate = {
      id: id("u"),
      createdAt: now,
      kind: "direct",
      title: "Reply (Employee)",
      body: msg,
    };

    const next: ShiftWorkspace[] = list.map((w) => {
      if (w.id !== workspaceId) return w;
      return {
        ...w,
        updates: [upd, ...w.updates].slice(0, 50),
        lastActivityAt: now,
        // employee is the sender; keep unreadCount stable (no artificial badge increase)
        unreadCount: Math.max(0, w.unreadCount),
      };
    });

    safeWrite(next);

    // Employer in-app notification (Phase-0)
    const short = msg.length > 80 ? `${msg.slice(0, 80)}...` : msg;
    const title = "New reply (demo)";
    const body = `${target.jobName} - ${target.companyName}. "${short}"`;
    const route = `/employer/shift/workspace/${workspaceId}`;
    pushEmployerNotificationShift(title, body, route);
  },

  exitWorkspace(workspaceId: string, reason: ShiftWorkspace["exitReason"], note: string) {
    const list = this.getAll();
    const target = list.find((w) => w.id === workspaceId);
    if (!target) return;

    // Prevent illegal transitions
    if (isReadOnlyWorkspaceStatus(target.status)) return;

    const now = Date.now();

    const next: ShiftWorkspace[] = list.map((w) => {
      if (w.id !== workspaceId) return w;

      const upd: ShiftWorkspaceUpdate = {
        id: id("u"),
        createdAt: now,
        kind: "system",
        title: "You left this workspace (demo)",
        body: "Employer will be notified in-app (Phase-0 demo).",
      };

      return {
        ...w,
        status: "left",
        exitedAt: now,
        exitReason: reason,
        exitNote: note?.trim() ? note.trim() : undefined,
        unreadCount: 0,
        updates: [upd, ...w.updates].slice(0, 50),
        lastActivityAt: now,
      };
    });

    safeWrite(next);

    // Keep applications consistent with workspace exit
    markApplicationsExitedForPost(target.postId);

    // Employer in-app notification
    const reasonTxt = reason ? String(reason) : "other";
    const noteTxt = note?.trim() ? ` Note: ${note.trim()}` : "";
    const title = "Worker exited (demo)";
    const body = `${target.jobName} - ${target.companyName}. Reason: ${reasonTxt}.${noteTxt} Action: Fill vacancy from waiting list.`;

    // Route format matches employer dashboard pattern
    const route = `/employer/shift/post/${target.postId}`;
    pushEmployerNotificationShift(title, body, route);
  },

  // S7: Employee rates completed job
  saveRating(workspaceId: string, rating: 1 | 2 | 3 | 4 | 5, comment: string) {
    const list = this.getAll();
    const target = list.find((w) => w.id === workspaceId);
    if (!target) return;
    if (target.status !== "completed") return;
    if (target.rating) return;

    const now = Date.now();
    const trimmed = comment.trim().slice(0, 240);

    const upd: ShiftWorkspaceUpdate = {
      id: id("u"),
      createdAt: now,
      kind: "system",
      title: "You rated this job",
      body: `Rating: ${rating} star${rating > 1 ? "s" : ""}${trimmed ? `. "${trimmed}"` : ""}`,
    };

    const next: ShiftWorkspace[] = list.map((w) => {
      if (w.id !== workspaceId) return w;
      return {
        ...w,
        rating,
        ratingComment: trimmed || undefined,
        ratedAt: now,
        updates: [upd, ...w.updates].slice(0, 50),
        lastActivityAt: now,
      };
    });

    safeWrite(next);
  },

  // Employer operational action (Phase-0 demo): mark a workspace as replaced
  markReplaced(workspaceId: string, reason: ShiftWorkspace["replacedReason"]) {
    const list = this.getAll();
    const now = Date.now();

    const next: ShiftWorkspace[] = list.map((w) => {
      if (w.id !== workspaceId) return w;

      const upd: ShiftWorkspaceUpdate = {
        id: id("u"),
        createdAt: now,
        kind: "system",
        title: "Assignment replaced by employer (demo)",
        body: "Your assignment was replaced. You will not be part of this workspace anymore.",
      };

      return {
        ...w,
        status: "replaced",
        replacedAt: now,
        replacedReason: reason ?? "other",
        unreadCount: 0,
        updates: [upd, ...w.updates].slice(0, 50),
        lastActivityAt: now,
      };
    });

    safeWrite(next);
  },
} as const;