/** Job Mitra | UpcomingShiftNudgeCard.tsx | Upcoming-shift status strip */

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { HomeStatusStripFrame } from "../../../../shared/home/HomeStatusStripFrame";
import { HomeStatusStripClockIcon } from "../../../../shared/home/HomeStatusStripIcons";
import { personalCalendarShiftStorage } from "../../shiftJobs/storage/personalCalendarShift.storage";
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
  const blocks = useSyncExternalStore(
    personalCalendarShiftStorage.subscribe,
    personalCalendarShiftStorage.getActive,
    personalCalendarShiftStorage.getActive,
  );

  const openNearest = useCallback(() => {
    if (snap.isDemoForce) return;
    const nearest = snap.nearest;
    if (nearest?.workspaceId) {
      nav(ROUTE_PATHS.employeeShiftWorkspace.replace(":workspaceId", nearest.workspaceId));
      return;
    }
    nav(ROUTE_PATHS.employeeShiftCenter);
  }, [nav, snap.isDemoForce, snap.nearest]);

  const details = useMemo(() => {
    const today = new Date();
    const start = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 7);
    const end = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
    const rows = blocks
      .filter((block) => block.status === "confirmed")
      .filter((block) => block.dateKey >= start && block.dateKey <= end)
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey) || a.syncedAt - b.syncedAt)
      .slice(0, 5)
      .map((block) => ({
        id: block.id,
        line: `${block.jobName} · ${block.companyName} · ${block.dateKey}`,
        onOpen: () => {
          if (block.workspaceId) {
            nav(ROUTE_PATHS.employeeShiftWorkspace.replace(":workspaceId", block.workspaceId));
            return;
          }
          nav(ROUTE_PATHS.employeeShiftCenter);
        },
      }));
    if (rows.length > 0) return rows;
    if (snap.count > 0) {
      return [{ id: "upcoming-summary", line: `${snap.count} shift${snap.count === 1 ? "" : "s"} this week`, onOpen: openNearest }];
    }
    return [];
  }, [blocks, nav, openNearest, snap.count]);

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
      details={details}
    />
  );
}
