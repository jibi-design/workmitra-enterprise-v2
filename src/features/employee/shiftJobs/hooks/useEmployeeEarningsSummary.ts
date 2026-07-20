// App name: Job Mitra
// File name: useEmployeeEarningsSummary.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\hooks\useEmployeeEarningsSummary.ts

import { useSyncExternalStore } from "react";
import { earningsStorage, type EarningsDomain } from "../storage/earningsStorage";
import type { EarningsSummary } from "../storage/earningsStorage";

let cachedApplicationsRaw: string | null = "__init__";
let cachedShiftSummary: EarningsSummary | null = null;
let cachedPlannerSummary: EarningsSummary | null = null;

function getEmployeeEarningsSnapshot(domain: EarningsDomain): EarningsSummary {
  const raw = localStorage.getItem("wm_employee_shift_applications_v1");

  if (
    raw !== cachedApplicationsRaw ||
    cachedShiftSummary === null ||
    cachedPlannerSummary === null
  ) {
    cachedApplicationsRaw = raw;
    cachedShiftSummary = earningsStorage.getSummary("shift");
    cachedPlannerSummary = earningsStorage.getSummary("planner");
  }

  return domain === "planner" ? cachedPlannerSummary! : cachedShiftSummary!;
}

export function useEmployeeEarningsSummary(domain: EarningsDomain = "shift"): EarningsSummary {
  return useSyncExternalStore(
    earningsStorage.subscribe,
    () => getEmployeeEarningsSnapshot(domain),
    () => getEmployeeEarningsSnapshot(domain),
  );
}
