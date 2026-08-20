/** Planner-lane rows for Employer OS dashboard (batches, not Shift posts). */

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { PlannerApplicationBatch } from "../../planner/services/plannerBatchApproval.service";
import type { DemandPlan } from "../../planner/storage/demandPlanner.schema";
import { formatPlannerPayTotal } from "../../planner/helpers/plannerPayDisplay.helpers";
import { isCreatedThisWeek } from "./employerDashboard.osOps";
import type {
  EmployerOsDomainSnapshot,
  EmployerOsOpenRow,
  EmployerOsStageDef,
  EmployerOsTrackerRow,
} from "./employerDashboard.osTypes";

export const PLANNER_OS_STAGES: readonly EmployerOsStageDef[] = [
  { key: "Pending", label: "Pending" },
  { key: "Shortlisted", label: "Shortlisted" },
  { key: "Confirmed", label: "Confirmed" },
];

export function mapPlannerOsStage(batch: PlannerApplicationBatch): string | null {
  if (batch.applications.some((app) => app.status === "shortlisted")) return "Shortlisted";
  if (batch.reviewStatus === "pending" || batch.reviewStatus === "partial") return "Pending";
  if (batch.reviewStatus === "confirmed") return "Confirmed";
  return null;
}

export function computePlannerOsSnapshot(
  plans: readonly DemandPlan[],
  batches: readonly PlannerApplicationBatch[],
): EmployerOsDomainSnapshot {
  const open = plans.filter((plan) => plan.status === "draft" || plan.status === "active").length;
  const pending = batches.filter(
    (batch) => batch.reviewStatus === "pending" || batch.reviewStatus === "partial",
  ).length;
  const confirmed = batches.filter((batch) => batch.reviewStatus === "confirmed").length;
  const fresh = batches.filter((batch) => isCreatedThisWeek(batch.createdAt)).length;
  return {
    domain: "planner",
    title: "Planner",
    openLabel: "Open plans",
    openCount: open,
    pendingLabel: "Batches to review",
    pendingCount: pending,
    confirmedLabel: "Approved",
    confirmedCount: confirmed,
    extraLabel: "New this week",
    extraCount: fresh,
  };
}

export function buildPlannerOsRows(
  batches: readonly PlannerApplicationBatch[],
): EmployerOsTrackerRow[] {
  const rows: EmployerOsTrackerRow[] = [];
  for (const batch of batches) {
    const stage = mapPlannerOsStage(batch);
    if (!stage) continue;
    rows.push({
      id: batch.planApplyBatchId,
      title: batch.workerName.trim() || "Worker",
      subtitle: `${batch.planName.trim() || "Plan"} · ${batch.dayCount} day${
        batch.dayCount === 1 ? "" : "s"
      }`,
      stage,
      updatedAt: batch.createdAt,
      href: ROUTE_PATHS.employerPlannerApplications,
    });
  }
  return rows;
}

export function buildPlannerOpenRows(plans: readonly DemandPlan[]): EmployerOsOpenRow[] {
  return plans
    .filter((plan) => plan.status === "draft" || plan.status === "active")
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 8)
    .map((plan) => ({
      id: plan.id,
      title: plan.name,
      meta: plan.status === "draft" ? "Draft" : "Active",
      href: ROUTE_PATHS.employerPlannerDetail.replace(":planId", plan.id),
      badge: plan.status === "draft" ? "Draft" : "Active",
    }));
}

function openPlans(plans: readonly DemandPlan[]): DemandPlan[] {
  return plans.filter((plan) => plan.status === "draft" || plan.status === "active");
}

export function countUnfilledPlanSeats(plan: DemandPlan): number {
  return plan.slots.reduce((sum, slot) => sum + (slot.assignmentId ? 0 : slot.workers), 0);
}

export function estimatePlanBudget(plan: DemandPlan): number {
  return plan.slots.reduce((sum, slot) => sum + slot.workers * slot.payPerDay, 0);
}

export function countPlanWorkerDays(plan: DemandPlan): number {
  return plan.slots.reduce((sum, slot) => sum + slot.workers, 0);
}

export function countPlannerOpenWeeks(plans: readonly DemandPlan[]): number {
  return openPlans(plans).length;
}

export function countPlannerUnfilledTotal(plans: readonly DemandPlan[]): number {
  return openPlans(plans).reduce((sum, plan) => sum + countUnfilledPlanSeats(plan), 0);
}

export function countPlannerWorkerDaysTotal(plans: readonly DemandPlan[]): number {
  return openPlans(plans).reduce((sum, plan) => sum + countPlanWorkerDays(plan), 0);
}

export function buildPlannerGapRows(plans: readonly DemandPlan[]): EmployerOsOpenRow[] {
  return openPlans(plans)
    .map((plan) => ({ plan, gaps: countUnfilledPlanSeats(plan) }))
    .filter((item) => item.gaps > 0)
    .sort((a, b) => b.gaps - a.gaps)
    .slice(0, 8)
    .map(({ plan, gaps }) => ({
      id: plan.id,
      title: plan.name,
      meta: `${gaps} unfilled seat${gaps === 1 ? "" : "s"}`,
      href: ROUTE_PATHS.employerPlannerRosterDetail.replace(":planId", plan.id),
      badge: "Gap",
    }));
}

export function buildPlannerBudgetRows(plans: readonly DemandPlan[]): EmployerOsOpenRow[] {
  return openPlans(plans)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 8)
    .map((plan) => {
      const days = countPlanWorkerDays(plan);
      return {
        id: plan.id,
        title: plan.name,
        meta: `${formatPlannerPayTotal(estimatePlanBudget(plan))} · ${days} worker-day${
          days === 1 ? "" : "s"
        }`,
        href: ROUTE_PATHS.employerPlannerFinance.replace(":planId", plan.id),
        badge: "Budget",
      };
    });
}
