// src/features/employee/shiftJobs/pages/ShiftControlCenterPage.tsx
import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { availabilityStorage } from "../storage/availabilityStorage";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import type { AvailabilityWindow, AvailabilityBroadcast } from "../storage/availabilityStorage";

/* ------------------------------------------------ */
/* Stable snapshot — avoids useSyncExternalStore    */
/* infinite loop (arrow fn creates new ref each    */
/* render → React bails out with update-depth err) */
/* ------------------------------------------------ */
let _bcRaw: string | null = "__init__";
let _bcCache: AvailabilityBroadcast | null = null;

function getBroadcastSnapshot(): AvailabilityBroadcast | null {
  const raw = localStorage.getItem("wm_employee_availability_broadcast_v1");
  if (raw === _bcRaw) return _bcCache;
  _bcRaw   = raw;
  _bcCache = availabilityStorage.getMyBroadcast();
  return _bcCache;
}

/* ------------------------------------------------ */
/* Constants                                        */
/* ------------------------------------------------ */
const SHIFT_GREEN = "#16a34a";
const APPS_KEY    = "wm_employee_shift_applications_v1";
const WS_KEY      = "wm_employee_shift_workspaces_v1";
const POSTS_KEY   = "wm_employee_shift_posts_demo_v1";

/* ------------------------------------------------ */
/* Live data helpers                                */
/* ------------------------------------------------ */
type Rec = Record<string, unknown>;

function safeArray(key: string): Rec[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is Rec => typeof x === "object" && x !== null);
  } catch { return []; }
}

function computeCounts() {
  const posts = safeArray(POSTS_KEY);
  const apps  = safeArray(APPS_KEY);
  const ws    = safeArray(WS_KEY);

   const availableShifts = posts.filter((p) => !p["isHiddenFromSearch"]).length;

  let pending = 0; let confirmed = 0; let totalApps = 0;
  for (const a of apps) {
    const st = a["status"]; totalApps++;
    if (st === "applied" || st === "shortlisted" || st === "waiting") pending++;
    if (st === "confirmed") confirmed++;
  }

  const activeWs = ws.filter((w) => w["status"] === "active" || w["status"] === "upcoming").length;
  return { availableShifts, totalApps, pending, confirmed, activeWs };
}

/* ------------------------------------------------ */
/* Icons                                            */
/* ------------------------------------------------ */
function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z" />
    </svg>
  );
}

function IconClipboard() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1Zm7 16H5V5h2v3h10V5h2v14Z" />
    </svg>
  );
}

function IconBriefcase() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M14 6V4h-4v2h4ZM4 8v11h16V8H4Zm16-2c1.11 0 2 .89 2 2v11c0 1.11-.89 2-2 2H4c-1.11 0-2-.89-2-2l.01-11c0-1.11.88-2 1.99-2h4V4c0-1.11.89-2 2-2h4c1.11 0 2 .89 2 2v2h4Z" />
    </svg>
  );
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"
      style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
      <path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41Z" />
    </svg>
  );
}

/* ------------------------------------------------ */
/* Styles                                           */
/* ------------------------------------------------ */
const iconWrapStyle: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 12,
  display: "flex", alignItems: "center", justifyContent: "center",
  background: "rgba(22,163,74,0.08)", color: SHIFT_GREEN, flexShrink: 0,
};

const actionCardStyle: React.CSSProperties = {
  width: "100%", padding: "14px 16px",
  borderRadius: "var(--wm-radius-14)",
  border: "1px solid var(--wm-er-border)",
  borderLeft: `4px solid ${SHIFT_GREEN}`,
  background: "#fff", cursor: "pointer", textAlign: "left",
};

const tileValueStyle = (val: number): React.CSSProperties => ({
  marginTop: 4, fontSize: 20, fontWeight: 700,
  color: val === 0 ? "var(--wm-er-text)" : SHIFT_GREEN,
});

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function ShiftControlCenterPage() {
  const nav    = useNavigate();
  const counts = useMemo(() => computeCounts(), []);
  const [howOpen, setHowOpen] = useState(() => counts.totalApps === 0);

  /* Stable snapshot ref — prevents infinite re-render */
  const myBroadcast = useSyncExternalStore(
    availabilityStorage.subscribe,
    getBroadcastSnapshot,
    getBroadcastSnapshot,
  );

  function handleBroadcast(window: AvailabilityWindow) {
    const profile = employeeProfileStorage.get();
    availabilityStorage.broadcast({
      workerWmId: profile.uniqueId || `anon_${Date.now()}`,
      workerName: profile.fullName.trim() || "Worker",
      window,
      city: profile.city.trim() || undefined,
    });
  }

  return (
    <div className="wm-ee-vShift">
      {/* Header */}
      <div className="wm-pageHead">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(22,163,74,0.08)", color: "#16a34a", flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1.5A2.5 2.5 0 0 1 22 6.5v14A2.5 2.5 0 0 1 19.5 23h-15A2.5 2.5 0 0 1 2 20.5v-14A2.5 2.5 0 0 1 4.5 4H6V3a1 1 0 0 1 1-1Zm12.5 7H4.5v11.5c0 .276.224.5.5.5h14c.276 0 .5-.224.5-.5V9ZM6 6H4.5a.5.5 0 0 0-.5.5V7h16v-.5a.5.5 0 0 0-.5-.5H18v1a1 1 0 1 1-2 0V6H8v1a1 1 0 1 1-2 0V6Z" />
            </svg>
          </div>
          <div>
            <div className="wm-pageTitle">Shift Jobs</div>
            <div className="wm-pageSub">Find shifts, track applications, manage workspaces</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="wm-ee-tiles" style={{ marginTop: 14 }}>
        <div className="wm-ee-tile">
          <div className="wm-ee-tileLabel">Available</div>
          <div style={tileValueStyle(counts.availableShifts)}>{counts.availableShifts}</div>
        </div>
        <div className="wm-ee-tile">
          <div className="wm-ee-tileLabel">Applications</div>
          <div style={tileValueStyle(counts.totalApps)}>{counts.totalApps}</div>
        </div>
        <div className="wm-ee-tile">
          <div className="wm-ee-tileLabel">Workspaces</div>
          <div style={tileValueStyle(counts.activeWs)}>{counts.activeWs}</div>
        </div>
      </div>

      {/* Action Cards */}
      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <button type="button" style={actionCardStyle} onClick={() => nav(ROUTE_PATHS.employeeShiftSearch)}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={iconWrapStyle}><IconSearch /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>Find Shifts</div>
              <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>Search and apply for available shifts</div>
              {counts.availableShifts > 0 && (
                <div style={{ fontSize: 11, fontWeight: 700, color: SHIFT_GREEN, marginTop: 4 }}>
                  {counts.availableShifts} shift{counts.availableShifts !== 1 ? "s" : ""} available
                </div>
              )}
            </div>
          </div>
        </button>

        <button type="button" style={actionCardStyle} onClick={() => nav(ROUTE_PATHS.employeeShiftApplications)}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={iconWrapStyle}><IconClipboard /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>My Applications</div>
              <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>Track your shift applications</div>
              {counts.totalApps > 0 && (
                <div style={{ fontSize: 11, fontWeight: 700, color: SHIFT_GREEN, marginTop: 4 }}>
                  {counts.pending > 0 ? `${counts.pending} pending` : ""}
                  {counts.pending > 0 && counts.confirmed > 0 ? " \u00b7 " : ""}
                  {counts.confirmed > 0 ? `${counts.confirmed} confirmed` : ""}
                  {counts.pending === 0 && counts.confirmed === 0 ? `${counts.totalApps} total` : ""}
                </div>
              )}
            </div>
          </div>
        </button>

        <button type="button" style={actionCardStyle} onClick={() => nav(ROUTE_PATHS.employeeShiftEarnings)}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={iconWrapStyle}>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4Z" /></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>My Earnings</div>
              <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>Track your shift earnings</div>
            </div>
          </div>
        </button>

        <button type="button" style={actionCardStyle} onClick={() => nav(ROUTE_PATHS.employeeShiftWorkspaces)}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={iconWrapStyle}><IconBriefcase /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>My Workspaces</div>
              <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>Active shift groups and updates</div>
              {counts.activeWs > 0 && (
                <div style={{ fontSize: 11, fontWeight: 700, color: SHIFT_GREEN, marginTop: 4 }}>
                  {counts.activeWs} active workspace{counts.activeWs !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>
        </button>
      </div>

       {/* Available Shifts Preview */}
      {(() => {
        const allPosts = safeArray(POSTS_KEY).filter((p) => !p["isHiddenFromSearch"]).slice(0, 3);
        if (allPosts.length === 0) return null;
        return (
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>Available Shifts</div>
              <button type="button" onClick={() => nav(ROUTE_PATHS.employeeShiftSearch)}
                style={{ fontSize: 11, fontWeight: 700, color: SHIFT_GREEN, background: "none", border: "none", cursor: "pointer" }}>
                Browse All &#8250;
              </button>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {allPosts.map((p) => (
                <button key={p["id"] as string} type="button"
                  onClick={() => nav(ROUTE_PATHS.employeeShiftPostDetails.replace(":postId", p["id"] as string))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid var(--wm-er-border)", background: "var(--wm-er-card, #fff)", cursor: "pointer", textAlign: "left" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p["jobName"] as string} &mdash; {p["companyName"] as string}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
                        {p["locationName"] as string} &middot; {p["category"] as string}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: SHIFT_GREEN, whiteSpace: "nowrap", flexShrink: 0 }}>
                      {p["payPerDay"] as number}/day
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* I'm Available Broadcast */}
      <div className="wm-ee-card" style={{ marginTop: 14, borderLeft: `4px solid ${SHIFT_GREEN}` }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 6 }}>
          Let employers know you&apos;re available
        </div>
        {myBroadcast ? (
          <div>
            <div style={{
              padding: "10px 12px", borderRadius: 10, marginBottom: 10,
              background: "rgba(22,163,74,0.07)", border: "1px solid rgba(22,163,74,0.2)",
              fontSize: 12, fontWeight: 600, color: SHIFT_GREEN,
            }}>
              &#10003; Broadcasting as available &mdash; <b>{availabilityStorage.windowLabel(myBroadcast.window)}</b>
              <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2, fontWeight: 500 }}>
                Expires: {new Date(myBroadcast.expiresAt).toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            <button type="button"
              onClick={() => availabilityStorage.clearMyBroadcast()}
              style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(220,38,38,0.3)", background: "none", color: "var(--wm-error, #dc2626)", cursor: "pointer" }}>
              Stop broadcasting
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 10 }}>
              Tap to let employers in your area know you are ready to work.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => handleBroadcast("today")}
                style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "none", background: SHIFT_GREEN, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Available Today
              </button>
              <button type="button" onClick={() => handleBroadcast("this_week")}
                style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: `1.5px solid ${SHIFT_GREEN}`, background: "rgba(22,163,74,0.07)", color: SHIFT_GREEN, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Available This Week
              </button>
            </div>
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="wm-ee-card" style={{ marginTop: 14, marginBottom: 24, borderLeft: `4px solid ${SHIFT_GREEN}` }}>
        <button type="button" onClick={() => setHowOpen((p) => !p)}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, background: "transparent", border: 0, cursor: "pointer", padding: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>How it works</div>
          <IconChevron open={howOpen} />
        </button>
        {howOpen && (
          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            {[
              "Apply for a shift you like.",
              "You may be shortlisted or placed on the waiting list.",
              "When confirmed, a workspace is created for updates.",
            ].map((text, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: 999, flexShrink: 0, background: "rgba(22,163,74,0.10)", color: SHIFT_GREEN, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 13, color: "var(--wm-er-muted)", lineHeight: 1.5, paddingTop: 2 }}>{text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}