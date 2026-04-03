// src/features/employee/shiftJobs/pages/MyShiftWorkspacesPage.tsx
import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { shiftWorkspacesStorage, type ShiftWorkspace, type ShiftWorkspaceStatus } from "../storage/shiftWorkspaces.storage";

type Tab = "active" | "upcoming" | "completed" | "closed" | "all";

function fmtDateRange(startAt: number, endAt: number): string {
  try {
    const s = new Date(startAt);
    const e = new Date(endAt);
    const sameDay = s.toDateString() === e.toDateString();
    const sTxt = s.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const eTxt = e.toLocaleDateString(undefined, { month: "short", day: "numeric" });
   return sameDay ? sTxt : `${sTxt} - ${eTxt}`;
  } catch {
    return "Date";
  }
}

function catLabel(x: ShiftWorkspace["category"]): string {
  if (x === "construction") return "Construction";
  if (x === "kitchen") return "Kitchen";
  if (x === "office") return "Office";
  if (x === "delivery") return "Delivery";
  return "Other";
}

function statusLabelSimple(x: ShiftWorkspaceStatus): string {
  if (x === "active") return "Active";
  if (x === "upcoming") return "Upcoming";
  if (x === "completed") return "Completed";
  return "Closed";
}

function isClosedWorkspaceStatus(s: ShiftWorkspaceStatus): boolean {
  return s === "left" || s === "replaced";
}

function tabMatch(status: ShiftWorkspaceStatus, tab: Tab): boolean {
  if (tab === "all") return true;
  if (tab === "closed") return isClosedWorkspaceStatus(status);
  return status === tab;
}

function counts(list: ShiftWorkspace[]) {
  let active = 0;
  let upcoming = 0;
  let completed = 0;
  let closed = 0;

  for (const w of list) {
    if (w.status === "active") active++;
    else if (w.status === "upcoming") upcoming++;
    else if (w.status === "completed") completed++;
    else if (w.status === "left" || w.status === "replaced") closed++;
  }

  return { active, upcoming, completed, closed, all: list.length };
}

// Events used across the app for same-tab refresh (Phase-0 localStorage)
const WORKSPACES_CHANGED_EVENTS = [
  "wm:employee-shift-workspaces-changed",
  "wm:employee-shift-applications-changed",
  "wm:employee-notifications-changed",
] as const;

// Cached snapshot to satisfy useSyncExternalStore contract
let cacheKey: string | null = null;
let cacheList: ShiftWorkspace[] = [];

function getWorkspacesSnapshot(): ShiftWorkspace[] {
  const raw = localStorage.getItem("wm_employee_shift_workspaces_v1");
  if (raw === cacheKey) return cacheList;

  cacheKey = raw;
  cacheList = shiftWorkspacesStorage.getAll();
  return cacheList;
}

function subscribeWorkspaces(onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();

  window.addEventListener("storage", handler);
  window.addEventListener("focus", handler);
  document.addEventListener("visibilitychange", handler);

  for (const ev of WORKSPACES_CHANGED_EVENTS) {
    window.addEventListener(ev, handler);
  }

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("focus", handler);
    document.removeEventListener("visibilitychange", handler);

    for (const ev of WORKSPACES_CHANGED_EVENTS) {
      window.removeEventListener(ev, handler);
    }
  };
}

export function MyShiftWorkspacesPage() {
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("active");
  const [q, setQ] = useState("");

  const all = useSyncExternalStore(subscribeWorkspaces, getWorkspacesSnapshot, getWorkspacesSnapshot);
  const c = useMemo(() => counts(all), [all]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return all
      .filter((w) => tabMatch(w.status, tab))
      .filter((w) => {
        if (!query) return true;
        const hay = `${w.companyName} ${w.jobName} ${w.locationName}`.toLowerCase();
        return hay.includes(query);
      });
  }, [all, tab, q]);

  function openWorkspace(id: string) {
    const path = ROUTE_PATHS.employeeShiftWorkspace.replace(":workspaceId", id);
    nav(path);
  }

  return (
    <div className="wm-ee-vShift">
     <div className="wm-pageHead">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(22,163,74,0.08)", color: "#16a34a", flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 6V4h-4v2h4ZM4 8v11h16V8H4Zm16-2c1.11 0 2 .89 2 2v11c0 1.11-.89 2-2 2H4c-1.11 0-2-.89-2-2l.01-11c0-1.11.88-2 1.99-2h4V4c0-1.11.89-2 2-2h4c1.11 0 2 .89 2 2v2h4Z" /></svg>
          </div>
          <div>
            <div className="wm-pageTitle">My Workspaces</div>
            <div className="wm-pageSub">Confirmed shifts create a workspace (group).</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "flex-end" }}>
          <button
            className="wm-outlineBtn"
            type="button"
            onClick={() => nav(ROUTE_PATHS.employeeShiftSearch)}
            style={{ minWidth: 140, justifyContent: "center" }}
          >
            Find Shifts
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="wm-field" style={{ marginTop: 12 }}>
        <div className="wm-label">Search groups</div>
        <input
          className="wm-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Company, job, or location"
          aria-label="Search groups"
        />
      </div>

      {/* Tabs (single row only) */}
      <div className="wm-chipRow" style={{ marginTop: 12 }}>
        <button className={`wm-chipBtn ${tab === "active" ? "isActive" : ""}`} type="button" onClick={() => setTab("active")}>
          Active ({c.active})
        </button>
        <button className={`wm-chipBtn ${tab === "upcoming" ? "isActive" : ""}`} type="button" onClick={() => setTab("upcoming")}>
          Upcoming ({c.upcoming})
        </button>
        <button className={`wm-chipBtn ${tab === "completed" ? "isActive" : ""}`} type="button" onClick={() => setTab("completed")}>
          Completed ({c.completed})
        </button>
        <button className={`wm-chipBtn ${tab === "closed" ? "isActive" : ""}`} type="button" onClick={() => setTab("closed")}>
          Closed ({c.closed})
        </button>
        <button className={`wm-chipBtn ${tab === "all" ? "isActive" : ""}`} type="button" onClick={() => setTab("all")}>
          All ({c.all})
        </button>
      </div>

      {/* List */}
      <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
        {filtered.length === 0 ? (
          <div className="wm-ee-card">
            <div style={{ fontWeight: 1000 }}>No groups</div>
            <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted)" }}>
              Groups appear after employer confirmation.
            </div>
          </div>
        ) : null}

        {filtered.map((w) => {
         const title = `${w.companyName} - ${w.jobName}`;
          const range = fmtDateRange(w.startAt, w.endAt);

          return (
            <button
              key={w.id}
              type="button"
              className="wm-noteItem wm-noteItem-shift"
              onClick={() => openWorkspace(w.id)}
              aria-label={`Open workspace ${w.jobName} at ${w.companyName}`}
            >
              <div className="wm-noteHeader">
                <div className="wm-noteTitleRow">
                  <div className="wm-noteTitle">{title}</div>
                </div>

                <div className="wm-noteOpen">Open →</div>
              </div>

              <div className="wm-noteBody">
                {catLabel(w.category)} · {statusLabelSimple(w.status)} · {range}
              </div>

              <div className="wm-noteMeta">
                <div className="wm-noteMetaLeft">
                  <span className="wm-noteTime">{w.locationName}</span>
                  <span className="wm-noteMetaSep">·</span>
                  <span className="wm-noteDomain">{w.unreadCount > 0 ? `${w.unreadCount} unread` : "Up to date"}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}


