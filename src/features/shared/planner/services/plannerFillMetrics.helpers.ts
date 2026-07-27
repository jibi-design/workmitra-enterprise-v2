/**
 * Job Mitra | plannerFillMetrics.helpers.ts
 * P-SEP-3 — plan fill % from DemandPlan slots + applications (no employerShiftStorage posts).
 */

import {
  readEmployeeApplications,
  type EmployeeShiftApplication,
} from "../ports/plannerLegacyShiftBridge";
import type { DaySlot, DemandPlan } from "../../../employer/planner/storage/demandPlannerStorage";

export type PlannerFillMetrics = {
  confirmed: number;
  needed: number;
  pct: number;
};

function slotTargetId(slot: DaySlot): string {
  return (slot.postId || slot.slotId || "").trim();
}

function isConfirmedForSlot(app: EmployeeShiftApplication, slot: DaySlot): boolean {
  if (app.status !== "confirmed") return false;
  const target = slotTargetId(slot);
  if (target && app.postId === target) return true;
  if (app.selectedDates?.includes(slot.date)) return true;
  return false;
}

/** Per-slot confirmed headcount capped at slot.workers. */
export function countConfirmedForSlot(apps: EmployeeShiftApplication[], slot: DaySlot): number {
  const matched = apps.filter((app) => isConfirmedForSlot(app, slot)).length;
  return Math.min(Math.max(0, slot.workers), matched);
}

export function computePlanFillMetrics(
  plan: DemandPlan,
  apps?: EmployeeShiftApplication[],
): PlannerFillMetrics {
  const planApps =
    apps?.filter((a) => a.planId === plan.id) ??
    readEmployeeApplications().filter((a) => a.planId === plan.id);

  let confirmed = 0;
  let needed = 0;
  for (const slot of plan.slots) {
    needed += Math.max(0, slot.workers);
    confirmed += countConfirmedForSlot(planApps, slot);
  }

  return {
    confirmed,
    needed,
    pct: needed > 0 ? Math.round((confirmed / needed) * 100) : 0,
  };
}

export function computePlansFillMetrics(plans: DemandPlan[]): PlannerFillMetrics {
  const apps = readEmployeeApplications();
  let confirmed = 0;
  let needed = 0;
  for (const plan of plans) {
    const m = computePlanFillMetrics(plan, apps);
    confirmed += m.confirmed;
    needed += m.needed;
  }
  return {
    confirmed,
    needed,
    pct: needed > 0 ? Math.round((confirmed / needed) * 100) : 0,
  };
}
