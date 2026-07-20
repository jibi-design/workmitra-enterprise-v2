// App name: Job Mitra
// File name: EmployerManagerConsoleCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\home\components\EmployerManagerConsoleCard.tsx

import { useCallback } from "react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { TAP_TO_MANAGE } from "../helpers/employerHomeConstants";
import { getConsoleStats } from "../helpers/employerHomeStatsReaders";
import { IconStaffGroup } from "./employerHomeIcons";
import { ACTION_BTN, CONSOLE_ACCENT, ZERO_CHIP } from "./employerHomeCardStyles";

export function ManagerConsoleCard() {
  const nav = useNavigate();
  const stats = getConsoleStats();

  const handleOpen = useCallback(() => {
    nav(ROUTE_PATHS.employerConsole);
  }, [nav]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") nav(ROUTE_PATHS.employerConsole);
    },
    [nav],
  );

  const handleBtn = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      nav(ROUTE_PATHS.employerConsole);
    },
    [nav],
  );

  return (
    <section
      className="wm-er-card wm-er-accentCard"
      role="button"
      tabIndex={0}
      aria-label="Open Manager Console"
      onClick={handleOpen}
      onKeyDown={handleKey}
      style={
        {
          cursor: "pointer",
          "--wm-er-accent": CONSOLE_ACCENT,
          "--wm-er-wash": "rgba(3,105,161,0.05)",
        } as CSSProperties
      }
    >
      <div className="wm-er-headTint">
        <div className="wm-er-cardHead">
          <div className="wm-er-titleRow">
            <div className="wm-er-domainIcon">
              <IconStaffGroup />
            </div>
            <div>
              <div className="wm-er-cardTitle">Manager Console</div>
              <div className="wm-er-cardSub" style={{ whiteSpace: "normal", maxWidth: "none" }}>
                Daily operations hub for attendance, tasks and notices.
              </div>
            </div>
          </div>
          <button
            className="wm-primarybtn"
            type="button"
            onClick={handleBtn}
            aria-label="Open Manager Console"
            style={{ ...ACTION_BTN, background: CONSOLE_ACCENT }}
          >
            Open Console
          </button>
        </div>
      </div>

      <div className="wm-er-chips">
        <span className="wm-er-chip" style={stats.tasks === 0 ? ZERO_CHIP : undefined}>
          Tasks: <span className="n">{stats.tasks}</span>
        </span>
        <span className="wm-er-chip" style={stats.leave === 0 ? ZERO_CHIP : undefined}>
          Leave: <span className="n">{stats.leave}</span>
        </span>
        <span className="wm-er-chip" style={stats.incidents === 0 ? ZERO_CHIP : undefined}>
          Incidents: <span className="n">{stats.incidents}</span>
        </span>
      </div>

      <div style={TAP_TO_MANAGE(CONSOLE_ACCENT)}>Tap to manage</div>
    </section>
  );
}
