/** Static capability monitor — hints when idle, alerts when live. */

import { buildCapabilityTiles } from "../../helpers/employerDashboard.capability";
import type { EmployerOsWorkspaceStrip } from "../../helpers/employerDashboard.osOps";
import type { EmployerOsDomainSnapshot } from "../../helpers/employerDashboard.osTypes";
import type { OsLiveFeedState } from "../../hooks/useEmployerOsLiveHydrate";

type Props = {
  readonly shift: EmployerOsDomainSnapshot;
  readonly career: EmployerOsDomainSnapshot;
  readonly planner: EmployerOsDomainSnapshot;
  readonly workspaces: EmployerOsWorkspaceStrip;
  readonly shiftStartingSoon: number;
  readonly shiftUpcoming: number;
  readonly workspaceClockedIn?: number;
  readonly gatePending?: number;
  readonly gateFlags?: number;
  readonly vaultExpiring?: number;
  readonly liveState?: OsLiveFeedState;
};

export function EmployerCapabilityRibbon({
  shift,
  career,
  planner,
  workspaces,
  shiftStartingSoon,
  shiftUpcoming,
  workspaceClockedIn = 0,
  gatePending = 0,
  gateFlags = 0,
  vaultExpiring = 0,
  liveState = "ready",
}: Props) {
  const tiles = buildCapabilityTiles({
    shift,
    career,
    planner,
    workspaces,
    shiftStartingSoon,
    shiftUpcoming,
    workspaceClockedIn,
    gatePending,
    gateFlags,
    vaultExpiring,
  });

  return (
    <section
      className="wm-erDashCapRibbon"
      data-testid="employer-capability-ribbon"
      data-live-state={liveState}
      aria-busy={liveState === "loading"}
      aria-label="Operations status"
    >
      <div className="wm-erDashCapRibbon__kicker">
        At a glance
        <span className="wm-erDashCapRibbon__live" data-testid="employer-cap-live-state">
          {liveState === "loading" ? "Updating" : liveState === "error" ? "Offline copy" : "Live"}
        </span>
      </div>
      <p className="wm-erDashCapRibbon__lead">
        Idle lanes show what they track. Busy lanes show the top alert first.
      </p>

      <div className="wm-erDashCapGrid">
        {tiles.map((tile) => (
          <article
            key={tile.testId}
            className={`wm-erDashCapTile wm-erDashCapTile--${tile.domainClass}${
              tile.empty ? " isIdle" : " isLive"
            }`}
            data-testid={tile.testId}
            data-empty={tile.empty ? "true" : "false"}
          >
            <span className="wm-erDashCapTile__title">{tile.title}</span>
            <span className={tile.empty ? "wm-erDashCapTile__hint" : "wm-erDashCapTile__alert"}>
              {tile.empty ? tile.hint : (tile.alert ?? "\u00a0")}
            </span>
            <div className="wm-erDashCapBadges">
              {tile.badges.map((badge) => (
                <span
                  key={badge.text}
                  className={`wm-erDashCapBadge wm-erDashCapBadge--${badge.tone}`}
                >
                  {badge.text}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
