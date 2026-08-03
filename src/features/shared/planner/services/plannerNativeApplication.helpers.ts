/**
 * Job Mitra | plannerNativeApplication.helpers.ts
 * Hybrid A2 S8 — planner-native apply/confirm when no dual-write ShiftPost exists.
 * Hybrid A2 P2.1 — audit native confirms.
 * Wave-3: hard-cap confirm against slot.workers + waitingBuffer (no silent overfill).
 */

import {
  getEmployerShiftPosts,
  readEmployeeApplications,
  writeEmployeeApplications,
  type EmployeeShiftApplication,
} from "../ports/plannerLegacyShiftBridge";
import { appendPlannerAudit } from "../../../employer/planner/storage/plannerAuditLog.storage";
import {
  demandPlannerStorage,
  type DemandPlan,
} from "../../../employer/planner/storage/demandPlannerStorage";
import type { DaySlot } from "../../../employer/planner/storage/demandPlanner.schema";

const PENDING: ReadonlySet<EmployeeShiftApplication["status"]> = new Set([
  "applied",
  "shortlisted",
  "waiting",
]);

export function hasRealShiftPost(postId: string): boolean {
  const id = postId.trim();
  if (!id) return false;
  return getEmployerShiftPosts().some((p) => p.id === id);
}

export function countConfirmedPlannerAppsForTarget(args: {
  planId: string;
  /** Real post id (legacy) or synthetic slotId (native). */
  targetId: string;
}): number {
  const planId = args.planId.trim();
  const targetId = args.targetId.trim();
  if (!planId || !targetId) return 0;
  return readEmployeeApplications().filter(
    (app) => app.planId === planId && app.postId === targetId && app.status === "confirmed",
  ).length;
}

function resolveSlotForNativeApp(plan: DemandPlan, app: EmployeeShiftApplication): DaySlot | null {
  const bySlotId = plan.slots.find((s) => s.slotId && s.slotId === app.postId);
  if (bySlotId) return bySlotId;
  const byPostId = plan.slots.find((s) => s.postId && s.postId === app.postId);
  if (byPostId) return byPostId;
  const date = app.selectedDates?.find((d) => typeof d === "string" && d.trim())?.trim();
  if (date) return plan.slots.find((s) => s.date === date) ?? null;
  return null;
}

/** Wave-3 hard capacity for a native planner target (workers + waiting buffer). */
export function getNativeSlotCapacityAllowed(
  plan: DemandPlan,
  app: EmployeeShiftApplication,
): {
  confirmed: number;
  allowed: number;
  atCapacity: boolean;
} {
  const slot = resolveSlotForNativeApp(plan, app);
  const confirmed = countConfirmedPlannerAppsForTarget({
    planId: plan.id,
    targetId: app.postId,
  });
  if (!slot) {
    return { confirmed, allowed: Number.POSITIVE_INFINITY, atCapacity: false };
  }
  const buffer = Math.max(0, Math.floor(plan.waitingBuffer ?? 0));
  const allowed = Math.max(0, Math.floor(slot.workers ?? 0)) + buffer;
  return { confirmed, allowed, atCapacity: confirmed >= allowed };
}

export function confirmPlannerApplicationNative(appId: string): boolean {
  const id = appId.trim();
  if (!id) return false;
  const apps = readEmployeeApplications();
  const idx = apps.findIndex((a) => a.id === id);
  if (idx < 0) return false;
  const app = apps[idx];
  if (!app || !PENDING.has(app.status)) return false;

  const planId = app.planId?.trim();
  const plan = planId ? demandPlannerStorage.getById(planId) : null;
  if (plan) {
    const capacity = getNativeSlotCapacityAllowed(plan, app);
    if (capacity.atCapacity) {
      return false;
    }
  }

  const next = [...apps];
  next[idx] = {
    ...app,
    status: "confirmed",
    notes: { ...app.notes, plannerNativeConfirm: "s8" },
  };
  writeEmployeeApplications(next);

  if (planId && plan) {
    appendPlannerAudit({
      planId,
      actor: "employer",
      actorMlId: plan.legalEntityMlId,
      siteManagerId: plan.siteManagerId,
      action: "native_confirmed",
      summary: `Native confirm · ${app.profileSnapshot?.fullName?.trim() || "Worker"} · target ${app.postId}`,
      meta: {
        applicationId: app.id,
        targetId: app.postId,
        workerMlId: app.profileSnapshot?.uniqueId?.trim() || "",
      },
    });
  }

  return true;
}

export function rejectPlannerApplicationNative(appId: string): boolean {
  const id = appId.trim();
  if (!id) return false;
  const apps = readEmployeeApplications();
  const idx = apps.findIndex((a) => a.id === id);
  if (idx < 0) return false;
  const app = apps[idx];
  if (!app || !PENDING.has(app.status)) return false;

  const next = [...apps];
  next[idx] = {
    ...app,
    status: "rejected",
    notes: { ...app.notes, plannerNativeReject: "s8" },
  };
  writeEmployeeApplications(next);
  return true;
}
