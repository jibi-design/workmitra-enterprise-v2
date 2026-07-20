// App name: Job Mitra
// File name: EmployerWorkforceCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\home\components\EmployerWorkforceCard.tsx

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { DashboardData } from "../helpers/employerHomeDashboard";
import { TAP_TO_MANAGE } from "../helpers/employerHomeConstants";
import { IconWorkforce } from "./employerHomeIcons";
import { ACTION_BTN, ZERO_CHIP } from "./employerHomeCardStyles";

export function WorkforceCard({ data }: { data: DashboardData }) {
  const nav = useNavigate();

  const handleOpen = useCallback(() => {
    nav(ROUTE_PATHS.employerWorkforceHome);
  }, [nav]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") nav(ROUTE_PATHS.employerWorkforceHome);
    },
    [nav],
  );

  const handleBtn = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      nav(ROUTE_PATHS.employerWorkforceHome);
    },
    [nav],
  );

  return (
    <section
      className="wm-er-card wm-er-accentCard wm-er-vWorkforce"
      role="button"
      tabIndex={0}
      aria-label="Open Workforce"
      onClick={handleOpen}
      onKeyDown={handleKey}
      style={{ cursor: "pointer" }}
    >
      <div className="wm-er-headTint">
        <div className="wm-er-cardHead">
          <div className="wm-er-titleRow">
            <div className="wm-er-domainIcon">
              <IconWorkforce />
            </div>
            <div>
              <div className="wm-er-cardTitle">Workforce</div>
              <div className="wm-er-cardSub" style={{ whiteSpace: "normal", maxWidth: "none" }}>
                Manage staff, attendance and permissions.
              </div>
            </div>
          </div>
          <button
            className="wm-primarybtn"
            type="button"
            onClick={handleBtn}
            aria-label="View workforce"
            style={ACTION_BTN}
          >
            View Staff
          </button>
        </div>
      </div>

      <div className="wm-er-chips">
        <span className="wm-er-chip" style={data.shiftGroups === 0 ? ZERO_CHIP : undefined}>
          Staff: <span className="n">{data.shiftGroups}</span>
        </span>
        <span className="wm-er-chip" style={data.broadcastMessages === 0 ? ZERO_CHIP : undefined}>
          Alerts: <span className="n">{data.broadcastMessages}</span>
        </span>
        <span className="wm-er-chip" style={data.shiftConfirmed === 0 ? ZERO_CHIP : undefined}>
          Attendance: <span className="n">{data.shiftConfirmed}</span>
        </span>
      </div>

      <div style={TAP_TO_MANAGE("var(--wm-er-accent-workforce)")}>Tap to manage</div>
    </section>
  );
}
