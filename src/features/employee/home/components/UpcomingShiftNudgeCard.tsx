/** Job Mitra | UpcomingShiftNudgeCard.tsx | Upcoming-shift status strip */

import { useCallback, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { HomeStatusStripFrame } from "../../../../shared/home/HomeStatusStripFrame";
import { HomeStatusStripClockIcon } from "../../../../shared/home/HomeStatusStripIcons";
import {
  getUpcomingShiftNudgeSnapshot,
  subscribeUpcomingShiftNudge,
} from "../helpers/employeeHomeDynamicNudges.helpers";

export function UpcomingShiftNudgeCard() {
  const nav = useNavigate();
  const snap = useSyncExternalStore(
    subscribeUpcomingShiftNudge,
    getUpcomingShiftNudgeSnapshot,
    getUpcomingShiftNudgeSnapshot,
  );

  const handleOpen = useCallback(() => {
    if (snap.isDemoForce) return;
    const nearest = snap.nearest;
    if (nearest?.workspaceId) {
      nav(ROUTE_PATHS.employeeShiftWorkspace.replace(":workspaceId", nearest.workspaceId));
      return;
    }
    nav(ROUTE_PATHS.employeeShiftCenter);
  }, [nav, snap.isDemoForce, snap.nearest]);

  if (snap.count <= 0) return null;

  const detail = snap.nearest
    ? `${snap.nearest.jobName} · ${snap.nearest.companyName}`
    : `${snap.count} shift${snap.count === 1 ? "" : "s"} this week`;

  return (
    <HomeStatusStripFrame
      testId="upcoming-shift-nudge"
      domain="shift"
      line={`${snap.count} upcoming · ${detail}`}
      ariaLabel={`Upcoming shifts: ${detail}`}
      dismissId={`upcoming:${snap.fingerprint}`}
      icon={<HomeStatusStripClockIcon />}
      onOpen={handleOpen}
    />
  );
}
