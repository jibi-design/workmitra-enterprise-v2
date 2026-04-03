// src/features/admin/home/pages/AdminHomePage.tsx
//
// Admin System Overview — v5 approved light premium design.
// Navy topbar, warm white cards, green accent. 4-col domain grids.
// KPI row 2: Applications/Audit neutral navy, only Hired = green.

import { useState, useCallback, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { CenterModal } from "../../../../shared/components/CenterModal";

// ─────────────────────────────────────────────────────────────────────────────
// Safe Helpers
// ─────────────────────────────────────────────────────────────────────────────

type Rec = Record<string, unknown>;
function isRec(x: unknown): x is Rec { return typeof x === "object" && x !== null && !Array.isArray(x); }
function safeArr(key: string): unknown[] { try { const r = localStorage.getItem(key); if (!r) return []; const p = JSON.parse(r) as unknown; return Array.isArray(p) ? p : []; } catch { return []; } }
function safeStr(r: Rec, k: string): string { const v = r[k]; return typeof v === "string" ? v : ""; }
function safeNum(r: Rec, k: string): number { const v = r[k]; return typeof v === "number" && Number.isFinite(v) ? v : 0; }

// ─────────────────────────────────────────────────────────────────────────────
// Storage Keys
// ─────────────────────────────────────────────────────────────────────────────

const K = {
  shiftPosts: "wm_employer_shift_posts_v1",
  shiftApps: "wm_employee_shift_applications_v1",
  shiftWorkspaces: "wm_employee_shift_workspaces_v1",
  shiftLog: "wm_employer_shift_activity_log_v1",
  careerPosts: "wm_employer_career_posts_v1",
  careerApps: "wm_employee_career_applications_v1",
  careerWorkspaces: "wm_employee_career_workspaces_v1",
  careerLog: "wm_employer_career_activity_log_v1",
  wfStaff: "wm_workforce_staff_v1",
  wfAnnouncements: "wm_workforce_announcements_v1",
  wfGroups: "wm_workforce_groups_v1",
  wfAttendance: "wm_workforce_attendance_v1",
  wfActivity: "wm_workforce_activity_v1",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ActivityItem = { id: string; domain: "shift" | "career"; kind: string; title: string; body?: string; createdAt: number };

type AdminData = {
  employers: number; employees: number;
  shiftTotal: number; shiftActive: number; shiftCompleted: number; shiftCancelled: number;
  shiftAppsApplied: number; shiftShortlisted: number; shiftConfirmed: number; shiftRejected: number;
  shiftWorkspacesActive: number; shiftFillRate: number;
  careerTotal: number; careerActive: number; careerPaused: number; careerClosed: number;
  careerAppsApplied: number; careerShortlisted: number; careerInterview: number;
  careerOffered: number; careerHired: number; careerRejected: number;
  careerWorkspacesActive: number; careerConversion: number;
  activity: ActivityItem[]; totalEvents: number;
   storageBytes: number; storageKeys: number; lastActivityTs: number;
  wfStaffActive: number; wfAnnOpen: number; wfAnnConfirmed: number; wfGroupsActive: number; wfAttendanceTotal: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Compute
// ─────────────────────────────────────────────────────────────────────────────

function compute(): AdminData {
  const sp = safeArr(K.shiftPosts); const sa = safeArr(K.shiftApps);
  const sw = safeArr(K.shiftWorkspaces); const sLog = safeArr(K.shiftLog);
  const cp = safeArr(K.careerPosts); const ca = safeArr(K.careerApps);
  const cw = safeArr(K.careerWorkspaces); const cLog = safeArr(K.careerLog);

  let shiftActive = 0; let shiftCompleted = 0; const shiftCancelled = 0;
  let shiftTotalVacancies = 0; let shiftTotalConfirmed = 0;
  for (const p of sp) { if (!isRec(p)) continue; const st = safeStr(p, "status"); if (st === "completed") shiftCompleted++; else if (st !== "cancelled") shiftActive++; shiftTotalVacancies += safeNum(p, "vacancies") || 1; if (Array.isArray(p["confirmedIds"])) shiftTotalConfirmed += (p["confirmedIds"] as unknown[]).length; }

  let shiftAppsApplied = 0; let shiftShortlisted = 0; let shiftConfirmed = 0; let shiftRejected = 0;
  const employeeIdSet = new Set<string>();
  for (const a of sa) { if (!isRec(a)) continue; const s = safeStr(a, "status"); if (s === "applied") shiftAppsApplied++; else if (s === "shortlisted" || s === "waiting") shiftShortlisted++; else if (s === "confirmed") shiftConfirmed++; else if (s === "rejected") shiftRejected++; const eid = safeStr(a, "id"); if (eid) employeeIdSet.add(eid); }

  let shiftWsActive = 0;
  for (const w of sw) { if (!isRec(w)) continue; const s = safeStr(w, "status"); if (s === "active" || s === "upcoming") shiftWsActive++; }
  const shiftFillRate = shiftTotalVacancies > 0 ? Math.round((shiftTotalConfirmed / shiftTotalVacancies) * 100) : 0;

  let careerActive = 0; let careerPaused = 0; let careerClosed = 0;
  for (const p of cp) { if (!isRec(p)) continue; const st = safeStr(p, "status"); if (st === "active") careerActive++; else if (st === "paused") careerPaused++; else if (st === "closed" || st === "filled") careerClosed++; }

  let caApplied = 0; let caShortlisted = 0; let caInterview = 0; let caOffered = 0; let caHired = 0; let caRejected = 0;
  for (const a of ca) { if (!isRec(a)) continue; const s = safeStr(a, "stage") || safeStr(a, "status"); if (s === "applied") caApplied++; else if (s === "shortlisted") caShortlisted++; else if (s === "interview") caInterview++; else if (s === "offered") caOffered++; else if (s === "hired") caHired++; else if (s === "rejected") caRejected++; const eid = safeStr(a, "employeeId"); if (eid) employeeIdSet.add(eid); }
  const totalCareerApps = caApplied + caShortlisted + caInterview + caOffered + caHired + caRejected;
  const careerConversion = totalCareerApps > 0 ? Math.round((caHired / totalCareerApps) * 100) : 0;

  let careerWsActive = 0;
  for (const w of cw) { if (!isRec(w)) continue; const s = safeStr(w, "status"); if (s === "active" || s === "onboarding") careerWsActive++; }

  const employers = (sp.length > 0 || cp.length > 0) ? 1 : 0;
  const employees = employeeIdSet.size || ((sa.length + ca.length) > 0 ? 1 : 0);

  const activity: ActivityItem[] = [];
  for (const item of sLog) { if (!isRec(item)) continue; const id = safeStr(item, "id"); const title = safeStr(item, "title"); const createdAt = safeNum(item, "createdAt"); if (id && title && createdAt) activity.push({ id, domain: "shift", kind: safeStr(item, "kind"), title, body: safeStr(item, "body") || undefined, createdAt }); }
  for (const item of cLog) { if (!isRec(item)) continue; const id = safeStr(item, "id"); const title = safeStr(item, "title"); const createdAt = safeNum(item, "createdAt"); if (id && title && createdAt) activity.push({ id, domain: "career", kind: safeStr(item, "kind"), title, body: safeStr(item, "body") || undefined, createdAt }); }
  activity.sort((a, b) => b.createdAt - a.createdAt);

  let storageBytes = 0; let storageKeys = 0; let lastActivityTs = 0;
  try { storageKeys = localStorage.length; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k) { const v = localStorage.getItem(k); if (v) storageBytes += k.length + v.length; } } } catch { /* ignore */ }
  if (activity.length > 0) lastActivityTs = activity[0].createdAt;

  const wfStaffArr = safeArr(K.wfStaff);
  const wfAnnArr = safeArr(K.wfAnnouncements);
  const wfGrpArr = safeArr(K.wfGroups);
  const wfAttArr = safeArr(K.wfAttendance);
  const wfActArr = safeArr(K.wfActivity);

  let wfStaffActive = 0;
  for (const s of wfStaffArr) { if (isRec(s) && safeStr(s, "status") === "active") wfStaffActive++; }

  let wfAnnOpen = 0; let wfAnnConfirmed = 0;
  for (const a of wfAnnArr) { if (!isRec(a)) continue; const st = safeStr(a, "status"); if (st === "open") wfAnnOpen++; else if (st === "confirmed") wfAnnConfirmed++; }

  let wfGroupsActive = 0;
  for (const g of wfGrpArr) { if (isRec(g) && safeStr(g, "status") === "active") wfGroupsActive++; }

  const wfAttendanceTotal = wfAttArr.length;

  for (const item of wfActArr) { if (!isRec(item)) continue; const id = safeStr(item, "id"); const title = safeStr(item, "title"); const createdAt = safeNum(item, "createdAt"); if (id && title && createdAt) activity.push({ id, domain: "shift", kind: safeStr(item, "kind"), title: `[WF] ${title}`, body: safeStr(item, "body") || undefined, createdAt }); }
  activity.sort((a, b) => b.createdAt - a.createdAt);

  return { employers, employees, shiftTotal: sp.length, shiftActive, shiftCompleted, shiftCancelled, shiftAppsApplied, shiftShortlisted, shiftConfirmed, shiftRejected, shiftWorkspacesActive: shiftWsActive, shiftFillRate, careerTotal: cp.length, careerActive, careerPaused, careerClosed, careerAppsApplied: caApplied, careerShortlisted: caShortlisted, careerInterview: caInterview, careerOffered: caOffered, careerHired: caHired, careerRejected: caRejected, careerWorkspacesActive: careerWsActive, careerConversion, activity: activity.slice(0, 30), totalEvents: activity.length, storageBytes, storageKeys, lastActivityTs, wfStaffActive, wfAnnOpen, wfAnnConfirmed, wfGroupsActive, wfAttendanceTotal };
}

// ─────────────────────────────────────────────────────────────────────────────
// Reactive
// ─────────────────────────────────────────────────────────────────────────────

const EVS = ["wm:employer-shift-posts-changed", "wm:employee-shift-applications-changed", "wm:employee-shift-workspaces-changed", "wm:employer-shift-activity-changed", "wm:employer-career-posts-changed", "wm:employee-career-applications-changed", "wm:employee-career-workspaces-changed", "wm:employer-career-activity-changed", "wm:workforce-staff-changed", "wm:workforce-announcements-changed", "wm:workforce-groups-changed", "wm:workforce-attendance-changed", "wm:workforce-activity-changed", "storage", "focus"];
let ck = ""; let cd: AdminData | null = null;
function snap(): AdminData { const k = [localStorage.getItem(K.shiftPosts), localStorage.getItem(K.shiftApps), localStorage.getItem(K.careerPosts), localStorage.getItem(K.careerApps), localStorage.getItem(K.shiftLog), localStorage.getItem(K.careerLog), localStorage.getItem(K.shiftWorkspaces), localStorage.getItem(K.careerWorkspaces), localStorage.getItem(K.wfStaff), localStorage.getItem(K.wfAnnouncements), localStorage.getItem(K.wfGroups)].join("|"); if (k === ck && cd) return cd; ck = k; cd = compute(); return cd; }
function sub(cb: () => void): () => void { const h = () => cb(); for (const ev of EVS) window.addEventListener(ev, h); document.addEventListener("visibilitychange", h); return () => { for (const ev of EVS) window.removeEventListener(ev, h); document.removeEventListener("visibilitychange", h); }; }

// ─────────────────────────────────────────────────────────────────────────────
// Format
// ─────────────────────────────────────────────────────────────────────────────

function fmtDate(ts: number): string { if (!ts) return "—"; try { return new Date(ts).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); } catch { return "—"; } }
function fmtBytes(b: number): string { if (b < 1024) return `${b} B`; if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`; return `${(b / 1048576).toFixed(2)} MB`; }
function relTime(ts: number): string { const m = Math.floor((Date.now() - ts) / 60000); if (m < 1) return "just now"; if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`; }

function exportAllData() { try { const data: Record<string, unknown> = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!k) continue; try { data[k] = JSON.parse(localStorage.getItem(k) ?? "null"); } catch { data[k] = localStorage.getItem(k); } } const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `workmitra-export-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url); } catch { /* ignore */ } }

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function AdminHomePage() {
  const nav = useNavigate();
  const d = useSyncExternalStore(sub, snap, snap);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const handleReset = useCallback(() => { localStorage.clear(); window.location.reload(); }, []);

  const totalHired = d.shiftConfirmed + d.careerHired;
  const totalPosts = d.shiftTotal + d.careerTotal;
  const totalApps = d.shiftAppsApplied + d.shiftShortlisted + d.shiftConfirmed + d.shiftRejected + d.careerAppsApplied + d.careerShortlisted + d.careerInterview + d.careerOffered + d.careerHired + d.careerRejected;

  return (
    <div className="wm-ad-fadeIn">
      <CenterModal open={showResetConfirm} onBackdropClose={() => setShowResetConfirm(false)} ariaLabel="Reset Demo Data">
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 1000, color: "#dc2626" }}>Reset All Demo Data?</div>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 8, lineHeight: 1.6 }}>This will clear ALL localStorage data — posts, applications, workspaces, notifications, activity logs. This cannot be undone.</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
            <button type="button" onClick={() => setShowResetConfirm(false)} style={{ fontSize: 13, fontWeight: 800, padding: "8px 16px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", color: "#111827", cursor: "pointer" }}>Cancel</button>
            <button type="button" onClick={handleReset} style={{ fontSize: 13, fontWeight: 900, padding: "8px 20px", borderRadius: 10, border: "none", background: "#dc2626", color: "#fff", cursor: "pointer" }}>Reset Everything</button>
          </div>
        </div>
      </CenterModal>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.7, color: "var(--wm-ad-navy)", display: "flex", alignItems: "center", gap: 12 }}>
          System Overview
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--wm-ad-green-dim)", border: "1px solid var(--wm-ad-green-border)", padding: "4px 12px 4px 9px", borderRadius: 999 }}>
            <span className="wm-ad-healthDot" style={{ width: 7, height: 7, marginTop: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 800, color: "var(--wm-ad-green)", letterSpacing: 0.8 }}>LIVE</span>
          </span>
        </div>
        <div style={{ fontSize: 13.5, color: "var(--wm-ad-navy-400)", marginTop: 5 }}>Real-time monitoring across all domains</div>
      </div>

      {/* KPIs */}
      <Sec label="Platform Metrics" />
      <div className="wm-ad-kpiCard">
        <div className="wm-ad-kpiGrid">
          <Kpi label="Employers" value={d.employers} color="#7c3aed" />
          <Kpi label="Employees" value={d.employees} color="#0891b2" />
          <Kpi label="Total Posts" value={totalPosts} color="var(--wm-ad-navy)" />
          <Kpi label="Applications" value={totalApps} color="var(--wm-ad-navy-600)" />
          <Kpi label="Hired" value={totalHired} color="var(--wm-ad-green)" />
          <Kpi label="Audit Events" value={d.totalEvents} color="var(--wm-ad-navy-500)" />
        </div>
      </div>

      {/* Domain Health */}
      <Sec label="Domain Health" />

      {/* Shift */}
      <DomainCard title="Shift Jobs" tag="TEMPORARY" accent="var(--wm-ad-shift)" dimBg="var(--wm-ad-shift-dim)" borderColor="var(--wm-ad-shift-border)">
        <div className="wm-ad-domainGrid">
          <M label="Posts" value={d.shiftTotal} color="var(--wm-ad-shift)" />
          <M label="Active" value={d.shiftActive} color="var(--wm-ad-shift)" />
          <M label="Done" value={d.shiftCompleted} color="var(--wm-ad-shift)" />
          <M label="Applied" value={d.shiftAppsApplied} color="var(--wm-ad-shift)" />
          <M label="Selected" value={d.shiftShortlisted} color="var(--wm-ad-shift)" />
          <M label="Confirmed" value={d.shiftConfirmed} color="var(--wm-ad-shift)" />
          <M label="Groups" value={d.shiftWorkspacesActive} color="var(--wm-ad-shift)" />
          <M label="Fill Rate" value={d.shiftFillRate} color="var(--wm-ad-shift)" suffix="%" />
        </div>
      </DomainCard>

      {/* Career */}
      <DomainCard title="Career Jobs" tag="PERMANENT" accent="var(--wm-ad-career)" dimBg="var(--wm-ad-career-dim)" borderColor="var(--wm-ad-career-border)" tagColor="var(--wm-ad-career-light)">
        <div className="wm-ad-domainGrid">
          <M label="Posts" value={d.careerTotal} color="var(--wm-ad-career)" />
          <M label="Active" value={d.careerActive} color="var(--wm-ad-career)" />
          <M label="Paused" value={d.careerPaused} color="var(--wm-ad-career)" />
          <M label="Applied" value={d.careerAppsApplied} color="var(--wm-ad-career)" />
          <M label="Selected" value={d.careerShortlisted} color="var(--wm-ad-career)" />
          <M label="Interview" value={d.careerInterview} color="var(--wm-ad-career)" />
          <M label="Offered" value={d.careerOffered} color="var(--wm-ad-career)" />
          <M label="Hired" value={d.careerHired} color="var(--wm-ad-career)" />
        </div>
        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <div style={{ flex: "1 1 0", maxWidth: "calc(25% - 6px)" }}><M label="Rejected" value={d.careerRejected} color="var(--wm-ad-career)" /></div>
          <div style={{ flex: "1 1 0", maxWidth: "calc(25% - 6px)" }}><M label="Conversion" value={d.careerConversion} color="var(--wm-ad-green)" suffix="%" /></div>
        </div>
      </DomainCard>

      {/* Workforce */}
      <DomainCard title="Workforce Ops Hub" tag="OPERATIONS" accent="var(--wm-ad-workforce)" dimBg="var(--wm-ad-workforce-dim)" borderColor="var(--wm-ad-workforce-border)">
        <div className="wm-ad-domainGrid">
          <M label="Staff" value={d.wfStaffActive} color="var(--wm-ad-workforce)" />
          <M label="Open" value={d.wfAnnOpen} color="var(--wm-ad-workforce)" />
          <M label="Confirmed" value={d.wfAnnConfirmed} color="var(--wm-ad-workforce)" />
          <M label="Groups" value={d.wfGroupsActive} color="var(--wm-ad-workforce)" />
          <M label="Attendance" value={d.wfAttendanceTotal} color="var(--wm-ad-workforce)" />
        </div>
      </DomainCard>

      {/* Actions */}
      <Sec label="Quick Actions" />
      <div className="wm-ad-actions">
        <button type="button" className="wm-ad-actionBtn" data-variant="default" onClick={() => nav(ROUTE_PATHS.adminAlerts)}>Audit Log</button>
        <button type="button" className="wm-ad-actionBtn" data-variant="green" onClick={exportAllData}>Export Data</button>
        <button type="button" className="wm-ad-actionBtn" data-variant="danger" onClick={() => setShowResetConfirm(true)}>Reset All</button>
      </div>

      {/* Health */}
      <Sec label="System Status" />
      <div className="wm-ad-healthBar">
        <div className="wm-ad-healthDot" />
        <div>
          <div className="wm-ad-healthTitle">All Systems Operational</div>
          <div className="wm-ad-healthSub">Phase-0 localStorage mode. No backend dependency.</div>
          <div className="wm-ad-healthStats">
            <span className="wm-ad-healthStat">Storage: <strong>{fmtBytes(d.storageBytes)}</strong></span>
            <span className="wm-ad-healthStat">Keys: <strong>{d.storageKeys}</strong></span>
            {d.lastActivityTs > 0 && <span className="wm-ad-healthStat">Last: <strong>{relTime(d.lastActivityTs)}</strong></span>}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <Sec label="Recent Activity" />
      <div className="wm-ad-timelineCard">
        <button type="button" className="wm-ad-timelineToggle" onClick={() => setShowTimeline((v) => !v)}>
          <span>Activity Timeline</span>
          <span className="wm-ad-timelineCount">{showTimeline ? "Hide" : `${d.activity.length} events ▾`}</span>
        </button>
        {showTimeline && (
          <div style={{ padding: "0 22px 22px" }}>
            {d.activity.length === 0 ? (
              <div className="wm-ad-empty">No activity yet. Events from Shift and Career domains will appear here.</div>
            ) : (
              <>
                {d.activity.map((a, i) => <TlEntry key={a.id} item={a} isLast={i === d.activity.length - 1} />)}
                <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => nav(ROUTE_PATHS.adminAlerts)} style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-ad-navy-300)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>View full audit log</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Components
// ─────────────────────────────────────────────────────────────────────────────

function Sec({ label }: { label: string }) {
  return <div className="wm-ad-secHead"><span className="wm-ad-secLabel">{label}</span><div className="wm-ad-secLine" /></div>;
}

function Kpi({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="wm-ad-kpiTile">
      <div className="wm-ad-kpiValue" style={{ color }} data-zero={value === 0}>{value}</div>
      <div className="wm-ad-kpiLabel">{label}</div>
    </div>
  );
}

function DomainCard({ title, tag, accent, dimBg, borderColor, tagColor, children }: {
  title: string; tag: string; accent: string; dimBg: string; borderColor: string; tagColor?: string; children: React.ReactNode;
}) {
  return (
    <div className="wm-ad-domainCard">
      <div className="wm-ad-domainBar" style={{ background: accent }} />
      <div className="wm-ad-domainHead">
        <div className="wm-ad-domainTitle" style={{ color: accent }}>{title}</div>
        <div className="wm-ad-domainTag" style={{ background: dimBg, color: tagColor ?? accent, border: `1px solid ${borderColor}` }}>{tag}</div>
      </div>
      {children}
    </div>
  );
}

function M({ label, value, color, suffix }: { label: string; value: number; color: string; suffix?: string }) {
  return (
    <div className="wm-ad-metricCell">
      <div className="wm-ad-metricVal" style={{ color }} data-zero={value === 0}>{value}{suffix ?? ""}</div>
      <div className="wm-ad-metricLabel">{label}</div>
    </div>
  );
}

function TlEntry({ item, isLast }: { item: ActivityItem; isLast: boolean }) {
  const dotColor = item.domain === "shift" ? "var(--wm-ad-shift)" : "var(--wm-ad-career-light)";
  const shadow = item.domain === "shift" ? "0 0 0 3px var(--wm-ad-shift-dim)" : "0 0 0 3px var(--wm-ad-career-dim)";
  return (
    <div className="wm-ad-tlItem">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 16, flexShrink: 0 }}>
        <div className="wm-ad-tlDot" style={{ background: dotColor, boxShadow: shadow }} />
        {!isLast && <div className="wm-ad-tlLine" />}
      </div>
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
            <span className="wm-ad-tlBadge" data-domain={item.domain}>{item.domain === "shift" ? "SHIFT" : "CAREER"}</span>
            <span className="wm-ad-tlTitle">{item.title}</span>
          </div>
          <span className="wm-ad-tlTime">{fmtDate(item.createdAt)}</span>
        </div>
        {item.body && <div className="wm-ad-tlBody">{item.body}</div>}
      </div>
    </div>
  );
}