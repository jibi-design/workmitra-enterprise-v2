// src/features/employee/home/components/EmployeeJobCards.tsx
//
// Shift Jobs + Career Jobs domain cards for Employee Home.
// Session 15: Waitlisted rename, Offered pill, Career button blue,
// WorkforceCard removed, hardcoded hex → CSS vars, inline fns → useCallback,
// Tap to manage centered.

import { useCallback } from "react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { formatNumber } from "../helpers/employeeHomeHelpers";
import { IconCalendar, IconBriefcase } from "./employeeHomeIcons";

/* ------------------------------------------------ */
/* Shared styles                                    */
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

const CAREER_BTN: CSSProperties = {
  ...ACTION_BTN_BASE,
  background: "var(--wm-career-accent, #1d4ed8)",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

const ZERO_CHIP: CSSProperties = {
  color: "var(--wm-zero-text, #9ca3af)",
  background: "var(--wm-zero-bg, rgba(100,116,139,0.06))",
};

const TAP_SHIFT: CSSProperties = {
  marginTop: 10,
  color: "var(--wm-shift-accent, #16a34a)",
  fontWeight: 600,
  fontSize: 12,
  cursor: "pointer",
  textAlign: "center",
};

const TAP_CAREER: CSSProperties = {
  marginTop: 10,
  color: "var(--wm-career-accent, #1d4ed8)",
  fontWeight: 600,
  fontSize: 12,
  cursor: "pointer",
  textAlign: "center",
};

/* ------------------------------------------------ */
/* Shift Jobs Card                                  */
/* ------------------------------------------------ */
type ShiftCardProps = {
  waitingList: number;
  confirmed: number;
  activeJobs: number;
};

export function ShiftJobsCard({ waitingList, confirmed, activeJobs }: ShiftCardProps) {
  const nav = useNavigate();

  const handleOpen = useCallback(() => {
    nav(ROUTE_PATHS.employeeShiftCenter);
  }, [nav]);

  const handleBtnClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    nav(ROUTE_PATHS.employeeShiftCenter);
  }, [nav]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") nav(ROUTE_PATHS.employeeShiftCenter);
  }, [nav]);

  return (
    <section
      className="wm-ee-card wm-ee-accentCard wm-ee-vShift"
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      style={{ cursor: "pointer" }}
      aria-label="Open Shift Jobs"
    >
      <div className="wm-ee-headTint">
        <div className="wm-ee-cardHead" style={{ alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div className="wm-ee-titleRow">
              <span className="wm-ee-domainIcon" aria-hidden="true"><IconCalendar /></span>
              <div style={{ minWidth: 0 }}>
                <div className="wm-ee-cardTitle">Shift Jobs</div>
                <div className="wm-ee-cardSub">Browse and apply for available shifts.</div>
              </div>
            </div>
          </div>
          <button
            className="wm-primarybtn"
            type="button"
            onClick={handleBtnClick}
            aria-label="View Shifts"
            style={ACTION_BTN_BASE}
          >
            View
          </button>
        </div>
      </div>

      <div className="wm-ee-chips" aria-label="Shift Jobs stats">
        <span className="wm-ee-chip" style={waitingList === 0 ? ZERO_CHIP : undefined}>
          Waitlisted: <span className="n">{formatNumber(waitingList)}</span>
        </span>
        <span className="wm-ee-chip" style={confirmed === 0 ? ZERO_CHIP : undefined}>
          Confirmed: <span className="n">{formatNumber(confirmed)}</span>
        </span>
        <span className="wm-ee-chip" style={activeJobs === 0 ? ZERO_CHIP : undefined}>
          Jobs: <span className="n">{formatNumber(activeJobs)}</span>
        </span>
      </div>

      <div style={TAP_SHIFT}>Tap to manage &#8594;</div>
    </section>
  );
}

/* ------------------------------------------------ */
/* Career Jobs Card                                 */
/* ------------------------------------------------ */
type CareerCardProps = {
  careerApplied: number;
  careerInterviews: number;
  careerOffered: number;
};

export function CareerJobsCard({ careerApplied, careerInterviews, careerOffered }: CareerCardProps) {
  const nav = useNavigate();

  const handleOpen = useCallback(() => {
    nav(ROUTE_PATHS.employeeCareerHome);
  }, [nav]);

  const handleBtnClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    nav(ROUTE_PATHS.employeeCareerHome);
  }, [nav]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") nav(ROUTE_PATHS.employeeCareerHome);
  }, [nav]);

  return (
    <section
      className="wm-ee-card wm-ee-accentCard wm-ee-vCareer"
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      style={{ cursor: "pointer" }}
      aria-label="Open Career Jobs"
    >
      <div className="wm-ee-headTint">
        <div className="wm-ee-cardHead">
          <div>
            <div className="wm-ee-titleRow">
              <span className="wm-ee-domainIcon" aria-hidden="true"><IconBriefcase /></span>
              <div>
                <div className="wm-ee-cardTitle">Career Jobs</div>
                <div className="wm-ee-cardSub">Apply to permanent roles and track interviews.</div>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleBtnClick}
            aria-label="Explore Jobs"
            style={CAREER_BTN}
          >
            Explore
          </button>
        </div>
      </div>

      <div className="wm-ee-chips" aria-label="Career Jobs stats">
        <span className="wm-ee-chip" style={careerApplied === 0 ? ZERO_CHIP : undefined}>
          Applied: <span className="n">{formatNumber(careerApplied)}</span>
        </span>
        <span className="wm-ee-chip" style={careerInterviews === 0 ? ZERO_CHIP : undefined}>
          Interviews: <span className="n">{formatNumber(careerInterviews)}</span>
        </span>
        <span className="wm-ee-chip" style={careerOffered === 0 ? ZERO_CHIP : undefined}>
          Offered: <span className="n">{formatNumber(careerOffered)}</span>
        </span>
      </div>

      <div style={TAP_CAREER}>Tap to manage &#8594;</div>
    </section>
  );
}

/* ------------------------------------------------ */
/* WorkforceCard — Phase 2 (commented out)          */
/* ------------------------------------------------ */
// Session 15: Removed from launch. Uncomment when Phase 2 begins.
// See master doc section 16 for Phase 2 roadmap.