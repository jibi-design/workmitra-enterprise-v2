/** Hook — Planner-lane week hours. Reads planner-filtered apps only. */

import { useMemo, useSyncExternalStore } from "react";
import { isPlannerApplication } from "../../planner/helpers/plannerDomainFilters";
import { shiftApplicationsStorage } from "../../shiftJobs/storage/shiftApplications.storage";
import { APPS_KEY, POSTS_KEY } from "../../shiftJobs/storage/shiftApplications.storage.parse";
import { toDateKey } from "../helpers/dailyOs.helpers";
import { computePlannerWeekHours } from "../helpers/dailyOs.plannerHours.helpers";
import type { DailyOsPlannerHours } from "../helpers/dailyOs.types";
import { tryDomainRead } from "../helpers/dailyOs.viewState.helpers";

const EMPTY_HOURS: DailyOsPlannerHours = {
  scheduledHours: 0,
  plannedHours: 0,
  confirmedDays: 0,
  plannedDays: 0,
};

export type DailyOsPlannerModel = {
  readonly hours: DailyOsPlannerHours;
  readonly error: string | null;
};

function getRevision(): string {
  try {
    return `${localStorage.getItem(APPS_KEY) ?? ""}|${localStorage.getItem(POSTS_KEY) ?? ""}`;
  } catch {
    return "";
  }
}

export function useDailyOsPlannerModel(): DailyOsPlannerModel {
  const revision = useSyncExternalStore(
    shiftApplicationsStorage.subscribe,
    getRevision,
    getRevision,
  );

  return useMemo(() => {
    void revision;
    const read = tryDomainRead(() => {
      const apps = shiftApplicationsStorage.getApps().filter(isPlannerApplication);
      const posts = shiftApplicationsStorage.getPosts();
      return computePlannerWeekHours(apps, posts, toDateKey(new Date()));
    }, EMPTY_HOURS);
    return { hours: read.value, error: read.error };
  }, [revision]);
}
