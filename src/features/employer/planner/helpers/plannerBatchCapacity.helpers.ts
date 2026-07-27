/** Job Mitra | plannerBatchCapacity.helpers.ts | Soft capacity probe (never hard-block) */

import type { DaySlot, DemandPlan } from "../storage/demandPlanner.schema";
import { countConfirmedPlannerAppsForTarget } from "../../../shared/planner/services/plannerNativeApplication.helpers";
import type { EmployeeShiftApplication } from "../../../shared/planner/ports/plannerLegacyShiftBridge";

export type CapacitySoftWarn = {
  needsConfirm: boolean;
  message: string;
  confirmed: number;
  allowed: number;
  slotDate: string;
};

export function resolvePlanSlotForApp(
  plan: DemandPlan,
  app: EmployeeShiftApplication,
): DaySlot | null {
  const bySlotId = plan.slots.find((s) => s.slotId && s.slotId === app.postId);
  if (bySlotId) return bySlotId;
  const byPostId = plan.slots.find((s) => s.postId && s.postId === app.postId);
  if (byPostId) return byPostId;
  const date = app.selectedDates?.find((d) => typeof d === "string" && d.trim())?.trim();
  if (date) return plan.slots.find((s) => s.date === date) ?? null;
  return null;
}

export function probeAppsCapacitySoftWarn(
  plan: DemandPlan,
  pendingApps: EmployeeShiftApplication[],
): CapacitySoftWarn | null {
  const buffer = Math.max(0, Math.floor(plan.waitingBuffer ?? 0));
  let worst: CapacitySoftWarn | null = null;

  for (const app of pendingApps) {
    const slot = resolvePlanSlotForApp(plan, app);
    if (!slot) continue;
    const confirmed = countConfirmedPlannerAppsForTarget({
      planId: plan.id,
      targetId: app.postId,
    });
    const allowed = Math.max(0, Math.floor(slot.workers ?? 0)) + buffer;
    if (confirmed < allowed) continue;

    const candidate: CapacitySoftWarn = {
      needsConfirm: true,
      confirmed,
      allowed,
      slotDate: slot.date,
      message: `This slot (${slot.date}) has ${confirmed} confirmed (allowed ${allowed} incl. waiting buffer). Add anyway?`,
    };
    if (!worst || candidate.confirmed - candidate.allowed > worst.confirmed - worst.allowed) {
      worst = candidate;
    }
  }

  return worst;
}
