/** Job Mitra | plannerSlotEdit.service.ts | Post-publish slot edit (soft warn, never block) */

import { readEmployeeApplications } from "../../../shared/planner/ports/plannerLegacyShiftBridge";
import type { DaySlot } from "../storage/demandPlanner.schema";
import { demandPlannerStorage } from "../storage/demandPlannerStorage";
import { appendPlannerAudit } from "../storage/plannerAuditLog.storage";

export type SlotEditInput = Partial<Pick<DaySlot, "workers" | "payPerDay" | "category">>;

export type SlotEditResult = { ok: true; softWarn?: string } | { ok: false; reason: string };

export function editPlanSlot(
  planId: string,
  slotIdOrDate: string,
  edits: SlotEditInput,
): SlotEditResult {
  const plan = demandPlannerStorage.getById(planId);
  if (!plan) return { ok: false, reason: "not_found" };
  if (plan.status === "cancelled") return { ok: false, reason: "cancelled" };

  const key = slotIdOrDate.trim();
  const slotIndex = plan.slots.findIndex(
    (s) => s.slotId === key || s.date === key || s.postId === key,
  );
  if (slotIndex < 0) return { ok: false, reason: "slot_not_found" };

  const slot = plan.slots[slotIndex]!;
  const nextWorkers =
    typeof edits.workers === "number" && Number.isFinite(edits.workers)
      ? Math.max(0, Math.floor(edits.workers))
      : slot.workers;
  const nextPay =
    typeof edits.payPerDay === "number" && Number.isFinite(edits.payPerDay)
      ? Math.max(0, edits.payPerDay)
      : slot.payPerDay;
  const nextCategory =
    edits.category !== undefined ? edits.category.trim() || undefined : slot.category;

  const apps = readEmployeeApplications().filter((a) => a.planId === planId);
  const confirmed = apps.filter((app) => {
    if (app.status !== "confirmed") return false;
    const target = (slot.postId || slot.slotId || "").trim();
    if (target && app.postId === target) return true;
    if (app.selectedDates?.includes(slot.date)) return true;
    return false;
  }).length;

  let softWarn: string | undefined;
  if (nextWorkers < confirmed) {
    softWarn = `You have more confirmed workers (${confirmed}) than this slot allows (${nextWorkers}).`;
    /* TIER: ADVISORY */ console.warn("[SlotEdit]", softWarn, { planId, slot: key });
  }

  const nextSlots = plan.slots.map((s, i) =>
    i === slotIndex
      ? { ...s, workers: nextWorkers, payPerDay: nextPay, category: nextCategory }
      : s,
  );

  const updated = demandPlannerStorage.updatePlan(planId, { slots: nextSlots });
  if (!updated.ok) return { ok: false, reason: updated.reason };

  appendPlannerAudit({
    planId,
    actor: "employer",
    actorMlId: plan.legalEntityMlId,
    siteManagerId: plan.siteManagerId,
    action: "edit_unfilled_slot",
    summary: softWarn
      ? `Slot edit with soft override · ${slot.date}`
      : `Slot edited · ${slot.date}`,
    meta: {
      slotId: slot.slotId ?? slot.date,
      workers: nextWorkers,
      payPerDay: nextPay,
      category: nextCategory ?? "",
      softOverride: Boolean(softWarn),
    },
  });

  return softWarn ? { ok: true, softWarn } : { ok: true };
}
