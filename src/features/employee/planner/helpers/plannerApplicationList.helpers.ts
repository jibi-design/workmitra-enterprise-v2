/** Job Mitra | plannerApplicationList.helpers.ts | Native applications KPI/tab helpers */

import type { ShiftApplicationStatus } from "../../../shared/planner/ports/plannerLegacyShiftBridge";

export type PlannerApplicationTab = "all" | "active" | "confirmed" | "closed";

export type PlannerKpiCounts = {
  applied: number;
  shortlisted: number;
  confirmed: number;
};

export type PlannerTabCounts = {
  all: number;
  active: number;
  confirmed: number;
  closed: number;
};

function isActiveStatus(status: ShiftApplicationStatus): boolean {
  return status === "applied" || status === "shortlisted" || status === "waiting";
}

function isClosedStatus(status: ShiftApplicationStatus): boolean {
  return (
    status === "rejected" || status === "withdrawn" || status === "replaced" || status === "exited"
  );
}

export function computePlannerKpi(
  apps: ReadonlyArray<{ status: ShiftApplicationStatus }>,
): PlannerKpiCounts {
  let applied = 0;
  let shortlisted = 0;
  let confirmed = 0;

  for (const application of apps) {
    if (application.status === "applied") applied += 1;
    else if (application.status === "shortlisted") shortlisted += 1;
    else if (application.status === "confirmed") confirmed += 1;
  }

  return { applied, shortlisted, confirmed };
}

export function computePlannerTabCounts(
  apps: ReadonlyArray<{ status: ShiftApplicationStatus }>,
): PlannerTabCounts {
  let active = 0;
  let confirmed = 0;
  let closed = 0;

  for (const application of apps) {
    if (isActiveStatus(application.status)) active += 1;
    else if (application.status === "confirmed") confirmed += 1;
    else if (isClosedStatus(application.status)) closed += 1;
  }

  return { active, confirmed, closed, all: apps.length };
}

export function plannerTabMatch(
  status: ShiftApplicationStatus,
  tab: PlannerApplicationTab,
): boolean {
  if (tab === "all") return true;
  if (tab === "active") return isActiveStatus(status);
  if (tab === "confirmed") return status === "confirmed";
  return isClosedStatus(status);
}
