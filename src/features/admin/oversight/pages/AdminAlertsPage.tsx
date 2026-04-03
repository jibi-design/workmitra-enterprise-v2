// src/features/admin/oversight/pages/AdminAlertsPage.tsx
//
// Audit Log — Full activity trail with filters, search, pagination.
// Combines shift + career activity logs.
// Domain filter, kind filter, date range filter, text search.
// 50 events per page with pagination controls.

import { useState, useMemo, useSyncExternalStore } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Safe Helpers
// ─────────────────────────────────────────────────────────────────────────────

type Rec = Record<string, unknown>;

function isRec(x: unknown): x is Rec {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function safeArr(key: string): unknown[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const p = JSON.parse(raw) as unknown;
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function safeStr(r: Rec, k: string): string {
  const v = r[k];
  return typeof v === "string" ? v : "";
}

function safeNum(r: Rec, k: string): number {
  const v = r[k];
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Storage Keys & Events
// ─────────────────────────────────────────────────────────────────────────────

const SHIFT_LOG_KEY = "wm_employer_shift_activity_log_v1";
const CAREER_LOG_KEY = "wm_employer_career_activity_log_v1";

const LISTEN_EVENTS = [
  "wm:employer-shift-activity-changed",
  "wm:employer-career-activity-changed",
  "storage",
  "focus",
];

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Kind Labels (human-readable)
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Collect All Unique Kinds
// ─────────────────────────────────────────────────────────────────────────────

function collectKinds(entries: AuditEntry[]): string[] {
  const set = new Set<string>();
  for (const e of entries) {
    if (e.kind) set.add(e.kind);
  }
  return Array.from(set).sort();
}

// ─────────────────────────────────────────────────────────────────────────────
// Compute All Entries
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Reactive Snapshot
// ─────────────────────────────────────────────────────────────────────────────

let auditCacheKey = "";
let auditCacheData: AuditEntry[] = [];

function snap(): AuditEntry[] {
  const key = [
    localStorage.getItem(SHIFT_LOG_KEY),
    localStorage.getItem(CAREER_LOG_KEY),
  ].join("|");
  if (key === auditCacheKey) return auditCacheData;
  auditCacheKey = key;
  auditCacheData = computeAll();
  return auditCacheData;
}

function subscribe(cb: () => void): () => void {
  const handler = () => cb();
  for (const ev of LISTEN_EVENTS) window.addEventListener(ev, handler);
  document.addEventListener("visibilitychange", handler);
  return () => {
    for (const ev of LISTEN_EVENTS) window.removeEventListener(ev, handler);
    document.removeEventListener("visibilitychange", handler);
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────────────────────────────────────

function fmtDate(ts: number): string {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Date Filter Logic
// ─────────────────────────────────────────────────────────────────────────────

function dateFilterMs(filter: DateFilter): number {
  const now = Date.now();
  if (filter === "today") {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  if (filter === "7d") return now - 7 * 24 * 60 * 60 * 1000;
  if (filter === "30d") return now - 30 * 24 * 60 * 60 * 1000;
  return 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 50;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function AdminAlertsPage() {
  const allEntries = useSyncExternalStore(subscribe, snap, snap);
  const allKinds = useMemo(() => collectKinds(allEntries), [allEntries]);

  const [domainFilter, setDomainFilter] = useState<DomainFilter>("all");
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Filter
  const filtered = useMemo(() => {
    const minTs = dateFilterMs(dateFilter);
    const q = searchText.trim().toLowerCase();
    return allEntries.filter((e) => {
      if (domainFilter !== "all" && e.domain !== domainFilter) return false;
      if (kindFilter !== "all" && e.kind !== kindFilter) return false;
      if (minTs > 0 && e.createdAt < minTs) return false;
      if (q) {
        const hay = `${e.title} ${e.body ?? ""} ${e.kind}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allEntries, domainFilter, kindFilter, dateFilter, searchText]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageEntries = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Reset page on filter change
  function setDomainAndReset(v: DomainFilter) { setDomainFilter(v); setPage(0); }
  function setKindAndReset(v: string) { setKindFilter(v); setPage(0); }
  function setDateAndReset(v: DateFilter) { setDateFilter(v); setPage(0); }
  function setSearchAndReset(v: string) { setSearchText(v); setPage(0); }

  return (
    <div className="wm-ad-fadeIn">
      {/* ── Header ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 1000, color: "var(--wm-ad-text)", letterSpacing: -0.3 }}>
          Audit Log
        </div>
        <div style={{ fontSize: 12, color: "var(--wm-ad-dim)", marginTop: 4 }}>
          Complete activity trail across all domains. {allEntries.length} total events.
        </div>
      </div>

      {/* ── Search ── */}
      <input
        type="text"
        className="wm-ad-searchInput"
        placeholder="Search events by title, body, or kind..."
        value={searchText}
        onChange={(e) => setSearchAndReset(e.target.value)}
      />

      {/* ── Domain Filter ── */}
      <div className="wm-ad-filterBar">
        {(["all", "shift", "career"] as DomainFilter[]).map((v) => (
          <button
            key={v}
            type="button"
            className="wm-ad-filterChip"
            data-active={domainFilter === v}
            onClick={() => setDomainAndReset(v)}
          >
            {v === "all" ? "All Domains" : v === "shift" ? "Shift Jobs" : "Career Jobs"}
          </button>
        ))}
      </div>

      {/* ── Kind Filter ── */}
      {allKinds.length > 0 && (
        <div className="wm-ad-filterBar">
          <button
            type="button"
            className="wm-ad-filterChip"
            data-active={kindFilter === "all"}
            onClick={() => setKindAndReset("all")}
          >
            All Types
          </button>
          {allKinds.map((k) => (
            <button
              key={k}
              type="button"
              className="wm-ad-filterChip"
              data-active={kindFilter === k}
              onClick={() => setKindAndReset(k)}
            >
              {kindLabel(k)}
            </button>
          ))}
        </div>
      )}

      {/* ── Date Filter ── */}
      <div className="wm-ad-filterBar" style={{ marginBottom: 18 }}>
        {([
          { v: "all" as DateFilter, l: "All Time" },
          { v: "today" as DateFilter, l: "Today" },
          { v: "7d" as DateFilter, l: "Last 7 Days" },
          { v: "30d" as DateFilter, l: "Last 30 Days" },
        ]).map(({ v, l }) => (
          <button
            key={v}
            type="button"
            className="wm-ad-filterChip"
            data-active={dateFilter === v}
            onClick={() => setDateAndReset(v)}
          >
            {l}
          </button>
        ))}
      </div>

      {/* ── Results Count ── */}
      <div style={{ fontSize: 11, fontWeight: 800, color: "var(--wm-ad-dim)", marginBottom: 10, letterSpacing: 0.3 }}>
        {filtered.length} event{filtered.length !== 1 ? "s" : ""} found
      </div>

      {/* ── Event List ── */}
      <div className="wm-ad-glass">
        {pageEntries.length === 0 ? (
          <div className="wm-ad-empty">
            No events match your filters. Try adjusting the filters above.
          </div>
        ) : (
          pageEntries.map((entry) => (
            <AuditRow
              key={entry.id}
              entry={entry}
              expanded={expandedIds.has(entry.id)}
              onToggle={() => toggleExpand(entry.id)}
            />
          ))
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="wm-ad-pagination">
          <button
            type="button"
            className="wm-ad-pageBtn"
            disabled={safePage === 0}
            onClick={() => setPage(safePage - 1)}
          >
            Previous
          </button>
          <span className="wm-ad-pageInfo">
            Page {safePage + 1} of {totalPages}
          </span>
          <button
            type="button"
            className="wm-ad-pageBtn"
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage(safePage + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Bottom spacing */}
      <div style={{ height: 24 }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Audit Row Sub-Component
// ─────────────────────────────────────────────────────────────────────────────

function AuditRow({ entry, expanded, onToggle }: {
  entry: AuditEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="wm-ad-auditEntry">
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 8,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", gap: 6, alignItems: "baseline", flexWrap: "wrap", flex: 1 }}>
          {/* Domain badge */}
          <span className="wm-ad-tlBadge" data-domain={entry.domain}>
            {entry.domain === "shift" ? "SHIFT" : "CAREER"}
          </span>
          {/* Kind badge */}
          <span className="wm-ad-kindBadge">
            {kindLabel(entry.kind)}
          </span>
          {/* Title */}
          <span style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-ad-text)" }}>
            {entry.title}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0, gap: 2 }}>
          <span style={{ fontSize: 10, color: "var(--wm-ad-dim)", fontWeight: 700, whiteSpace: "nowrap" }}>
            {fmtDate(entry.createdAt)}
          </span>
          <span style={{ fontSize: 9, color: "var(--wm-ad-dim)", fontWeight: 600, whiteSpace: "nowrap" }}>
            {relativeTime(entry.createdAt)}
          </span>
        </div>
      </button>
      {expanded && entry.body && (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: "var(--wm-ad-muted)",
            lineHeight: 1.6,
            paddingLeft: 2,
            borderLeft: "2px solid var(--wm-ad-border)",
            marginLeft: 2,
            paddingBottom: 2,
          }}
        >
          <div style={{ paddingLeft: 10 }}>{entry.body}</div>
        </div>
      )}
    </div>
  );
}