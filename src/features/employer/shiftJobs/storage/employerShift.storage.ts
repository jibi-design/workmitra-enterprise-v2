// src/features/employer/shiftJobs/storage/employerShift.storage.ts

import { ROUTE_PATHS } from "../../../../app/router/routePaths";

export type ExperienceLabel = "helper" | "fresher_ok" | "experienced";
export type ShiftCategory = string;

export type AnalysisStatus = "not_started" | "done";

export type ApplicantStatus =
  | "applied"
  | "shortlisted"
  | "waiting"
  | "confirmed"
  | "rejected"
  | "withdrawn"
  | "replaced"
  | "exited";

export type PriorityTag = "priority" | "good" | "review";

export type PostSettings = {
  backupSlots: number;
  autoPromoteBackup: boolean;
  notifyBackup: boolean;
};

export type ShiftPost = {
  id: string;
  companyName: string;
  jobName: string;
  category: ShiftCategory;
  experience: ExperienceLabel;
  payPerDay: number;
  locationName: string;
  distanceKm: number;
  startAt: number;
  endAt: number;
  description?: string;
  shiftTiming?: string;
  mapsLink?: string;
  isHiddenFromSearch?: boolean;
  mustHave: string[];
  goodToHave: string[];
  whatWeProvide?: string[];
  quickQuestions?: { id: string; text: string }[];
  dressCode?: string;
  jobType?: "one-time" | "weekly" | "custom";
  vacancies: number;
  waitingBuffer: number;
  analysisStatus: AnalysisStatus;
  analyzedAt?: number;
  analysisNote?: string;
  shortlistIds: string[];
  waitingIds: string[];
  confirmedIds: string[];
  rejectedIds: string[];
 status?: "active" | "completed" | "cancelled";
  settings?: PostSettings;
};

export type ApplicantProfileSnapshot = {
  uniqueId?: string;
  fullName?: string;
  city?: string;
  experience?: string;
  skills?: string[];
  languages?: string[];
};

export type EmployeeShiftApplication = {
  id: string;
  postId: string;
  createdAt: number;
  status: ApplicantStatus;
  profileSnapshot?: ApplicantProfileSnapshot;
  mustHaveAnswers: Record<string, "meets" | "not_sure" | "dont_meet">;
  goodToHaveAnswers: Record<string, "meets" | "not_sure" | "dont_meet">;
  notes: Record<string, string>;
  withdrawnAt?: number;
 replacedAt?: number;
  replacedReason?: "no_show" | "schedule_change" | "quality_issue" | "other";
  quickAnswers?: Record<string, "yes" | "no">;
  rating?: 1 | 2 | 3 | 4 | 5;
  ratingComment?: string;
  ratedAt?: number;
  priorityTag?: PriorityTag;
};

export type EmployeeNotification = {
  id: string;
  domain: "shift" | "career" | "workforce";
  title: string;
  body?: string;
  createdAt: number;
  isRead: boolean;
  route?: string;
};

export type EmployeeWorkspaceUpdate = {
  id: string;
  createdAt: number;
  kind: "system" | "broadcast" | "direct";
  title: string;
  body?: string;
};

export type EmployeeWorkspace = {
  id: string;
  postId: string;
  companyName: string;
  jobName: string;
  category: ShiftCategory;
  locationName: string;
  startAt: number;
  endAt: number;
  status: "active" | "upcoming" | "completed" | "left" | "replaced";
  lastActivityAt: number;
  unreadCount: number;
  updates: EmployeeWorkspaceUpdate[];
  exitedAt?: number;
  exitReason?: "emergency" | "sick" | "travel" | "other";
  exitNote?: string;
  replacedAt?: number;
  replacedReason?: "no_show" | "schedule_change" | "quality_issue" | "other";
};

export type EmployerShiftActivityKind =
  | "post_created"
  | "analysis_run"
  | "analysis_reset"
  | "hidden"
  | "unhidden"
  | "move_shortlist"
  | "move_waiting"
  | "candidate_rejected"
  | "confirmed"
  | "replaced";

export type EmployerShiftActivityEntry = {
  id: string;
  postId: string;
  kind: EmployerShiftActivityKind;
  createdAt: number;
  title: string;
  body?: string;
  route?: string;
};

const EMP_POSTS_KEY = "wm_employer_shift_posts_v1";
const EMPLOYEE_SEARCH_POSTS_KEY = "wm_employee_shift_posts_demo_v1";
const EMPLOYEE_APPS_KEY = "wm_employee_shift_applications_v1";
const EMPLOYEE_NOTES_KEY = "wm_employee_notifications_v1";
const EMPLOYEE_WORKSPACES_KEY = "wm_employee_shift_workspaces_v1";
const EMPLOYER_SHIFT_ACTIVITY_KEY = "wm_employer_shift_activity_log_v1";

const EMPLOYER_SHIFT_ACTIVITY_CHANGED_EVENT = "wm:employer-shift-activity-changed";
const EMPLOYEE_NOTES_CHANGED_EVENT = "wm:employee-notifications-changed";
const EMPLOYEE_APPS_CHANGED_EVENT = "wm:employee-shift-applications-changed";
const EMPLOYEE_WORKSPACES_CHANGED_EVENT = "wm:employee-shift-workspaces-changed";
const EMPLOYER_SHIFT_POSTS_CHANGED_EVENT = "wm:employer-shift-posts-changed";

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

function getStringArray(r: UnknownRecord, k: string): string[] {
  const v = r[k];
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
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

function safeWrite(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
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

function notifyEmployeeNotesChanged() { safeDispatch(EMPLOYEE_NOTES_CHANGED_EVENT); }
function notifyEmployeeAppsChanged() { safeDispatch(EMPLOYEE_APPS_CHANGED_EVENT); }
function notifyEmployeeWorkspacesChanged() { safeDispatch(EMPLOYEE_WORKSPACES_CHANGED_EVENT); }
function notifyEmployerShiftPostsChanged() { safeDispatch(EMPLOYER_SHIFT_POSTS_CHANGED_EVENT); }
function notifyEmployerShiftActivityChanged() { safeDispatch(EMPLOYER_SHIFT_ACTIVITY_CHANGED_EVENT); }

function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function clampCategory(x: unknown): ShiftCategory {
  if (typeof x === "string" && x.trim().length > 0) return x.trim();
  return "Other";
}

function clampExperience(x: unknown): ExperienceLabel {
  if (x === "helper" || x === "fresher_ok" || x === "experienced") return x;
  return "helper";
}

function clampAnalysisStatus(x: unknown): AnalysisStatus {
  return x === "done" ? "done" : "not_started";
}

function uniq(list: string[]): string[] {
  const s = new Set<string>();
  const out: string[] = [];
  for (const x of list) {
    if (!x || typeof x !== "string") continue;
    if (s.has(x)) continue;
    s.add(x); out.push(x);
  }
  return out;
}

function normalizePost(raw: unknown): ShiftPost | null {
  if (!isRecord(raw)) return null;
  const idVal = getString(raw, "id");
  if (!idVal) return null;
  const mustHave = getStringArray(raw, "mustHave");
  const goodToHave = getStringArray(raw, "goodToHave");
  const vacanciesRaw = getNumber(raw, "vacancies");
  const waitingBufferRaw = getNumber(raw, "waitingBuffer");
  const vacancies = vacanciesRaw !== undefined && vacanciesRaw > 0 ? Math.floor(vacanciesRaw) : 1;
  const waitingBuffer = waitingBufferRaw !== undefined && waitingBufferRaw >= 0 ? Math.floor(waitingBufferRaw) : 2;
  return {
    id: idVal,
    companyName: getString(raw, "companyName") ?? "Company",
    jobName: getString(raw, "jobName") ?? "Job",
    category: clampCategory(raw["category"]),
    experience: clampExperience(raw["experience"]),
    payPerDay: getNumber(raw, "payPerDay") ?? 0,
    locationName: getString(raw, "locationName") ?? "Location",
    distanceKm: getNumber(raw, "distanceKm") ?? 0,
    startAt: getNumber(raw, "startAt") ?? Date.now(),
    endAt: getNumber(raw, "endAt") ?? Date.now(),
    description: getString(raw, "description") ?? "",
    shiftTiming: getString(raw, "shiftTiming") ?? "",
    mapsLink: getString(raw, "mapsLink") ?? "",
    isHiddenFromSearch: !!raw["isHiddenFromSearch"],
   mustHave,
    goodToHave,
        whatWeProvide: getStringArray(raw, "whatWeProvide"),
   dressCode: getString(raw, "dressCode"),
    jobType: (() => { const v = raw["jobType"]; return (v === "weekly" || v === "custom") ? v : "one-time"; })(),
    quickQuestions: (() => {
      const arr = raw["quickQuestions"];
      if (!Array.isArray(arr)) return [];
      return (arr as unknown[]).filter(isRecord).map((q) => {
        const r = q as Record<string, unknown>;
        return { id: getString(r, "id") ?? "", text: getString(r, "text") ?? "" };
      }).filter((q) => q.id && q.text);
    })(),
    vacancies,
    waitingBuffer,
    analysisStatus: clampAnalysisStatus(raw["analysisStatus"]),
    analyzedAt: getNumber(raw, "analyzedAt"),
    analysisNote: getString(raw, "analysisNote"),
   shortlistIds: uniq(getStringArray(raw, "shortlistIds")),
    waitingIds: uniq(getStringArray(raw, "waitingIds")),
    confirmedIds: uniq(getStringArray(raw, "confirmedIds")),
    rejectedIds: uniq(getStringArray(raw, "rejectedIds")),
    status: (raw["status"] === "completed" || raw["status"] === "cancelled") ? raw["status"] as "completed" | "cancelled" : "active",
    settings: isRecord(raw["settings"]) ? {
      backupSlots: typeof raw["settings"]["backupSlots"] === "number" ? Math.max(0, raw["settings"]["backupSlots"] as number) : 2,
      autoPromoteBackup: raw["settings"]["autoPromoteBackup"] !== false,
      notifyBackup: raw["settings"]["notifyBackup"] !== false,
    } : { backupSlots: 2, autoPromoteBackup: true, notifyBackup: true },
  };
}

function readEmployerPosts(): ShiftPost[] {
  const raw = localStorage.getItem(EMP_POSTS_KEY);
  const list = safeParse<unknown>(raw).map(normalizePost).filter((x): x is ShiftPost => x !== null);
  return list.sort((a, b) => (b.analyzedAt ?? 0) - (a.analyzedAt ?? 0));
}

function writeEmployerPosts(posts: ShiftPost[]) {
  safeWrite(EMP_POSTS_KEY, posts);
  notifyEmployerShiftPostsChanged();
}

function syncToEmployeeSearch(posts: ShiftPost[]) {
  const employerMapped = posts.map((p) => ({
    id: p.id,
    companyName: p.companyName,
    jobName: p.jobName,
    category: p.category,
    experience: p.experience,
    payPerDay: p.payPerDay,
    locationName: p.locationName,
    distanceKm: p.distanceKm,
    startAt: p.startAt,
    endAt: p.endAt,
    description: p.description ?? "",
    shiftTiming: p.shiftTiming ?? "",
    mapsLink: p.mapsLink ?? "",
    isHiddenFromSearch: !!p.isHiddenFromSearch,
   mustHave: p.mustHave,
    goodToHave: p.goodToHave,
    whatWeProvide: p.whatWeProvide,
    quickQuestions: p.quickQuestions,
   dressCode: p.dressCode,
    jobType: p.jobType,
  }));
  const existing = safeParse<Record<string, unknown>>(localStorage.getItem(EMPLOYEE_SEARCH_POSTS_KEY));
  const employerIds = new Set(employerMapped.map((p) => p.id));
  const nonEmployer = existing.filter((p) => {
    if (!isRecord(p)) return false;
    const pid = getString(p as UnknownRecord, "id");
    return pid ? !employerIds.has(pid) : true;
  });
  safeWrite(EMPLOYEE_SEARCH_POSTS_KEY, [...employerMapped, ...nonEmployer]);
}

function readEmployeeApps(): EmployeeShiftApplication[] {
  const list = safeParse<EmployeeShiftApplication>(localStorage.getItem(EMPLOYEE_APPS_KEY));
  return list
    .filter((a) => a && typeof a.id === "string" && typeof a.postId === "string" && typeof a.createdAt === "number")
    .sort((a, b) => b.createdAt - a.createdAt);
}

function writeEmployeeApps(apps: EmployeeShiftApplication[]) {
  safeWrite(EMPLOYEE_APPS_KEY, apps);
  notifyEmployeeAppsChanged();
}

function readEmployeeWorkspaces(): EmployeeWorkspace[] {
  return safeParse<EmployeeWorkspace>(localStorage.getItem(EMPLOYEE_WORKSPACES_KEY));
}

function writeEmployeeWorkspaces(list: EmployeeWorkspace[]) {
  safeWrite(EMPLOYEE_WORKSPACES_KEY, list);
  notifyEmployeeWorkspacesChanged();
}

function findWorkspaceByPostId(postId: string): EmployeeWorkspace | null {
  const list = readEmployeeWorkspaces();
  const found = list.find((w) => w && typeof w === "object" && (w as UnknownRecord)["postId"] === postId) as EmployeeWorkspace | undefined;
  return found ?? null;
}

function normalizeActivity(raw: unknown): EmployerShiftActivityEntry | null {
  if (!isRecord(raw)) return null;
  const idVal = getString(raw, "id");
  const postId = getString(raw, "postId");
  const kind = getString(raw, "kind");
  const createdAt = getNumber(raw, "createdAt");
  const title = getString(raw, "title");
  if (!idVal || !postId || !kind || createdAt === undefined || !title) return null;
  const okKind =
    kind === "post_created" || kind === "analysis_run" || kind === "analysis_reset" ||
    kind === "hidden" || kind === "unhidden" || kind === "move_shortlist" ||
    kind === "move_waiting" || kind === "candidate_rejected" || kind === "confirmed" || kind === "replaced";
  if (!okKind) return null;
  const body = typeof raw["body"] === "string" ? (raw["body"] as string) : undefined;
  const route = typeof raw["route"] === "string" ? (raw["route"] as string) : undefined;
  return { id: idVal, postId, kind: kind as EmployerShiftActivityKind, createdAt, title, body, route };
}

function readEmployerActivityAll(): EmployerShiftActivityEntry[] {
  const raw = localStorage.getItem(EMPLOYER_SHIFT_ACTIVITY_KEY);
  const list = safeParse<unknown>(raw).map(normalizeActivity).filter((x): x is EmployerShiftActivityEntry => x !== null);
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

function writeEmployerActivityAll(list: EmployerShiftActivityEntry[]) {
  safeWrite(EMPLOYER_SHIFT_ACTIVITY_KEY, list);
  notifyEmployerShiftActivityChanged();
}

function pushEmployerActivity(entry: Omit<EmployerShiftActivityEntry, "id" | "createdAt"> & { createdAt?: number }) {
  const now = typeof entry.createdAt === "number" ? entry.createdAt : Date.now();
  const item: EmployerShiftActivityEntry = {
    id: id("al"), postId: entry.postId, kind: entry.kind,
    createdAt: now, title: entry.title, body: entry.body, route: entry.route,
  };
  const existing = readEmployerActivityAll();
  writeEmployerActivityAll([item, ...existing].slice(0, 300));
}

function pushEmployeeNotification(title: string, body: string, route?: string) {
  const now = Date.now();
  const note: EmployeeNotification = {
    id: id("n"), domain: "shift", title, body,
    createdAt: now, isRead: false, route,
  };
  const existing = safeParse<EmployeeNotification>(localStorage.getItem(EMPLOYEE_NOTES_KEY));
  safeWrite(EMPLOYEE_NOTES_KEY, [note, ...existing].slice(0, 100));
  notifyEmployeeNotesChanged();
}

function hasSimilarEmployeeNote(signature: string): boolean {
  const existing = safeParse<EmployeeNotification>(localStorage.getItem(EMPLOYEE_NOTES_KEY));
  return existing.some((n) => typeof n?.body === "string" && n.body.includes(signature));
}

function createEmployeeWorkspaceFromPost(post: ShiftPost): string {
  const existing = findWorkspaceByPostId(post.id);
  if (existing) return existing.id;
  const now = Date.now();
  const wsId = id("ws");
  const upd: EmployeeWorkspaceUpdate = {
    id: id("u"), createdAt: now, kind: "system",
    title: "Workspace created",
    body: "Employer confirmed your assignment. This workspace is your official channel.",
  };
  const ws: EmployeeWorkspace = {
    id: wsId, postId: post.id,
    companyName: post.companyName, jobName: post.jobName,
    category: post.category, locationName: post.locationName,
    startAt: post.startAt, endAt: post.endAt,
    status: "active", lastActivityAt: now,
    unreadCount: 1, updates: [upd],
  };
  const list = readEmployeeWorkspaces();
  writeEmployeeWorkspaces([ws, ...list].slice(0, 100));
  return wsId;
}

function markEmployeeWorkspaceReplaced(
  postId: string,
  companyName: string,
  jobName: string,
  reason: EmployeeWorkspace["replacedReason"]
) {
  const now = Date.now();
  const list = readEmployeeWorkspaces();
  const next: EmployeeWorkspace[] = list.map((w): EmployeeWorkspace => {
    if (!w || typeof w !== "object") return w;
    const wr = w as unknown as UnknownRecord;
    if (wr["postId"] !== postId) return w;
    const upd: EmployeeWorkspaceUpdate = {
      id: id("u"), createdAt: now, kind: "system",
      title: "Assignment replaced by employer",
      body: "Your assignment was replaced. You will not be part of this workspace anymore.",
    };
    const updatesExisting = wr["updates"] as unknown;
    const updates = Array.isArray(updatesExisting)
      ? ([upd, ...(updatesExisting as EmployeeWorkspaceUpdate[])].slice(0, 50) as EmployeeWorkspaceUpdate[])
      : [upd];
    const safeCompanyName = typeof companyName === "string" && companyName.trim().length > 0
      ? companyName : (wr["companyName"] as string) ?? "Company";
    const safeJobName = typeof jobName === "string" && jobName.trim().length > 0
      ? jobName : (wr["jobName"] as string) ?? "Job";
    return {
      ...(w as EmployeeWorkspace),
      status: "replaced" as const, replacedAt: now,
      replacedReason: reason ?? "other", unreadCount: 0,
      updates, lastActivityAt: now,
      companyName: safeCompanyName, jobName: safeJobName,
    };
  });
  writeEmployeeWorkspaces(next);
}

function scoreApp(post: ShiftPost, app: EmployeeShiftApplication): number {
  let score = 0;
  for (const req of post.mustHave) {
    const ans = app.mustHaveAnswers?.[req];
    if (ans === "meets") score += 10;
    else if (ans === "not_sure") score += 2;
    else score -= 5;
  }
  for (const req of post.goodToHave) {
    const ans = app.goodToHaveAnswers?.[req];
    if (ans === "meets") score += 3;
    else if (ans === "not_sure") score += 1;
  }
  const ageHours = Math.max(0, (Date.now() - app.createdAt) / (1000 * 60 * 60));
  score += Math.max(0, 2 - ageHours / 24);
  return score;
}

function reasonLabelReplace(r: EmployeeShiftApplication["replacedReason"]): string {
  if (r === "no_show") return "No show";
  if (r === "schedule_change") return "Schedule change";
  if (r === "quality_issue") return "Quality issue";
  return "Other";
}

// GAP 3 FIX: rich shift details for confirmed notification
function buildConfirmNotificationBody(post: ShiftPost, signature: string): string {
  try {
    const dateStr = new Date(post.startAt).toLocaleDateString(
      undefined, { weekday: "short", month: "short", day: "numeric" }
    );
    const timeStr = new Date(post.startAt).toLocaleTimeString(
      undefined, { hour: "2-digit", minute: "2-digit" }
    );
    const pay = post.payPerDay > 0 ? `Pay: ${post.payPerDay}/day. ` : "";
    return (
      `${signature} ${post.jobName} at ${post.companyName}. ` +
      `Date: ${dateStr} ${timeStr}. ` +
      `Location: ${post.locationName}. ` +
      `${pay}` +
      `Your workspace is ready.`
    );
  } catch {
    return `${signature} ${post.jobName} at ${post.companyName}. You are confirmed. Workspace ready.`;
  }
}

export const employerShiftStorage = {
  getPosts(): ShiftPost[] {
    const posts = readEmployerPosts();
    syncToEmployeeSearch(posts);
    return posts;
  },

  getPost(postId: string): ShiftPost | null {
    return this.getPosts().find((p) => p.id === postId) ?? null;
  },

  getActivityForPost(postId: string): EmployerShiftActivityEntry[] {
    return readEmployerActivityAll().filter((a) => a.postId === postId).slice(0, 50);
  },

  createPost(
    input: Omit<ShiftPost, "id" | "analysisStatus" | "shortlistIds" | "waitingIds" | "confirmedIds" | "rejectedIds">
  ) {
    const posts = readEmployerPosts();
    const post: ShiftPost = {
      ...input, id: id("sp"), analysisStatus: "not_started",
      shortlistIds: [], waitingIds: [], confirmedIds: [], rejectedIds: [],
    };
    const next = [post, ...posts];
    writeEmployerPosts(next);
    syncToEmployeeSearch(next);
    pushEmployerActivity({
      postId: post.id, kind: "post_created", title: "Post created",
      body: `${post.jobName} - ${post.companyName}. Vacancies: ${post.vacancies}. Waiting buffer: ${post.waitingBuffer}.`,
      route: ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", post.id),
    });
    return post.id;
  },

  setHidden(postId: string, hidden: boolean) {
    const posts = readEmployerPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const next = posts.map((p) => (p.id === postId ? { ...p, isHiddenFromSearch: hidden } : p));
    writeEmployerPosts(next);
    syncToEmployeeSearch(next);
    pushEmployerActivity({
      postId, kind: hidden ? "hidden" : "unhidden",
      title: hidden ? "Hidden from search" : "Unhidden from search",
      body: `${post.jobName} - ${post.companyName}.`,
      route: ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", postId),
    });
  },

  analyzeOnce(postId: string, opts: { hideFromSearch: boolean }) {
    const posts = readEmployerPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post || post.analysisStatus === "done") return;
    const allApps = readEmployeeApps().filter((a) => a.postId === postId);
    const pool = allApps.filter((a) => a.status === "applied");
    const ranked = pool
      .map((a) => ({ a, score: scoreApp(post, a) }))
      .sort((x, y) => y.score - x.score)
      .map((x) => x.a);
    const shortlist = ranked.slice(0, post.vacancies).map((a) => a.id);
    const waiting = ranked.slice(post.vacancies, post.vacancies + post.waitingBuffer).map((a) => a.id);
    const now = Date.now();
    const nextPosts = posts.map((p) =>
      p.id === postId
        ? { ...p, analysisStatus: "done" as const, analyzedAt: now, shortlistIds: shortlist, waitingIds: waiting, analysisNote: "Auto-suggested by analysis.", isHiddenFromSearch: opts.hideFromSearch ? true : p.isHiddenFromSearch }
        : p
    );
    writeEmployerPosts(nextPosts);
    syncToEmployeeSearch(nextPosts);
    const apps = readEmployeeApps();
    writeEmployeeApps(apps.map((a) => {
      if (a.postId !== postId || a.status !== "applied") return a;
      if (shortlist.includes(a.id)) return { ...a, status: "shortlisted" as const };
      if (waiting.includes(a.id)) return { ...a, status: "waiting" as const };
      return a;
    }));
    pushEmployerActivity({
      postId, kind: "analysis_run", title: "Analysis run",
      body: `Shortlist: ${shortlist.length}. Waiting: ${waiting.length}. ${opts.hideFromSearch ? "Post hidden from search." : ""}`.trim(),
      route: ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", postId),
      createdAt: now,
    });
    for (let i = 0; i < shortlist.length; i++) {
      pushEmployeeNotification("Shortlisted", `${post.jobName} - ${post.companyName}. You are shortlisted.`, ROUTE_PATHS.employeeShiftApplications);
    }
    for (let i = 0; i < waiting.length; i++) {
      pushEmployeeNotification("Waiting list", `${post.jobName} - ${post.companyName}. You are in waiting list.`, ROUTE_PATHS.employeeShiftApplications);
    }
  },

  resetAnalysis(postId: string, reason: string, opts: { unhideFromSearch?: boolean }) {
    const posts = readEmployerPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const nextPosts = posts.map((p) =>
      p.id === postId
        ? { ...p, analysisStatus: "not_started" as const, analyzedAt: undefined, analysisNote: `Reset: ${reason}`, shortlistIds: [], waitingIds: [], rejectedIds: p.rejectedIds, isHiddenFromSearch: opts.unhideFromSearch ? false : p.isHiddenFromSearch }
        : p
    );
    writeEmployerPosts(nextPosts);
    syncToEmployeeSearch(nextPosts);
    writeEmployeeApps(readEmployeeApps().map((a) => {
      if (a.postId !== postId) return a;
      if (a.status === "shortlisted" || a.status === "waiting") return { ...a, status: "applied" as const };
      return a;
    }));
    pushEmployerActivity({
      postId, kind: "analysis_reset", title: "Analysis reset",
      body: `Reason: ${reason}.${opts.unhideFromSearch ? " Post unhidden from search." : ""}`,
      route: ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", postId),
    });
  },

  moveToShortlist(postId: string, appId: string) {
    const posts = readEmployerPosts();
    if (!posts.find((p) => p.id === postId)) return;
    const nextPosts = posts.map((p) => {
      if (p.id !== postId) return p;
      return { ...p, shortlistIds: uniq([appId, ...p.shortlistIds]), waitingIds: p.waitingIds.filter((x) => x !== appId) };
    });
    writeEmployerPosts(nextPosts);
    writeEmployeeApps(readEmployeeApps().map((a) => (a.id === appId ? { ...a, status: "shortlisted" as const } : a)));
    syncToEmployeeSearch(nextPosts);
    pushEmployerActivity({
      postId, kind: "move_shortlist", title: "Moved to shortlist",
      body: `Candidate ${appId.slice(-6).toUpperCase()} added to shortlist.`,
      route: ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", postId),
    });
  },

  moveToWaiting(postId: string, appId: string) {
    const posts = readEmployerPosts();
    if (!posts.find((p) => p.id === postId)) return;
    const nextPosts = posts.map((p) => {
      if (p.id !== postId) return p;
      return { ...p, shortlistIds: p.shortlistIds.filter((x) => x !== appId), waitingIds: uniq([appId, ...p.waitingIds]) };
    });
    writeEmployerPosts(nextPosts);
    writeEmployeeApps(readEmployeeApps().map((a) => (a.id === appId ? { ...a, status: "waiting" as const } : a)));
    syncToEmployeeSearch(nextPosts);
    pushEmployerActivity({
      postId, kind: "move_waiting", title: "Moved to waiting",
      body: `Candidate ${appId.slice(-6).toUpperCase()} moved to waiting list.`,
      route: ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", postId),
    });
  },

  removeFromPicks(postId: string, appId: string, reason: string) {
    const posts = readEmployerPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const nextPosts = posts.map((p) => {
      if (p.id !== postId) return p;
      return { ...p, shortlistIds: p.shortlistIds.filter((x) => x !== appId), waitingIds: p.waitingIds.filter((x) => x !== appId), rejectedIds: uniq([appId, ...p.rejectedIds]) };
    });
    writeEmployerPosts(nextPosts);
    syncToEmployeeSearch(nextPosts);
    writeEmployeeApps(readEmployeeApps().map((a) => (a.id === appId ? { ...a, status: "rejected" as const } : a)));
    pushEmployerActivity({
      postId, kind: "candidate_rejected", title: "Candidate rejected",
      body: `Candidate ${appId.slice(-6).toUpperCase()}. Reason: ${reason}.`,
      route: ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", postId),
    });
    pushEmployeeNotification(
      "Application update",
      `${post.jobName} - ${post.companyName}. Status: Rejected. Reason: ${reason}`,
      ROUTE_PATHS.employeeShiftApplications
    );
  },

  confirm(postId: string, appId: string) {
    const posts = readEmployerPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const apps = readEmployeeApps();
    const target = apps.find((a) => a.id === appId);
    if (!target) return;

    // Idempotent: already confirmed
    if (target.status === "confirmed") {
      const existingWs = findWorkspaceByPostId(postId);
      if (existingWs) return existingWs.id;
      return createEmployeeWorkspaceFromPost(post);
    }

    const nextPosts = posts.map((p) => {
      if (p.id !== postId) return p;
      return {
        ...p,
        shortlistIds: p.shortlistIds.filter((x) => x !== appId),
        waitingIds: p.waitingIds.filter((x) => x !== appId),
        confirmedIds: uniq([appId, ...p.confirmedIds]),
      };
    });
    writeEmployerPosts(nextPosts);
    syncToEmployeeSearch(nextPosts);
    writeEmployeeApps(apps.map((a) => (a.id === appId ? { ...a, status: "confirmed" as const } : a)));

    const wsId = createEmployeeWorkspaceFromPost(post);

    pushEmployerActivity({
      postId, kind: "confirmed", title: "Worker confirmed",
      body: `Candidate ${appId.slice(-6).toUpperCase()} confirmed. Workspace ${wsId.slice(-6).toUpperCase()} created.`,
      route: ROUTE_PATHS.employerShiftWorkspace.replace(":workspaceId", wsId),
    });

    // GAP 3 FIX: rich notification with shift details
    const signature = `[CONFIRMED:${postId}:${appId}]`;
    if (!hasSimilarEmployeeNote(signature)) {
      pushEmployeeNotification(
        "You are confirmed!",
        buildConfirmNotificationBody(post, signature),
        ROUTE_PATHS.employeeShiftWorkspaces
      );
    }

    return wsId;
  },

  replaceConfirmed(postId: string, appId: string, reason: EmployeeShiftApplication["replacedReason"]) {
    const posts = readEmployerPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const now = Date.now();

    // Mark replaced in apps
    writeEmployeeApps(readEmployeeApps().map((a) =>
      a.id === appId ? { ...a, status: "replaced" as const, replacedAt: now, replacedReason: reason ?? "other" } : a
    ));

    // Mark workspace replaced on employee side
    markEmployeeWorkspaceReplaced(postId, post.companyName, post.jobName, reason ?? "other");

    // S6 GAP B+C FIX: remove from confirmedIds, auto-promote first waiting -> shortlist
    const nextPosts = posts.map((p) => {
      if (p.id !== postId) return p;
      const newConfirmed = p.confirmedIds.filter((x) => x !== appId);
      const firstWaiting = p.waitingIds[0] ?? null;
      const newWaiting = firstWaiting ? p.waitingIds.slice(1) : p.waitingIds;
      const newShortlist = firstWaiting ? uniq([firstWaiting, ...p.shortlistIds]) : p.shortlistIds;
      return { ...p, confirmedIds: newConfirmed, waitingIds: newWaiting, shortlistIds: newShortlist };
    });
    writeEmployerPosts(nextPosts);
    syncToEmployeeSearch(nextPosts);

    // Notify promoted candidate
    const updatedPost = nextPosts.find((p) => p.id === postId);
    const promoted = updatedPost?.shortlistIds[0] ?? null;
    if (promoted) {
      writeEmployeeApps(readEmployeeApps().map((a) =>
        a.id === promoted ? { ...a, status: "shortlisted" as const } : a
      ));
      pushEmployeeNotification(
        "Shortlisted",
        `${post.jobName} - ${post.companyName}. A vacancy opened and you have been moved to Selected list.`,
        ROUTE_PATHS.employeeShiftApplications
      );
    }

    pushEmployerActivity({
      postId, kind: "replaced", title: "Worker replaced",
      body: `Candidate ${appId.slice(-6).toUpperCase()} replaced. Reason: ${reasonLabelReplace(reason)}.${promoted ? " Next waiting candidate promoted to shortlist." : ""}`,
      route: ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", postId),
      createdAt: now,
    });

    pushEmployeeNotification(
      "Assignment replaced",
      `${post.jobName} - ${post.companyName}. Your assignment was replaced by employer.`,
      ROUTE_PATHS.employeeShiftApplications
    );
  },

  editPost(postId: string, updates: {
    jobName?: string; description?: string; shiftTiming?: string;
    payPerDay?: number; startAt?: number; endAt?: number;
    locationName?: string; dressCode?: string;
  }) {
    const posts = this.getPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) return false;
    const next = posts.map((p) =>
      p.id === postId ? { ...p, ...updates } : p
    );
    writeEmployerPosts(next);
    syncToEmployeeSearch(next);
    pushEmployerActivity({
      postId, kind: "post_created",
      title: "Post updated",
      body: `${post.jobName} details were updated.`,
      route: ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", postId),
    });
    /* Notify confirmed workers */
    const confirmedCount = post.confirmedIds.length;
    if (confirmedCount > 0) {
      for (let i = 0; i < confirmedCount; i++) {
        pushEmployeeNotification(
          "Shift details updated",
          `${post.jobName} at ${post.companyName} has been updated. Please review the changes.`,
          ROUTE_PATHS.employeeShiftWorkspaces,
        );
      }
    }
    return true;
  },

  deletePost(postId: string) {
    const posts = this.getPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) return false;
    const confirmedCount = post.confirmedIds.length;
    if (confirmedCount > 0) {
      for (let i = 0; i < confirmedCount; i++) {
        pushEmployeeNotification(
          "Shift cancelled",
          `${post.jobName} at ${post.companyName} has been cancelled by the employer.`,
          ROUTE_PATHS.employeeShiftWorkspaces,
        );
      }
    }
    const next = posts.filter((p) => p.id !== postId);
    writeEmployerPosts(next);
    syncToEmployeeSearch(next);
    return true;
  },

  checkExpiredPosts(): void {
    const now = Date.now();
    const posts = readEmployerPosts();
    let changed = false;
    const next = posts.map((p) => {
      if (p.status === "completed" || p.status === "cancelled") return p;
      if (p.endAt > now) return p;
      /* Shift date has passed */
      if (p.confirmedIds.length > 0) {
        /* Has confirmed workers → mark completed (triggers rating nudge) */
        changed = true;
        return { ...p, status: "completed" as const };
      } else {
        /* Zero applications or only pending → mark cancelled as "expired" */
        const appsRaw = localStorage.getItem("wm_employee_shift_applications_v1");
        const apps = safeParse<{ postId: string; status: string }>(appsRaw);
        const hasApps = apps.some((a) => a.postId === p.id && a.status !== "withdrawn");
        if (!hasApps) {
          changed = true;
          pushEmployerActivity({
            postId: p.id, kind: "post_created",
            title: "Shift expired",
            body: `${p.jobName} expired with no applications. Consider reposting.`,
            route: ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", p.id),
          });
          return { ...p, status: "cancelled" as const };
        }
      }
      return p;
    });
    if (changed) { writeEmployerPosts(next); syncToEmployeeSearch(next); }
  },

  completePost(postId: string) {
    const posts = this.getPosts();
    const next = posts.map((p: ShiftPost) =>
      p.id === postId ? { ...p, status: "completed" as const } : p,
    );
    safeWrite(EMP_POSTS_KEY, next);
  },

  updateSettings(postId: string, settings: PostSettings) {
    const posts = readEmployerPosts();
    const next = posts.map((p) => p.id === postId ? { ...p, settings } : p);
    writeEmployerPosts(next);
  },

  setPriorityTag(postId: string, appId: string, tag: PriorityTag | undefined) {
    const apps = readEmployeeApps();
    writeEmployeeApps(apps.map((a) => a.id === appId && a.postId === postId ? { ...a, priorityTag: tag } : a));
    notifyEmployeeAppsChanged();
  },

  _events: {
    employerShiftPostsChanged: EMPLOYER_SHIFT_POSTS_CHANGED_EVENT,
    employeeAppsChanged: EMPLOYEE_APPS_CHANGED_EVENT,
    employeeWorkspacesChanged: EMPLOYEE_WORKSPACES_CHANGED_EVENT,
    employerShiftActivityChanged: EMPLOYER_SHIFT_ACTIVITY_CHANGED_EVENT,
  },
} as const;