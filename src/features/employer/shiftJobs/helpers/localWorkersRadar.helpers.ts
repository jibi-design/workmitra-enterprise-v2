// App name: Job Mitra
// Blind local radar metrics + favorite overlap (read-only home card).

import { availabilityStorage, getRolling7Days } from "../../../shared/shift/availability.reader";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";
import { favoritesStorage } from "../storage/favoritesStorage";
import { resolveShiftEmployerScopedKey } from "../../../shared/shift/shiftEmployerScope";

export type LocalWorkersRadarMetrics = {
  totalAvailableCount: number;
  favoriteAvailableCount: number;
};

const ALL_AVAILABILITY_KEY = "wm_all_availability_broadcasts_v1";
const EMPLOYER_PROFILE_KEY = "wm_employer_profile_v1";

const EMPTY_METRICS: LocalWorkersRadarMetrics = {
  totalAvailableCount: 0,
  favoriteAvailableCount: 0,
};

let metricsCacheKey = "";
let metricsCache: LocalWorkersRadarMetrics = EMPTY_METRICS;

function computeLocalWorkersRadarMetrics(): LocalWorkersRadarMetrics {
  const city = employerSettingsStorage.get().locationCity.trim();
  const cityKey = city.toLowerCase();
  const rolling = new Set(getRolling7Days().map((day) => day.iso));
  const favoriteIds = new Set(
    favoritesStorage.getAll().map((item) => item.workerMlId.trim().toUpperCase()),
  );

  const seenTotal = new Set<string>();
  const seenFavorite = new Set<string>();

  for (const broadcast of availabilityStorage.getAllActive()) {
    if (cityKey && broadcast.city && broadcast.city.trim().toLowerCase() !== cityKey) {
      continue;
    }

    if (!broadcast.selectedDates.some((iso) => rolling.has(iso))) continue;

    const workerKey = broadcast.workerMlId.trim().toUpperCase();
    if (!seenTotal.has(workerKey)) {
      seenTotal.add(workerKey);
    }

    if (favoriteIds.has(workerKey) && !seenFavorite.has(workerKey)) {
      seenFavorite.add(workerKey);
    }
  }

  return {
    totalAvailableCount: seenTotal.size,
    favoriteAvailableCount: seenFavorite.size,
  };
}

/** Stable-reference snapshot for useSyncExternalStore (prevents infinite re-render loops). */
export function readLocalWorkersRadarMetricsSnapshot(): LocalWorkersRadarMetrics {
  const city = employerSettingsStorage.get().locationCity.trim();
  const availRaw = localStorage.getItem(ALL_AVAILABILITY_KEY) ?? "";
  const favRaw = localStorage.getItem(resolveShiftEmployerScopedKey("shift_favorites_v1")) ?? "";
  const profileRaw = localStorage.getItem(EMPLOYER_PROFILE_KEY) ?? "";
  const cacheKey = `${city}|${availRaw}|${favRaw}|${profileRaw}`;

  if (cacheKey === metricsCacheKey) {
    return metricsCache;
  }

  metricsCacheKey = cacheKey;
  metricsCache = computeLocalWorkersRadarMetrics();
  return metricsCache;
}

export function readLocalWorkersRadarMetrics(): LocalWorkersRadarMetrics {
  return readLocalWorkersRadarMetricsSnapshot();
}

export function subscribeLocalWorkersRadarMetrics(cb: () => void): () => void {
  const handler = () => cb();

  const unsubscribeAvailability = availabilityStorage.subscribe(handler);
  const unsubscribeFavorites = favoritesStorage.subscribe(handler);
  const unsubscribeSettings = employerSettingsStorage.subscribe(handler);

  return () => {
    unsubscribeAvailability();
    unsubscribeFavorites();
    unsubscribeSettings();
  };
}
