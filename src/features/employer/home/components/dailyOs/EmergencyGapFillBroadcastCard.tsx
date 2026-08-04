/** Daily OS — 1-tap Emergency Gap Fill Broadcast */

import { useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import {
  getEmployerShiftPostsSnapshot,
  subscribeEmployerShiftPosts,
} from "../../../shiftJobs/helpers/employerShiftPosts.helpers";
import { countOpenShiftGaps } from "../../helpers/employerDailyOs.helpers";

export function EmergencyGapFillBroadcastCard() {
  const nav = useNavigate();
  const posts = useSyncExternalStore(
    subscribeEmployerShiftPosts,
    getEmployerShiftPostsSnapshot,
    getEmployerShiftPostsSnapshot,
  );

  const gaps = useMemo(() => countOpenShiftGaps(posts), [posts]);

  return (
    <section
      className="wm-dailyOsCard isUrgent"
      data-testid="emergency-gap-fill-card"
      aria-label="Emergency gap fill"
    >
      <div className="wm-dailyOsCard__kicker">Gap fill</div>
      <div className="wm-dailyOsCard__title">1-Tap Emergency Broadcast</div>
      <div className="wm-dailyOsCard__sub">
        {gaps.openSlots > 0
          ? `${gaps.openSlots} open slot${gaps.openSlots === 1 ? "" : "s"} across ${gaps.urgentPosts} shift${gaps.urgentPosts === 1 ? "" : "s"} today.`
          : "No open seats today — still post an urgent shift if you need cover."}
      </div>

      <div className="wm-dailyOsActions">
        <button
          type="button"
          className="wm-dailyOsPrimary"
          data-testid="emergency-gap-create-shift"
          onClick={() =>
            nav(ROUTE_PATHS.employerShiftCreate, {
              state: { urgency: "emergency_gap_fill", backTo: ROUTE_PATHS.employerHome },
            })
          }
        >
          Post urgent shift
        </button>
        <button
          type="button"
          className="wm-dailyOsSecondary"
          data-testid="emergency-gap-broadcasts"
          onClick={() => nav(`${ROUTE_PATHS.employerShiftWorkspaces}?mode=broadcasts`)}
        >
          Workspace broadcasts
        </button>
      </div>
    </section>
  );
}
