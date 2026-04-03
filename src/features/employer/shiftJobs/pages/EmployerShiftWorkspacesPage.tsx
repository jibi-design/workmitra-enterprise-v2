// src/features/employer/shiftJobs/pages/EmployerShiftWorkspacesPage.tsx
import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";

type WsStatus = "active" | "upcoming" | "completed" | "left" | "replaced";
type WsLite = {
  id: string; postId: string; companyName: string; jobName: string;
  locationName: string; startAt: number; endAt: number; status: WsStatus; lastActivityAt: number;
};

const WS_KEY = "wm_employee_shift_workspaces_v1";
const WS_CHANGED = "wm:employee-shift-workspaces-changed";

type Rec = Record<string, unknown>;
function isRec(x: unknown): x is Rec { return typeof x === "object" && x !== null; }
function str(r: Rec, k: string): string | undefined { const v = r[k]; return typeof v === "string" ? v : undefined; }
function num(r: Rec, k: string): number | undefined { const v = r[k]; return typeof v === "number" && Number.isFinite(v) ? v : undefined; }

function clampStatus(x: unknown): WsStatus {
  if (x === "active" || x === "upcoming" || x === "completed" || x === "left" || x === "replaced") return x;
  return "active";
}

function parseWs(raw: string | null): WsLite[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    const out: WsLite[] = [];
    for (const item of arr) {
      if (!isRec(item)) continue;
      const id = str(item, "id"); const postId = str(item, "postId");
      const companyName = str(item, "companyName"); const jobName = str(item, "jobName");
      const locationName = str(item, "locationName");
      const startAt = num(item, "startAt"); const endAt = num(item, "endAt");
      const lastActivityAt = num(item, "lastActivityAt");
      if (!id || !postId || !companyName || !jobName || !locationName) continue;
      if (startAt === undefined || endAt === undefined || lastActivityAt === undefined) continue;
      out.push({ id, postId, companyName, jobName, locationName, startAt, endAt, status: clampStatus(item["status"]), lastActivityAt });
    }
    out.sort((a, b) => b.lastActivityAt - a.lastActivityAt);
    return out;
  } catch { return []; }
}

function fmtDateRange(s: number, e: number): string {
  try {
    const sd = new Date(s); const ed = new Date(e);
    const st = sd.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const et = ed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return sd.toDateString() === ed.toDateString() ? st : `${st} - ${et}`;
  } catch { return "Date"; }
}

function fmtTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

let cRaw: string | null = null; let cList: WsLite[] = [];
function getSnap(): WsLite[] {
  const raw = localStorage.getItem(WS_KEY);
  if (raw === cRaw) return cList;
  cRaw = raw; cList = parseWs(raw); return cList;
}
function sub(cb: () => void): () => void {
  const h = () => cb();
  window.addEventListener("storage", h); window.addEventListener("focus", h);
  document.addEventListener("visibilitychange", h); window.addEventListener(WS_CHANGED, h);
  return () => { window.removeEventListener("storage", h); window.removeEventListener("focus", h); document.removeEventListener("visibilitychange", h); window.removeEventListener(WS_CHANGED, h); };
}

type Filter = "all" | "active" | "upcoming" | "completed" | "left" | "replaced";

export function EmployerShiftWorkspacesPage() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "broadcasts" ? "broadcasts" : "groups";

  const all = useSyncExternalStore(sub, getSnap, getSnap);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const c = { all: all.length, active: 0, upcoming: 0, completed: 0, left: 0, replaced: 0 };
    for (const w of all) { if (w.status in c) c[w.status as keyof typeof c]++; }
    return c;
  }, [all]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((w) => {
      if (filter !== "all" && w.status !== filter) return false;
      if (q) { const hay = `${w.companyName} ${w.jobName} ${w.locationName}`.toLowerCase(); if (!hay.includes(q)) return false; }
      return true;
    });
  }, [all, filter, query]);

  const isGroups = mode === "groups";

  return (
    <div className="wm-er-vShift">
      {/* Header */}
      <div className="wm-pageHead">
        <div>
          <div className="wm-pageTitle">{isGroups ? "My Work Groups" : "Broadcasts"}</div>
          <div className="wm-pageSub">
            {isGroups
              ? "Manage your confirmed worker groups. Groups are created when you confirm workers for a shift."
              : "Send announcements to your shift workers. Open a group to send messages to all confirmed workers."}
          </div>
        </div>
        <button className="wm-outlineBtn" type="button" onClick={() => nav(ROUTE_PATHS.employerShiftHome)} style={{ whiteSpace: "nowrap" }}>
          Back
        </button>
      </div>



      {/* Search + filters */}
      <div style={{ marginTop: 12 }}>
        <input className="wm-input" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by company, job, or location..." aria-label="Search" />

        <div className="wm-chipRow" style={{ marginTop: 10 }}>
          {(["all","active","upcoming","completed","left","replaced"] as Filter[]).map((f) => (
            <button key={f} className={`wm-chipBtn ${filter === f ? "isActive" : ""}`} type="button" onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)} {f === "all" ? counts.all : counts[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Info card per mode */}
      {isGroups ? (
        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: "var(--wm-radius-14)", border: "1px solid rgba(15,118,110,0.15)", background: "rgba(15,118,110,0.03)", fontSize: 13, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
          <strong style={{ color: "var(--wm-er-text)" }}>What are Work Groups?</strong><br />
          When you confirm workers for a shift, a Work Group is automatically created. Use it to track attendance, manage workers, and communicate with your team.
        </div>
      ) : (
        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: "var(--wm-radius-14)", border: "1px solid rgba(15,118,110,0.15)", background: "rgba(15,118,110,0.03)", fontSize: 13, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
          <strong style={{ color: "var(--wm-er-text)" }}>What are Broadcasts?</strong><br />
          Broadcasts let you send announcements to all confirmed workers in a group. Open any active group below to send updates, schedule changes, or important notices.
        </div>
      )}

      {/* List */}
      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        {filtered.length === 0 && (
          <div className="wm-er-card" style={{ textAlign: "center", padding: 20 }}>
            <div style={{ fontWeight: 900, fontSize: 13 }}>
              {all.length === 0 ? "No work groups yet" : "No groups match your search"}
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: "var(--wm-er-muted)" }}>
              {all.length === 0 ? "Groups are created when you confirm workers for a shift." : "Try changing your search or filter."}
            </div>
          </div>
        )}

        {filtered.map((w) => {
          const title = `${w.companyName} - ${w.jobName}`;
          const wsRoute = ROUTE_PATHS.employerShiftWorkspace.replace(":workspaceId", w.id);
          const postRoute = ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", w.postId);
          const needsAttention = w.status === "left" || w.status === "replaced";

          return (
            <button key={w.id} type="button" className="wm-noteItem wm-noteItem-shift" onClick={() => nav(wsRoute)}
              aria-label={`Open ${isGroups ? "group" : "broadcast"} ${title}`} style={{ padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div className="wm-noteTitle">{title}</div>
                  <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 3 }}>
                    {w.locationName} - {fmtDateRange(w.startAt, w.endAt)}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", color: w.status === "active" ? "var(--wm-er-accent-shift)" : "var(--wm-er-muted)" }}>
                    {w.status}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--wm-er-muted)" }}>{fmtTimeAgo(w.lastActivityAt)}</span>
                </div>
              </div>

              {needsAttention && (
                <div style={{ marginTop: 6, fontSize: 11, fontWeight: 800, color: "var(--wm-error)" }}>
                  Needs attention - {w.status === "left" ? "Worker exited" : "Worker replaced"}
                </div>
              )}

              <div style={{ marginTop: 8, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                {isGroups ? (
                  <>
                    <span className="wm-outlineBtn" style={{ fontSize: 11, height: 28, padding: "0 10px", pointerEvents: "auto" }}
                      onClick={(e) => { e.stopPropagation(); nav(postRoute); }}>View post</span>
                    <span style={{ fontSize: 11, color: "var(--wm-er-accent-shift)", fontWeight: 900 }}>Open group</span>
                  </>
                ) : (
                  <span style={{ fontSize: 11, color: "var(--wm-er-accent-shift)", fontWeight: 900 }}>
                    {w.status === "active" ? "Send broadcast" : "View messages"}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

