/** Daily OS — Rehire Memory / Talent Vault shortcut (favorites). */

import { useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import { favoritesStorage } from "../../../shiftJobs/storage/favoritesStorage";

function getFavoritesRevision(): string {
  const all = favoritesStorage.getAll();
  return `${all.length}|${all[0]?.id ?? ""}|${all[0]?.avgStars ?? 0}`;
}

export function RehireMemoryCard() {
  const nav = useNavigate();
  const revision = useSyncExternalStore(
    favoritesStorage.subscribe,
    getFavoritesRevision,
    getFavoritesRevision,
  );

  const favorites = useMemo(() => {
    void revision;
    return favoritesStorage.getAll();
  }, [revision]);

  const top = useMemo(
    () =>
      favorites
        .slice()
        .sort((a, b) => b.avgStars - a.avgStars || b.shiftsWorked - a.shiftsWorked)
        .slice(0, 3),
    [favorites],
  );

  const count = favorites.length;

  return (
    <section
      className="wm-dailyOsCard"
      data-testid="rehire-memory-card"
      aria-label="Rehire Memory Talent Vault"
    >
      <div className="wm-dailyOsCard__kicker">Talent</div>
      <div className="wm-dailyOsCard__title">Rehire Memory</div>
      <div className="wm-dailyOsCard__sub">
        {count > 0
          ? `${count} saved worker${count === 1 ? "" : "s"} ready to invite again.`
          : "Save strong workers after shifts — invite them directly next time."}
      </div>

      {top.length > 0 ? (
        <ul className="wm-dailyOsList">
          {top.map((worker) => (
            <li key={worker.id} className="wm-dailyOsList__item">
              <div>
                <div className="wm-dailyOsList__title">
                  {worker.workerName || worker.workerMlId}
                </div>
                <div className="wm-dailyOsList__meta">
                  {worker.avgStars > 0 ? `${worker.avgStars.toFixed(1)}★ · ` : ""}
                  {worker.shiftsWorked} shift{worker.shiftsWorked === 1 ? "" : "s"}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <button
        type="button"
        className="wm-dailyOsLink"
        data-testid="rehire-memory-open-favorites"
        onClick={() => nav(ROUTE_PATHS.employerShiftFavorites)}
      >
        Open Talent Vault →
      </button>
    </section>
  );
}
