// App name: Job Mitra
// File name: EmployerHRManagementCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\home\components\EmployerHRManagementCard.tsx

import { useCallback } from "react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { TAP_TO_MANAGE } from "../helpers/employerHomeConstants";
import { getHRStats } from "../helpers/employerHomeStatsReaders";
import { IconHRBriefcase } from "./employerHomeIcons";
import { ACTION_BTN, HR_ACCENT, ZERO_CHIP } from "./employerHomeCardStyles";

export function HRManagementCard() {
  const nav = useNavigate();
  const stats = getHRStats();

  const handleOpen = useCallback(() => {
    nav(ROUTE_PATHS.employerHRManagement);
  }, [nav]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") nav(ROUTE_PATHS.employerHRManagement);
    },
    [nav],
  );

  const handleBtn = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      nav(ROUTE_PATHS.employerHRManagement);
    },
    [nav],
  );

  return (
    <section
      className="wm-er-card wm-er-accentCard"
      role="button"
      tabIndex={0}
      aria-label="Open HR Management"
      onClick={handleOpen}
      onKeyDown={handleKey}
      style={
        {
          cursor: "pointer",
          "--wm-er-accent": HR_ACCENT,
          "--wm-er-wash": "rgba(124,58,237,0.05)",
        } as CSSProperties
      }
    >
      <div className="wm-er-headTint">
        <div className="wm-er-cardHead">
          <div className="wm-er-titleRow">
            <div className="wm-er-domainIcon">
              <IconHRBriefcase />
            </div>
            <div>
              <div className="wm-er-cardTitle">HR Management</div>
              <div className="wm-er-cardSub" style={{ whiteSpace: "normal", maxWidth: "none" }}>
                Manage hiring records, onboarding and employee lifecycle.
              </div>
            </div>
          </div>
          <button
            className="wm-primarybtn"
            type="button"
            onClick={handleBtn}
            aria-label="Open HR Management"
            style={{ ...ACTION_BTN, background: HR_ACCENT }}
          >
            Open HR
          </button>
        </div>
      </div>

      <div className="wm-er-chips">
        <span className="wm-er-chip" style={stats.totalRecords === 0 ? ZERO_CHIP : undefined}>
          Records: <span className="n">{stats.totalRecords}</span>
        </span>
        <span className="wm-er-chip" style={stats.activeStaff === 0 ? ZERO_CHIP : undefined}>
          Active: <span className="n">{stats.activeStaff}</span>
        </span>
        <span className="wm-er-chip" style={stats.onboarding === 0 ? ZERO_CHIP : undefined}>
          Onboarding: <span className="n">{stats.onboarding}</span>
        </span>
      </div>

      <div style={TAP_TO_MANAGE(HR_ACCENT)}>Tap to manage</div>
    </section>
  );
}
