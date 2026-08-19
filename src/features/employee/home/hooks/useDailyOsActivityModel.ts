/** Hook — tri-domain Recent Activity feed for Daily OS. */

import { useMemo, useSyncExternalStore } from "react";
import {
  getAppsSnapshot,
  subscribeApps,
} from "../../careerJobs/helpers/careerApplicationHelpers";
import { employeeNotificationsStorage } from "../../notifications/storage/employeeNotifications.storage";
import { shiftApplicationsStorage } from "../../shiftJobs/storage/shiftApplications.storage";
import { APPS_KEY } from "../../shiftJobs/storage/shiftApplications.storage.parse";
import { buildDailyOsActivity } from "../helpers/dailyOs.activity.helpers";
import type { DailyOsActivityItem } from "../helpers/dailyOs.types";
import { tryDomainRead } from "../helpers/dailyOs.viewState.helpers";

function getRevision(): string {
  try {
    return [
      employeeNotificationsStorage.getAll().length,
      employeeNotificationsStorage.getAll()[0]?.id ?? "",
      localStorage.getItem(APPS_KEY) ?? "",
    ].join("|");
  } catch {
    return "";
  }
}

function subscribe(onStoreChange: () => void): () => void {
  const unsubNotes = employeeNotificationsStorage.subscribe(onStoreChange);
  const unsubCareer = subscribeApps(onStoreChange);
  const unsubShift = shiftApplicationsStorage.subscribe(onStoreChange);
  return () => {
    unsubNotes();
    unsubCareer();
    unsubShift();
  };
}

export type DailyOsActivityModel = {
  readonly items: readonly DailyOsActivityItem[];
  readonly error: string | null;
};

export function useDailyOsActivityModel(): DailyOsActivityModel {
  const revision = useSyncExternalStore(subscribe, getRevision, getRevision);

  return useMemo(() => {
    void revision;
    const read = tryDomainRead(
      () =>
        buildDailyOsActivity({
          notes: employeeNotificationsStorage.getAll(),
          careerApps: getAppsSnapshot(),
          shiftApps: shiftApplicationsStorage.getApps(),
          posts: shiftApplicationsStorage.getPosts(),
          limit: 6,
        }),
      [],
    );
    return { items: read.value, error: read.error };
  }, [revision]);
}
