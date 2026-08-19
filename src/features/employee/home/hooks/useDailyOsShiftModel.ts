/** Hook — shift-lane Daily OS facts. Career store stays in useCandidateDashboardModel. */

import { useMemo, useSyncExternalStore } from "react";
import { earningsStorage } from "../../shiftJobs/storage/earningsStorage";
import {
  getPersonalCalendarShiftActiveSnapshot,
  personalCalendarShiftStorage,
} from "../../shiftJobs/storage/personalCalendarShift.storage";
import { buildEarningsSparkline, buildWeekHeatCells, resolveNextConfirmedShift, toDateKey } from "../helpers/dailyOs.helpers";
import type { DailyOsHeatCell, DailyOsNextShift, DailyOsSparkPoint } from "../helpers/dailyOs.types";
import { APPS_KEY, POSTS_KEY } from "../../shiftJobs/storage/shiftApplications.storage.parse";
import { shiftApplicationsStorage } from "../../shiftJobs/storage/shiftApplications.storage";
import { tryDomainRead } from "../helpers/dailyOs.viewState.helpers";

export type DailyOsShiftModel = {
  readonly todayKey: string;
  readonly nextShift: DailyOsNextShift | null;
  readonly heat: readonly DailyOsHeatCell[];
  readonly earningsTotal: number;
  readonly earningsShifts: number;
  readonly spark: readonly DailyOsSparkPoint[];
  readonly error: string | null;
};

function getShiftRevision(): string {
  try {
    return [
      localStorage.getItem(APPS_KEY) ?? "",
      localStorage.getItem(POSTS_KEY) ?? "",
      getPersonalCalendarShiftActiveSnapshot()
        .map((b) => `${b.id}:${b.dateKey}:${b.status}`)
        .join(","),
    ].join("|");
  } catch {
    return "";
  }
}

function subscribeShift(onStoreChange: () => void): () => void {
  const unsubCal = personalCalendarShiftStorage.subscribe(onStoreChange);
  const unsubEarn = shiftApplicationsStorage.subscribe(onStoreChange);
  return () => {
    unsubCal();
    unsubEarn();
  };
}

export function useDailyOsShiftModel(): DailyOsShiftModel {
  const revision = useSyncExternalStore(subscribeShift, getShiftRevision, getShiftRevision);

  return useMemo(() => {
    void revision;
    const todayKey = toDateKey(new Date());
    const empty = {
      todayKey,
      nextShift: null,
      heat: [] as DailyOsHeatCell[],
      earningsTotal: 0,
      earningsShifts: 0,
      spark: [] as DailyOsSparkPoint[],
    };
    const read = tryDomainRead(() => {
      const blocks = getPersonalCalendarShiftActiveSnapshot();
      const nextShift = resolveNextConfirmedShift(blocks, todayKey);
      const confirmedDateKeys = blocks
        .filter((b) => b.status === "confirmed")
        .map((b) => b.dateKey);
      const summary = earningsStorage.getSummary("shift");
      return {
        todayKey,
        nextShift,
        heat: buildWeekHeatCells({ todayKey, confirmedDateKeys }),
        earningsTotal: summary.totalEarned,
        earningsShifts: summary.totalShifts,
        spark: buildEarningsSparkline(summary.entries, todayKey),
      };
    }, empty);
    return { ...read.value, error: read.error };
  }, [revision]);
}
