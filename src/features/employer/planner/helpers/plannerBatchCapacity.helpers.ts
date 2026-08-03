/** Job Mitra | plannerBatchCapacity.helpers.ts | Capacity probe + Wave-3 hard-cap messaging */

import type { DaySlot, DemandPlan } from "../storage/demandPlanner.schema";
import { getNativeSlotCapacityAllowed } from "../../../shared/planner/services/plannerNativeApplication.helpers";
import type { EmployeeShiftApplication } from "../../../shared/planner/ports/plannerLegacyShiftBridge";

export type CapacitySoftWarn = {
  needsConfirm: boolean;
  /** Wave-3: native confirm hard-fails when true (override cannot overfill). */
  hardBlocked: boolean;
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
  let worst: CapacitySoftWarn | null = null;

  for (const app of pendingApps) {
    const slot = resolvePlanSlotForApp(plan, app);
    if (!slot) continue;
    const { confirmed, allowed, atCapacity } = getNativeSlotCapacityAllowed(plan, app);
    if (!atCapacity) continue;

    const candidate: CapacitySoftWarn = {
      needsConfirm: true,
      hardBlocked: true,
      confirmed,
      allowed,
      slotDate: slot.date,
      message: `This slot (${slot.date}) is full (${confirmed}/${allowed} incl. waiting buffer). Confirm is hard-blocked until a slot opens.`,
    };
    if (!worst || candidate.confirmed - candidate.allowed > worst.confirmed - worst.allowed) {
      worst = candidate;
    }
  }

  return worst;
}
