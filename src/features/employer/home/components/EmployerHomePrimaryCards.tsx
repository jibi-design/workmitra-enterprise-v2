// src/features/employer/home/components/EmployerHomePrimaryCards.tsx

import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";

import type { DashboardData } from "../helpers/employerHomeDashboard";
import { TAP_TO_MANAGE } from "../helpers/employerHomeConstants";
import { IconShift, IconCareer, IconPlus } from "./employerHomeIcons";
import type { CSSProperties } from "react";

/* ------------------------------------------------ */
/* Shared action button base style                  */
/* ------------------------------------------------ */
const ACTION_BTN_BASE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
  minWidth: 100,
  padding: "8px 16px",
  fontSize: 12,
  fontWeight: 600,
  borderRadius: 8,
  whiteSpace: "nowrap",
  textAlign: "center",
};

/* ------------------------------------------------ */
/* Zero-value chip styling                          */
/* ------------------------------------------------ */
const ZERO_CHIP: CSSProperties = {
  color: "#9ca3af",
  background: "rgba(100, 116, 139, 0.06)",
};

/* ------------------------------------------------ */
/* Shift Jobs Card                                  */
/* ------------------------------------------------ */
export function ShiftJobsCard({ data }: { data: DashboardData }) {
  const nav = useNavigate();
  return (
    <section
      className="wm-er-card wm-er-accentCard wm-er-vShift"
      role="button" tabIndex={0} aria-label="Open Shift Jobs"
      onClick={() => nav(ROUTE_PATHS.employerShiftHome)}
      onKeyDown={(e) => { if (e.key === "Enter") nav(ROUTE_PATHS.employerShiftHome); }}
      style={{ cursor: "pointer" }}
    >
      <div className="wm-er-headTint">
        <div className="wm-er-cardHead">
          <div className="wm-er-titleRow">
            <div className="wm-er-domainIcon"><IconShift /></div>
            <div>
              <div className="wm-er-cardTitle">Shift Jobs</div>
              <div className="wm-er-cardSub" style={{ whiteSpace: "normal", maxWidth: "none" }}>
                Find workers for daily and weekly jobs.
              </div>
            </div>
          </div>
          <button className="wm-primarybtn" type="button"
            onClick={(e) => { e.stopPropagation(); nav(ROUTE_PATHS.employerShiftCreate); }}
            aria-label="Create new shift"
            style={ACTION_BTN_BASE}>
            <IconPlus /> New Shift
          </button>
        </div>
      </div>
      <div className="wm-er-chips">
         <span className="wm-er-chip" style={data.shiftActive === 0 ? ZERO_CHIP : undefined}>Posts: <span className="n">{data.shiftActive}</span></span>
        <span className="wm-er-chip" style={data.shiftApplications === 0 ? ZERO_CHIP : undefined}>Applications: <span className="n">{data.shiftApplications}</span></span>
        <span className="wm-er-chip" style={data.shiftConfirmed === 0 ? ZERO_CHIP : undefined}>Confirmed: <span className="n">{data.shiftConfirmed}</span></span>
        <span className="wm-er-chip" style={data.shiftGroups === 0 ? ZERO_CHIP : undefined}>Groups: <span className="n">{data.shiftGroups}</span></span>
      </div>
      <div style={TAP_TO_MANAGE("var(--wm-er-accent-shift)")}>Tap to manage →</div>
    </section>
  );
}

/* ------------------------------------------------ */
/* Career Jobs Card                                 */
/* ------------------------------------------------ */
export function CareerJobsCard({ data }: { data: DashboardData }) {
  const nav = useNavigate();
  return (
    <section
      className="wm-er-card wm-er-accentCard wm-er-vCareer"
      role="button" tabIndex={0} aria-label="Open Career Jobs"
      onClick={() => nav(ROUTE_PATHS.employerCareerHome)}
      onKeyDown={(e) => { if (e.key === "Enter") nav(ROUTE_PATHS.employerCareerHome); }}
      style={{ cursor: "pointer" }}
    >
      <div className="wm-er-headTint">
        <div className="wm-er-cardHead">
          <div className="wm-er-titleRow">
            <div className="wm-er-domainIcon"><IconCareer /></div>
            <div>
              <div className="wm-er-cardTitle">Career Jobs</div>
              <div className="wm-er-cardSub" style={{ whiteSpace: "normal", maxWidth: "none" }}>
                Post permanent roles and manage candidates.
              </div>
            </div>
          </div>
          <button className="wm-primarybtn" type="button"
            onClick={(e) => { e.stopPropagation(); nav(ROUTE_PATHS.employerCareerCreate); }}
            aria-label="Create new job"
            style={{ ...ACTION_BTN_BASE, background: "var(--wm-er-accent-career, #1d4ed8)", color: "#fff" }}>
            <IconPlus /> New Job
          </button>
        </div>
      </div>
      <div className="wm-er-chips">
        <span className="wm-er-chip" style={data.careerActive === 0 ? ZERO_CHIP : undefined}>Posts: <span className="n">{data.careerActive}</span></span>
        <span className="wm-er-chip" style={data.careerApplications === 0 ? ZERO_CHIP : undefined}>Applications: <span className="n">{data.careerApplications}</span></span>
        <span className="wm-er-chip" style={data.careerInterviews === 0 ? ZERO_CHIP : undefined}>Interviews: <span className="n">{data.careerInterviews}</span></span>
        <span className="wm-er-chip" style={data.careerOffered === 0 ? ZERO_CHIP : undefined}>Offered: <span className="n">{data.careerOffered}</span></span>
      </div>
      <div style={TAP_TO_MANAGE("var(--wm-er-accent-career)")}>Tap to manage →</div>
    </section>
  );
}

/* ------------------------------------------------ */
/* HR Management Card (Purple) — Premium style      */
/* ------------------------------------------------ */
export function HRManagementCard({ data }: { data: DashboardData }) {
  const nav = useNavigate();

  {
    return (
      <section
        className="wm-er-card wm-er-accentCard wm-er-vHR"
        role="button" tabIndex={0} aria-label="Open HR Management"
        onClick={() => nav(ROUTE_PATHS.employerHRManagement)}
        onKeyDown={(e) => { if (e.key === "Enter") nav(ROUTE_PATHS.employerHRManagement); }}
        style={{ cursor: "pointer", "--wm-er-accent": "var(--wm-er-accent-hr)", "--wm-er-wash": "rgba(124, 58, 237, 0.07)" } as React.CSSProperties}
      >
        <div className="wm-er-headTint">
          <div className="wm-er-cardHead">
            <div className="wm-er-titleRow">
              <div className="wm-er-domainIcon">
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M14 6V4h-4v2h4ZM4 8v11h16V8H4Zm16-2c1.11 0 2 .89 2 2v11c0 1.11-.89 2-2 2H4c-1.11 0-2-.89-2-2l.01-11c0-1.11.88-2 1.99-2h4V4c0-1.11.89-2 2-2h4c1.11 0 2 .89 2 2v2h4Z" />
                </svg>
              </div>
              <div>
                <div className="wm-er-cardTitle">HR Management</div>
                <div className="wm-er-cardSub" style={{ whiteSpace: "normal", maxWidth: "none" }}>
                  Hiring pipeline, reviews, and exit processing.
                </div>
              </div>
            </div>
            <button className="wm-primarybtn" type="button"
              onClick={(e) => { e.stopPropagation(); nav(ROUTE_PATHS.employerHRManagement); }}
              aria-label="Manage HR"
              style={{ ...ACTION_BTN_BASE, background: "var(--wm-er-accent-hr)" }}>
              Manage
            </button>
          </div>
        </div>
        <div className="wm-er-chips">
          <span className="wm-er-chip" style={data.hrTotal === 0 ? ZERO_CHIP : undefined}>Total: <span className="n">{data.hrTotal}</span></span>
          <span className="wm-er-chip" style={data.hrActive === 0 ? ZERO_CHIP : undefined}>Active: <span className="n">{data.hrActive}</span></span>
          <span className="wm-er-chip" style={data.hrPending === 0 ? ZERO_CHIP : undefined}>Pending: <span className="n">{data.hrPending}</span></span>
          <span className="wm-er-chip" style={data.hrExited === 0 ? ZERO_CHIP : undefined}>Exited: <span className="n">{data.hrExited}</span></span>
        </div>
        <div style={TAP_TO_MANAGE("var(--wm-er-accent-hr)")}>Tap to manage →</div>
      </section>
    );
  }

  return (
    <section className="wm-er-card" style={{ opacity: 0.7 }}>
      <div style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(107, 114, 128, 0.08)", color: "var(--wm-er-muted)", flexShrink: 0,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2Zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2Zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2Z" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: "var(--wm-er-text)" }}>HR Management</div>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2, lineHeight: 1.4 }}>
            Professional HR tools — hiring pipeline, leave management, and exit processing.
          </div>
          <div style={{
            marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 11, fontWeight: 800, color: "var(--wm-er-accent-hr)", cursor: "pointer",
          }}
            role="button" tabIndex={0}
            onClick={() => nav(ROUTE_PATHS.employerSettings)}
            onKeyDown={(e) => { if (e.key === "Enter") nav(ROUTE_PATHS.employerSettings); }}
          >
            Enable in Settings →
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------ */
/* Manager Console Card (Ocean Blue) — Premium      */
/* ------------------------------------------------ */
export function ManagerConsoleCard({ data }: { data: DashboardData }) {
  const nav = useNavigate();
  return (
    <section
      className="wm-er-card wm-er-accentCard wm-er-vConsole"
      role="button" tabIndex={0} aria-label="Open Manager Console"
      onClick={() => nav(ROUTE_PATHS.employerConsole)}
      onKeyDown={(e) => { if (e.key === "Enter") nav(ROUTE_PATHS.employerConsole); }}
      style={{ cursor: "pointer", "--wm-er-accent": "var(--wm-er-accent-console)", "--wm-er-wash": "rgba(3, 105, 161, 0.07)" } as React.CSSProperties}
    >
      <div className="wm-er-headTint">
        <div className="wm-er-cardHead">
          <div className="wm-er-titleRow">
            <div className="wm-er-domainIcon">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" />
              </svg>
            </div>
            <div>
              <div className="wm-er-cardTitle">Manager Console</div>
              <div className="wm-er-cardSub" style={{ whiteSpace: "normal", maxWidth: "none" }}>
                Attendance, tasks, roster, and notices.
              </div>
            </div>
          </div>
          <button className="wm-primarybtn" type="button"
            onClick={(e) => { e.stopPropagation(); nav(ROUTE_PATHS.employerConsole); }}
            aria-label="Open Console"
            style={{ ...ACTION_BTN_BASE, background: "var(--wm-er-accent-console)" }}>
            Console
          </button>
        </div>
      </div>
      <div className="wm-er-chips">
        <span className="wm-er-chip" style={data.consolePresentToday === 0 ? ZERO_CHIP : undefined}>Present: <span className="n">{data.consolePresentToday}</span></span>
        <span className="wm-er-chip" style={data.consoleAbsentToday === 0 ? ZERO_CHIP : undefined}>Absent: <span className="n">{data.consoleAbsentToday}</span></span>
        <span className="wm-er-chip" style={data.consoleActiveTasks === 0 ? ZERO_CHIP : undefined}>Tasks: <span className="n">{data.consoleActiveTasks}</span></span>
        <span className="wm-er-chip" style={data.consoleAlerts === 0 ? ZERO_CHIP : undefined}>Alerts: <span className="n">{data.consoleAlerts}</span></span>
      </div>
      <div style={TAP_TO_MANAGE("var(--wm-er-accent-console)")}>Tap to manage →</div>
    </section>
  );
}