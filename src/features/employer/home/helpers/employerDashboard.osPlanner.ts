/** Planner-lane rows for Employer OS dashboard (batches, not Shift posts). */

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { PlannerApplicationBatch } from "../../planner/services/plannerBatchApproval.service";
import type { DemandPlan } from "../../planner/storage/demandPlanner.schema";
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
