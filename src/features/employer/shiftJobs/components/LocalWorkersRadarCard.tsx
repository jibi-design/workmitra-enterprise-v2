// App name: Job Mitra
// Local Workers Radar — read-only dual-count (Anti-Leakage). No browse, no click action.

import { useSyncExternalStore } from "react";
import {
  readLocalWorkersRadarMetricsSnapshot,
  subscribeLocalWorkersRadarMetrics,
} from "../helpers/localWorkersRadar.helpers";

function RadarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8Zm0-14a6 6 0 1 0 6 6 6.006 6.006 0 0 0-6-6Zm0 10a4 4 0 1 1 4-4 4.004 4.004 0 0 1-4 4Zm0-6a2 2 0 1 0 2 2 2.002 2.002 0 0 0-2-2Z"
      />
    </svg>
  );
}

function readMetrics() {
  return readLocalWorkersRadarMetricsSnapshot();
}

export function LocalWorkersRadarCard() {
  const { totalAvailableCount, favoriteAvailableCount } = useSyncExternalStore(
    subscribeLocalWorkersRadarMetrics,
    readMetrics,
    () => readLocalWorkersRadarMetricsSnapshot(),
  );

  const hasMatches = totalAvailableCount > 0;
  const hasFavoriteMatches = favoriteAvailableCount > 0;
  const workerLabel = totalAvailableCount === 1 ? "worker" : "workers";

  return (
    <section
      className={`wm-press-card wm-shiftLocalWorkersRadar${hasMatches ? " wm-shiftLocalWorkersRadar--active" : ""}`}
      data-testid="local-workers-radar-card"
      aria-label="Local Workers Radar information"
      role="status"
    >
      <div className="wm-shiftLocalWorkersRadar__head">
        <div className="wm-shiftLocalWorkersRadar__icon" aria-hidden="true">
          <RadarIcon />
        </div>

        <div className="wm-shiftLocalWorkersRadar__copy">
          <h3 className="wm-shiftLocalWorkersRadar__title">Local Workers Radar</h3>

          {hasMatches ? (
            <>
              <p className="wm-shiftLocalWorkersRadar__sub wm-shiftLocalWorkersRadar__sub--active">
                🔥 {totalAvailableCount} {workerLabel} ready to work this week.
              </p>

              {hasFavoriteMatches ? (
                <div
                  className="wm-shiftLocalWorkersRadar__favoritePill"
                  data-testid="local-workers-radar-favorite-pill"
                >
                  ⭐️ Includes {favoriteAvailableCount} of your Favorites!
                </div>
              ) : null}
            </>
          ) : (
            <p className="wm-shiftLocalWorkersRadar__sub">
              When workers in your area mark themselves as available, the live count will display
              here.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
