// App name: Job Mitra
// File name: WorkforceCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\home\components\WorkforceCard.tsx

import { useCallback } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { formatNumber } from "../helpers/employeeHomeHelpers";
import {
  EMPLOYEE_STATUS_BUTTON_STYLE,
  EMPLOYEE_STATUS_COLORS,
  accentCardStyle,
  statusFooterStyle,
  zeroChipStyle,
} from "../helpers/employeeStatusCardStyles";

type WorkforceCardProps = {
  companyCount?: number;
  groupCount?: number;
  announcementCount?: number;
};

export function WorkforceCard({
  companyCount = 0,
  groupCount = 0,
  announcementCount = 0,
}: WorkforceCardProps) {
  const nav = useNavigate();

  const handleOpen = useCallback(() => {
    nav(ROUTE_PATHS.employeeWorkforceHome);
  }, [nav]);

  const handleBtn = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      nav(ROUTE_PATHS.employeeWorkforceHome);
    },
    [nav],
  );

  const handleKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        nav(ROUTE_PATHS.employeeWorkforceHome);
      }
    },
    [nav],
  );

  return (
    <section
      className="wm-ee-card wm-ee-accentCard"
      style={accentCardStyle(EMPLOYEE_STATUS_COLORS.workforce, "rgba(180,83,9,0.06)")}
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKey}
      aria-label="Open Workforce"
    >
      <div className="wm-ee-headTint">
        <div className="wm-ee-cardHead">
          <div>
            <div className="wm-ee-titleRow">
              <span
                className="wm-ee-domainIcon"
                style={{ color: EMPLOYEE_STATUS_COLORS.workforce }}
                aria-hidden="true"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3Zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z"
                  />
                </svg>
              </span>

              <div>
                <div className="wm-ee-cardTitle">Workforce</div>
                <div className="wm-ee-cardSub">
                  View company groups, announcements and attendance.
                </div>
              </div>
            </div>
          </div>

          <button
            className="wm-primarybtn"
            type="button"
            onClick={handleBtn}
            style={{
              ...EMPLOYEE_STATUS_BUTTON_STYLE,
              background: EMPLOYEE_STATUS_COLORS.workforce,
            }}
          >
            Open
          </button>
        </div>
      </div>

      <div className="wm-ee-chips" aria-label="Workforce stats">
        <span className="wm-ee-chip" style={zeroChipStyle(companyCount === 0)}>
          Companies: <span className="n">{formatNumber(companyCount)}</span>
        </span>
        <span className="wm-ee-chip" style={zeroChipStyle(groupCount === 0)}>
          Groups: <span className="n">{formatNumber(groupCount)}</span>
        </span>
        <span className="wm-ee-chip" style={zeroChipStyle(announcementCount === 0)}>
          Announcements: <span className="n">{formatNumber(announcementCount)}</span>
        </span>
      </div>

      <div style={statusFooterStyle(EMPLOYEE_STATUS_COLORS.workforce)}>Tap to manage</div>
    </section>
  );
}
