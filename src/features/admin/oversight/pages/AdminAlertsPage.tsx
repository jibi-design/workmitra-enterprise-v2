// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminAlertsPage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\oversight\pages\AdminAlertsPage.tsx

import { useMemo, useState, useSyncExternalStore } from "react";
import { AdminAlertsEventList } from "../components/AdminAlertsEventList";
import { AdminAlertsFilters } from "../components/AdminAlertsFilters";
import { AdminAlertsHeader } from "../components/AdminAlertsHeader";
import { AdminAlertsPagination } from "../components/AdminAlertsPagination";

type Rec = Record<string, unknown>;

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

const SHIFT_LOG_KEY = "wm_employer_shift_activity_log_v1";
const CAREER_LOG_KEY = "wm_employer_career_activity_log_v1";

const LISTEN_EVENTS = [
  "wm:employer-shift-activity-changed",
  "wm:employer-career-activity-changed",
  "storage",
  "focus",
];

type AuditEntry = {
  id: string;
  domain: "shift" | "career";
  kind: string;
  title: string;
  body?: string;
  createdAt: number;
  postId: string;
};

type DomainFilter = "all" | "shift" | "career";
type DateFilter = "all" | "today" | "7d" | "30d";

const KIND_LABELS: Record<string, string> = {
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

function kindLabel(kind: string): string {
  return KIND_LABELS[kind] ?? kind.replace(/_/g, " ");
}

function collectKinds(entries: AuditEntry[]): string[] {
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

function snap(): AuditEntry[] {
  const key = [localStorage.getItem(SHIFT_LOG_KEY), localStorage.getItem(CAREER_LOG_KEY)].join("|");

  if (key === auditCacheKey) return auditCacheData;

  auditCacheKey = key;
  auditCacheData = computeAll();

  return auditCacheData;
}

function subscribe(callback: () => void): () => void {
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

function fmtDate(timestamp: number): string {
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

function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function dateFilterMs(filter: DateFilter): number {
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

const PAGE_SIZE = 50;

export function AdminAlertsPage() {
  const allEntries = useSyncExternalStore(subscribe, snap, snap);
  const allKinds = useMemo(() => collectKinds(allEntries), [allEntries]);

  const [domainFilter, setDomainFilter] = useState<DomainFilter>("all");
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const minTimestamp = dateFilterMs(dateFilter);
    const query = searchText.trim().toLowerCase();

    return allEntries.filter((entry) => {
      if (domainFilter !== "all" && entry.domain !== domainFilter) return false;
      if (kindFilter !== "all" && entry.kind !== kindFilter) return false;
      if (minTimestamp > 0 && entry.createdAt < minTimestamp) return false;

      if (query) {
        const haystack = `${entry.title} ${entry.body ?? ""} ${entry.kind}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }, [allEntries, domainFilter, kindFilter, dateFilter, searchText]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageEntries = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  function toggleExpand(id: string) {
    setExpandedIds((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function setDomainAndReset(value: DomainFilter) {
    setDomainFilter(value);
    setPage(0);
  }

  function setKindAndReset(value: string) {
    setKindFilter(value);
    setPage(0);
  }

  function setDateAndReset(value: DateFilter) {
    setDateFilter(value);
    setPage(0);
  }

  function setSearchAndReset(value: string) {
    setSearchText(value);
    setPage(0);
  }

  return (
    <div className="wm-ad-fadeIn">
      <AdminAlertsHeader totalEvents={allEntries.length} />

      <AdminAlertsFilters
        searchText={searchText}
        domainFilter={domainFilter}
        kindFilter={kindFilter}
        dateFilter={dateFilter}
        allKinds={allKinds}
        getKindLabel={kindLabel}
        onSearchChange={setSearchAndReset}
        onDomainChange={setDomainAndReset}
        onKindChange={setKindAndReset}
        onDateChange={setDateAndReset}
      />

      <AdminAlertsEventList
        filteredCount={filtered.length}
        pageEntries={pageEntries}
        expandedIds={expandedIds}
        onToggle={toggleExpand}
        getKindLabel={kindLabel}
        formatDate={fmtDate}
        formatRelativeTime={relativeTime}
      />

      <AdminAlertsPagination
        totalPages={totalPages}
        safePage={safePage}
        onPrevious={() => setPage(safePage - 1)}
        onNext={() => setPage(safePage + 1)}
      />

      <div style={{ height: 24 }} />
    </div>
  );
}
