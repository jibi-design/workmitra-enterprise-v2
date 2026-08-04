/** Daily OS — Roster Radar (employer shift workspace / post truth only). */

import { useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import {
  getEmployerShiftPostsSnapshot,
  subscribeEmployerShiftPosts,
} from "../../../shiftJobs/helpers/employerShiftPosts.helpers";
import {
  getWorkspacesSnapshot,
  subscribeWorkspaces,
} from "../../../shiftJobs/storage/shiftWorkspaceStorage";
import { buildRosterRadarRows } from "../../helpers/employerDailyOs.helpers";

function subscribeRoster(cb: () => void): () => void {
  const unsubWs = subscribeWorkspaces(cb);
  const unsubPosts = subscribeEmployerShiftPosts(cb);
  return () => {
    unsubWs();
    unsubPosts();
  };
}

function getRosterRevision(): string {
  const ws = getWorkspacesSnapshot();
  const posts = getEmployerShiftPostsSnapshot();
  return `${ws.length}|${posts.length}|${ws[0]?.id ?? ""}|${posts[0]?.id ?? ""}`;
}

export function RosterRadarWidget() {
  const nav = useNavigate();
  const revision = useSyncExternalStore(subscribeRoster, getRosterRevision, getRosterRevision);

  const rows = useMemo(() => {
    void revision;
    return buildRosterRadarRows(getWorkspacesSnapshot(), getEmployerShiftPostsSnapshot());
  }, [revision]);

  return (
    <section className="wm-dailyOsCard" data-testid="roster-radar-widget" aria-label="Roster Radar">
      <div className="wm-dailyOsCard__kicker">Today</div>
      <div className="wm-dailyOsCard__title">Roster Radar</div>
      <div className="wm-dailyOsCard__sub">
        Confirmed staff on shift today — from employer Shift workspaces / posts (not diary).
      </div>

      {rows.length > 0 ? (
        <ul className="wm-dailyOsList">
          {rows.map((row) => (
            <li key={row.id} className="wm-dailyOsList__item">
              <div>
                <div className="wm-dailyOsList__title">{row.workerLabel}</div>
                <div className="wm-dailyOsList__meta">
                  {row.jobName} · {row.status}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="wm-dailyOsEmpty">No confirmed staff scheduled for today yet.</p>
      )}

      <button
        type="button"
        className="wm-dailyOsLink"
        onClick={() => nav(ROUTE_PATHS.employerShiftWorkspaces)}
      >
        Open shift workspaces →
      </button>
    </section>
  );
}
