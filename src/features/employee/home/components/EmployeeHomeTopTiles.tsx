/** Job Mitra | EmployeeHomeTopTiles.tsx | Ultra-compact glassmorphic greeting strip */

import { useSyncExternalStore } from "react";
import {
  getUpcomingShiftNudgeSnapshot,
  subscribeUpcomingShiftNudge,
} from "../helpers/employeeHomeDynamicNudges.helpers";

type Props = {
  userName: string;
  userPhoto?: string | null;
};

export function EmployeeHomeTopTiles({ userName, userPhoto }: Props) {
  const upcoming = useSyncExternalStore(
    subscribeUpcomingShiftNudge,
    getUpcomingShiftNudgeSnapshot,
    getUpcomingShiftNudgeSnapshot,
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = userName.trim().split(/\s+/)[0] || userName || "User";
  const initial = firstName.charAt(0).toUpperCase() || "U";
  const statusPill = upcoming.count > 0 ? `${upcoming.count} upcoming` : "Active";

  return (
    <header
      className="wm-homeCompactHeader"
      data-testid="employee-home-compact-header"
      aria-label="Home greeting"
    >
      <div className="wm-homeCompactHeader__copy">
        <p className="wm-homeCompactHeader__greeting">
          {greeting}, <span className="wm-homeCompactHeader__name">{firstName}</span>
        </p>
        <span className="wm-homeCompactHeader__pill">{statusPill}</span>
      </div>
      <div className="wm-homeCompactHeader__avatar" aria-hidden="true">
        {userPhoto ? <img src={userPhoto} alt="" /> : initial}
      </div>
    </header>
  );
}
