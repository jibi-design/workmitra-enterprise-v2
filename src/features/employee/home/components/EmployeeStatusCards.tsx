// src/features/employee/home/components/EmployeeStatusCards.tsx
// CurrentEmploymentCard, WorkVaultCard, InsightsCard, SimpleModal.
// Session 15: Dots grey, vault pills, dead prop removed, em dash,
// ROUTE_PATHS, CSS vars, useCallback. fontWeight max 700.

import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { employmentLifecycleStorage } from "../../employment/storage/employmentLifecycle.storage";
import { formatNumber } from "../helpers/employeeHomeHelpers";
import { IconInsights } from "./employeeHomeIcons";

/* ---- Style tokens ---- */
const V = {
  vault: "var(--wm-vault-accent, #7c3aed)",
  insights: "var(--wm-insights-accent, #64748b)",
  shift: "var(--wm-shift-accent, #16a34a)",
  rating: "var(--wm-rating-accent, #d97706)",
  console: "var(--wm-console-accent, #0369a1)",
  zero: "var(--wm-zero-text, #94a3b8)",
  zeroBg: "var(--wm-zero-bg, #f1f5f9)",
  muted: "var(--wm-text-muted, #64748b)",
  text: "var(--wm-er-text, #1e293b)",
  border: "1px solid rgba(0,0,0,0.06)",
} as const;

/* ---- KPI helpers ---- */
function getAttendanceThisMonth(hrId: string): number {
  try {
    const raw = localStorage.getItem("wm_attendance_log_v1");
    if (!raw) return 0;
    const all = JSON.parse(raw) as Record<string, { status: string }>;
    const now = new Date();
    const pfx = `${hrId}_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return Object.entries(all).filter(([k, v]) => k.startsWith(pfx) && v.status === "present").length;
  } catch { return 0; }
}

function getActiveTasksCount(hrId: string): number {
  try {
    const raw = localStorage.getItem("wm_task_assignments_v1");
    if (!raw) return 0;
    const all = JSON.parse(raw) as { employeeId: string; status: string }[];
    return all.filter((t) => t.employeeId === hrId && (t.status === "pending" || t.status === "in_progress")).length;
  } catch { return 0; }
}

function getUnreadNoticesCount(): number {
  try {
    const raw = localStorage.getItem("wm_company_notices_v1");
    if (!raw) return 0;
    return (JSON.parse(raw) as { readReceipts?: string[] }[]).filter((n) => !n.readReceipts || n.readReceipts.length === 0).length;
  } catch { return 0; }
}

function KpiPill({ label, value }: { label: string; value: number }) {
  const z = value === 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", color: z ? V.zero : V.console, background: z ? V.zeroBg : "rgba(3,105,161,0.08)" }}>
      {label}: <span style={{ fontWeight: 700 }}>{value}</span>
    </span>
  );
}

function formatDuration(nowMs: number, joinedAt: number): string {
  const totalDays = Math.floor(Math.max(0, nowMs - joinedAt) / 86400000);
  const years = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);
  if (years > 0) return months > 0 ? `${years} year${years !== 1 ? "s" : ""}, ${months} month${months !== 1 ? "s" : ""}` : `${years} year${years !== 1 ? "s" : ""}`;
  if (months > 0) return `${months} month${months !== 1 ? "s" : ""}`;
  return `${totalDays} day${totalDays !== 1 ? "s" : ""}`;
}

/* ------------------------------------------------ */
/* Current Employment Card (Phase 2 — retained)     */
/* ------------------------------------------------ */
export function CurrentEmploymentCard({ nowMs }: { nowMs: number }) {
  const nav = useNavigate();
  const active = employmentLifecycleStorage.getActive();
  const kpi = useMemo(() => {
    if (!active) return { attendance: 0, tasks: 0, notices: 0 };
    return { attendance: getAttendanceThisMonth(active.id), tasks: getActiveTasksCount(active.id), notices: getUnreadNoticesCount() };
  }, [active]);

  const handleOpen = useCallback(() => { if (active) nav(`/employee/employment/${active.id}`); }, [nav, active]);
  const handleKey = useCallback((e: React.KeyboardEvent) => { if ((e.key === "Enter" || e.key === " ") && active) nav(`/employee/employment/${active.id}`); }, [nav, active]);

  if (!active) {
    return (
      <section className="wm-ee-card" style={{ borderLeft: `4px solid ${V.zero}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: V.zeroBg, color: V.zero }}>
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 6V4h-4v2h4ZM4 8v11h16V8H4Zm16-2c1.11 0 2 .89 2 2v11c0 1.11-.89 2-2 2H4c-1.11 0-2-.89-2-2l.01-11c0-1.11.88-2 1.99-2h4V4c0-1.11.89-2 2-2h4c1.11 0 2 .89 2 2v2h4Z" /></svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: V.text }}>My Current Employment</div>
            <div style={{ fontSize: 12, color: V.zero, marginTop: 4, lineHeight: 1.5 }}>No active employment yet. When an employer hires you, your job details will appear here.</div>
          </div>
        </div>
      </section>
    );
  }

  const dur = formatDuration(nowMs, active.joinedAt);
  const isWarning = active.status === "resignation_pending" || active.status === "notice_period";
  const statusLabel = active.status === "resignation_pending" ? "Resignation Pending" : active.status === "notice_period" ? "Notice Period" : "Currently Working";
  const statusColor = isWarning ? V.rating : V.console;

  return (
    <section className="wm-ee-card" role="button" tabIndex={0} onClick={handleOpen} onKeyDown={handleKey} style={{ borderLeft: `4px solid ${V.console}`, cursor: "pointer" }} aria-label="View employment details">
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(3,105,161,0.08)", color: V.console }}>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 6V4h-4v2h4ZM4 8v11h16V8H4Zm16-2c1.11 0 2 .89 2 2v11c0 1.11-.89 2-2 2H4c-1.11 0-2-.89-2-2l.01-11c0-1.11.88-2 1.99-2h4V4c0-1.11.89-2 2-2h4c1.11 0 2 .89 2 2v2h4Z" /></svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: V.text }}>My Current Employment</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: V.text, marginTop: 3 }}>{active.jobTitle} at {active.companyName}</div>
          <div style={{ fontSize: 12, color: V.muted, marginTop: 2 }}>Working since {dur}</div>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: `${statusColor}14`, color: statusColor, border: `1px solid ${statusColor}33` }}>{statusLabel}</span>
            {active.verified && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "rgba(3,105,161,0.08)", color: V.console, border: "1px solid rgba(3,105,161,0.2)" }}>Verified</span>}
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
            <KpiPill label="Attendance" value={kpi.attendance} /><KpiPill label="Tasks" value={kpi.tasks} /><KpiPill label="Notices" value={kpi.notices} />
          </div>
          <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: V.console }}>Tap to manage &#8594;</div>
        </div>
        <span style={{ fontSize: 16, color: V.muted, flexShrink: 0, marginTop: 2 }}>&#8250;</span>
      </div>
    </section>
  );
}

/* ------------------------------------------------ */
/* Work Vault Card — Premium with stats pills       */
/* ------------------------------------------------ */
type WorkVaultCardProps = { folderCount: number; documentCount: number };

export function WorkVaultCard({ folderCount, documentCount }: WorkVaultCardProps) {
  const nav = useNavigate();
  const handleOpen = useCallback(() => { nav(ROUTE_PATHS.employeeVaultHome); }, [nav]);
  const handleBtn = useCallback((e: React.MouseEvent) => { e.stopPropagation(); nav(ROUTE_PATHS.employeeVaultHome); }, [nav]);
  const handleKey = useCallback((e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") nav(ROUTE_PATHS.employeeVaultHome); }, [nav]);

  return (
    <section className="wm-ee-card wm-ee-accentCard" style={{ cursor: "pointer", "--wm-ee-accent": V.vault, "--wm-ee-wash": "rgba(124,58,237,0.06)" } as React.CSSProperties} role="button" tabIndex={0} onClick={handleOpen} onKeyDown={handleKey} aria-label="Open My Work Vault">
      <div className="wm-ee-headTint">
        <div className="wm-ee-cardHead">
          <div>
            <div className="wm-ee-titleRow">
              <span className="wm-ee-domainIcon" style={{ color: V.vault }} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8Z" /></svg>
              </span>
              <div>
                <div className="wm-ee-cardTitle">My Work Vault</div>
                <div className="wm-ee-cardSub">Your secure digital work identity.</div>
              </div>
            </div>
          </div>
          <button className="wm-primarybtn" type="button" onClick={handleBtn} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 100, padding: "8px 16px", fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", background: V.vault, color: "#fff", whiteSpace: "nowrap" }}>
            Open Vault
          </button>
        </div>
      </div>
      <div className="wm-ee-chips" aria-label="Work Vault stats">
        <span className="wm-ee-chip" style={folderCount === 0 ? { color: V.zero, background: V.zeroBg } : undefined}>Folders: <span className="n">{formatNumber(folderCount)}</span></span>
        <span className="wm-ee-chip" style={documentCount === 0 ? { color: V.zero, background: V.zeroBg } : undefined}>Documents: <span className="n">{formatNumber(documentCount)}</span></span>
      </div>
      <div style={{ marginTop: 10, color: V.vault, fontWeight: 600, fontSize: 12, textAlign: "center" }}>Tap to manage &#8594;</div>
    </section>
  );
}

/* ---- Employee rating helper ---- */
function getEmployeeRatingDisplay(): string {
  try {
    const raw = localStorage.getItem("wm_worker_points_v1");
    if (!raw) return "\u2014";
    const parsed: unknown = JSON.parse(raw);
    const pts = typeof parsed === "number" ? parsed : (typeof parsed === "object" && parsed !== null) ? Number((parsed as Record<string, unknown>)["total"] ?? 0) : 0;
    if (pts <= 0) return "\u2014";
    if (pts >= 600) return "4.5\u2605";
    if (pts >= 300) return "4.0\u2605";
    if (pts >= 100) return "3.5\u2605";
    return "3.0\u2605";
  } catch { return "\u2014"; }
}

/* ------------------------------------------------ */
/* Insights Card — Tappable Rows                    */
/* ------------------------------------------------ */
type InsightsCardProps = { earningsMonth: number; completedShifts: number; onViewHistory: () => void };

export function InsightsCard({ earningsMonth, completedShifts, onViewHistory }: InsightsCardProps) {
  const nav = useNavigate();
  const rd = getEmployeeRatingDisplay();
  const isRZ = rd === "\u2014";

  const handleEarnClick = useCallback((e: React.MouseEvent) => { e.stopPropagation(); nav(ROUTE_PATHS.employeeShiftEarnings); }, [nav]);
  const handleEarnKey = useCallback((e: React.KeyboardEvent) => { if (e.key === "Enter") { e.stopPropagation(); nav(ROUTE_PATHS.employeeShiftEarnings); } }, [nav]);
  const handleShiftClick = useCallback((e: React.MouseEvent) => { e.stopPropagation(); nav(ROUTE_PATHS.employeeShiftApplications); }, [nav]);
  const handleShiftKey = useCallback((e: React.KeyboardEvent) => { if (e.key === "Enter") { e.stopPropagation(); nav(ROUTE_PATHS.employeeShiftApplications); } }, [nav]);
  const handleCardKey = useCallback((e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") onViewHistory(); }, [onViewHistory]);
  const handleBtnClick = useCallback((e: React.MouseEvent) => { e.stopPropagation(); onViewHistory(); }, [onViewHistory]);

  return (
    <section className="wm-ee-card wm-ee-accentCard" style={{ cursor: "pointer", "--wm-ee-accent": V.insights, "--wm-ee-wash": "rgba(100,116,139,0.06)" } as React.CSSProperties} role="button" tabIndex={0} onClick={onViewHistory} onKeyDown={handleCardKey} aria-label="View Insights">
      <div className="wm-ee-headTint">
        <div className="wm-ee-cardHead">
          <div>
            <div className="wm-ee-titleRow">
              <span className="wm-ee-domainIcon" style={{ color: V.insights, background: "rgba(100,116,139,0.08)", border: "none" }} aria-hidden="true"><IconInsights /></span>
              <div>
                <div className="wm-ee-cardTitle">Insights</div>
                <div className="wm-ee-cardSub">Track your earnings and activity.</div>
              </div>
            </div>
          </div>
          <button className="wm-primarybtn" type="button" onClick={handleBtnClick} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 100, padding: "8px 16px", fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", background: V.insights, color: "#fff", whiteSpace: "nowrap" }}>
            View History
          </button>
        </div>
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderTop: V.border, cursor: "pointer" }} role="button" tabIndex={0} onClick={handleEarnClick} onKeyDown={handleEarnKey}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: earningsMonth === 0 ? V.zero : V.shift, flexShrink: 0, marginRight: 10 }} />
          <span style={{ flex: 1, fontSize: 13, color: V.muted, fontWeight: 500 }}>Earnings (month)</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: earningsMonth === 0 ? V.zero : V.text }}>{formatNumber(earningsMonth)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderTop: V.border, cursor: "pointer" }} role="button" tabIndex={0} onClick={handleShiftClick} onKeyDown={handleShiftKey}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: completedShifts === 0 ? V.zero : V.shift, flexShrink: 0, marginRight: 10 }} />
          <span style={{ flex: 1, fontSize: 13, color: V.muted, fontWeight: 500 }}>Completed shifts</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: completedShifts === 0 ? V.zero : V.text }}>{formatNumber(completedShifts)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderTop: V.border }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: isRZ ? V.zero : V.rating, flexShrink: 0, marginRight: 10 }} />
          <span style={{ flex: 1, fontSize: 13, color: V.muted, fontWeight: 500 }}>Your rating</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: isRZ ? V.zero : V.text }}>{rd}</span>
        </div>
      </div>
      <div style={{ padding: "10px 16px 14px", fontSize: 12, fontWeight: 600, color: V.insights, textAlign: "center" }}>Tap to manage &#8594;</div>
    </section>
  );
}

/* ------------------------------------------------ */
/* Simple Modal                                     */
/* ------------------------------------------------ */
type SimpleModalProps = { title: string; body?: string; primaryText?: string; onPrimary?: () => void; secondaryText?: string; onSecondary?: () => void; onClose: () => void };

export function SimpleModal(props: SimpleModalProps) {
  const stopProp = useCallback((e: React.MouseEvent) => { e.stopPropagation(); }, []);
  return (
    <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 }} onClick={props.onClose}>
      <div className="wm-ee-card" style={{ width: "100%", maxWidth: 420 }} onClick={stopProp}>
        <div style={{ fontWeight: 700, color: V.text, fontSize: 16 }}>{props.title}</div>
        {props.body ? <div className="wm-ee-helperText" style={{ marginTop: 8 }}>{props.body}</div> : null}
        <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
          {props.secondaryText ? <button className="wm-secondarybtn" type="button" onClick={props.onSecondary ?? props.onClose}>{props.secondaryText}</button> : null}
          {props.primaryText ? <button className="wm-primarybtn" type="button" onClick={props.onPrimary ?? props.onClose}>{props.primaryText}</button> : <button className="wm-primarybtn" type="button" onClick={props.onClose}>Close</button>}
        </div>
      </div>
    </div>
  );
}