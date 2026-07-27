type Rec = Record<string, unknown>;

export type AuditEntry = {
  id: string;
  domain: "shift" | "career";
  kind: string;
  title: string;
  body?: string;
  createdAt: number;
  postId: string;
};

export type DomainFilter = "all" | "shift" | "career";
export type DateFilter = "all" | "today" | "7d" | "30d";

export const SHIFT_LOG_KEY = "wm_employer_shift_activity_log_v1";
export const CAREER_LOG_KEY = "wm_employer_career_activity_log_v1";

export const LISTEN_EVENTS = [
  "wm:employer-shift-activity-changed",
  "wm:employer-career-activity-changed",
  "storage",
  "focus",
];

export const KIND_LABELS: Record<string, string> = {
  post_created: "Post Created",
  analysis_run: "Analysis Run",
  analysis_reset: "Analysis Reset",
  hidden: "Hidden",
  unhidden: "Unhidden",
  move_shortlist: "Shortlisted",
  move_waiting: "Waiting List",
  candidate_rejected: "Rejected",
  confirmed: "Confirmed",
  replaced: "Replaced",
  candidate_shortlisted: "Shortlisted",
  candidate_hired: "Hired",
  interview_scheduled: "Interview Set",
  interview_passed: "Interview Passed",
  interview_failed: "Interview Failed",
  offer_sent: "Offer Sent",
  candidate_withdrawn: "Withdrawn",
  post_paused: "Post Paused",
  post_resumed: "Post Resumed",
  post_closed: "Post Closed",
  post_filled: "Post Filled",
};

export const PAGE_SIZE = 50;

function isRec(value: unknown): value is Rec {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeArr(key: string): unknown[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeStr(record: Rec, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value : "";
}

function safeNum(record: Rec, key: string): number {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function kindLabel(kind: string): string {
  return KIND_LABELS[kind] ?? kind.replace(/_/g, " ");
}

export function collectKinds(entries: AuditEntry[]): string[] {
  const set = new Set<string>();

  for (const entry of entries) {
    if (entry.kind) set.add(entry.kind);
  }

  return Array.from(set).sort();
}

function computeAll(): AuditEntry[] {
  const entries: AuditEntry[] = [];

  for (const item of safeArr(SHIFT_LOG_KEY)) {
    if (!isRec(item)) continue;

    const id = safeStr(item, "id");
    const title = safeStr(item, "title");
    const createdAt = safeNum(item, "createdAt");

    if (!id || !title || !createdAt) continue;

    entries.push({
      id,
      domain: "shift",
      kind: safeStr(item, "kind"),
      title,
      body: safeStr(item, "body") || undefined,
      createdAt,
      postId: safeStr(item, "postId"),
    });
  }

  for (const item of safeArr(CAREER_LOG_KEY)) {
    if (!isRec(item)) continue;

    const id = safeStr(item, "id");
    const title = safeStr(item, "title");
    const createdAt = safeNum(item, "createdAt");

    if (!id || !title || !createdAt) continue;

    entries.push({
      id,
      domain: "career",
      kind: safeStr(item, "kind"),
      title,
      body: safeStr(item, "body") || undefined,
      createdAt,
      postId: safeStr(item, "postId"),
    });
  }

  entries.sort((a, b) => b.createdAt - a.createdAt);
  return entries;
}

let auditCacheKey = "";
let auditCacheData: AuditEntry[] = [];

export function snap(): AuditEntry[] {
  const key = [localStorage.getItem(SHIFT_LOG_KEY), localStorage.getItem(CAREER_LOG_KEY)].join("|");

  if (key === auditCacheKey) return auditCacheData;

  auditCacheKey = key;
  auditCacheData = computeAll();

  return auditCacheData;
}

export function subscribe(callback: () => void): () => void {
  const handler = () => callback();

  for (const eventName of LISTEN_EVENTS) {
    window.addEventListener(eventName, handler);
  }

  document.addEventListener("visibilitychange", handler);

  return () => {
    for (const eventName of LISTEN_EVENTS) {
      window.removeEventListener(eventName, handler);
    }

    document.removeEventListener("visibilitychange", handler);
  };
}

export function fmtDate(timestamp: number): string {
  if (!timestamp) return "—";

  try {
    return new Date(timestamp).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function dateFilterMs(filter: DateFilter): number {
  const now = Date.now();

  if (filter === "today") {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }

  if (filter === "7d") return now - 7 * 24 * 60 * 60 * 1000;
  if (filter === "30d") return now - 30 * 24 * 60 * 60 * 1000;

  return 0;
}
