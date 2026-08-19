// App name: Job Mitra
// File name: shiftHireMyStaffActivation.service.ts
// Thin My Staff (+ Workforce Ops) activation on Shift confirm — mirrors Career hire staff write
// (no Career employment / HR lifecycle).

import { myStaffStorage } from "../../myStaff/storage/myStaff.storage";
import { workforceCategoryService } from "../../workforceOps/services/workforceCategoryService";
import { workforceStaffService } from "../../workforceOps/services/workforceStaffService";
import type { EmployeeShiftApplication, ShiftPost } from "../storage/employerShift.types";

export type ShiftHireMyStaffResult =
  | { ok: true; staffId: string; created: boolean }
  | { ok: false; reason: "missing_worker_id" | "staff_write_error" };

const SHIFT_HIRE_CATEGORY_NAME = "Shift Hire";

function resolveShiftWorkerName(app: EmployeeShiftApplication): string {
  const fromSnapshot = app.profileSnapshot?.fullName?.trim();
  if (fromSnapshot) return fromSnapshot;
  return "Worker";
}

/** Best-effort Workforce Ops staff row (requires ≥1 category). */
function syncWorkforceOpsStaff(employeeUniqueId: string): void {
  if (workforceStaffService.getByEmployeeId(employeeUniqueId)) return;

  const existing = workforceCategoryService.getAll();
  let categoryId =
    existing.find((c) => c.name.trim().toLowerCase() === SHIFT_HIRE_CATEGORY_NAME.toLowerCase())
      ?.id ?? null;

  if (!categoryId) {
    const created = workforceCategoryService.create(SHIFT_HIRE_CATEGORY_NAME);
    categoryId = created.id ?? null;
  }

  if (!categoryId && existing[0]?.id) {
    categoryId = existing[0].id;
  }

  if (!categoryId) return;

  workforceStaffService.add({
    employeeUniqueId,
    categories: [categoryId],
    bio: "Added automatically from Shift confirm hire.",
  });
}

/**
 * Ensures a My Staff card exists after a successful Shift confirm.
 * Also syncs Workforce Ops staff directory (best-effort).
 * Idempotent per shiftPostId + uniqueId (does not duplicate active rows).
 */
export function activateShiftHireMyStaff(
  post: ShiftPost,
  app: EmployeeShiftApplication,
): ShiftHireMyStaffResult {
  const employeeUniqueId = app.profileSnapshot?.uniqueId?.trim() ?? "";
  if (!employeeUniqueId) {
    return { ok: false, reason: "missing_worker_id" };
  }

  try {
    const byShift = myStaffStorage.findByShiftPostId(post.id);
    if (byShift) {
      syncWorkforceOpsStaff(employeeUniqueId);
      return { ok: true, staffId: byShift.id, created: false };
    }

    const byWorker = myStaffStorage.findByUniqueId(employeeUniqueId);
    if (byWorker && byWorker.status !== "exited") {
      if (!byWorker.shiftPostId) {
        myStaffStorage.updateStaff(byWorker.id, {
          shiftPostId: post.id,
          jobTitle: byWorker.jobTitle || post.jobName,
          category: byWorker.category || post.category || "General",
        });
      }
      syncWorkforceOpsStaff(employeeUniqueId);
      return { ok: true, staffId: byWorker.id, created: false };
    }

    const staffId = myStaffStorage.addStaff({
      employeeUniqueId,
      employeeName: resolveShiftWorkerName(app),
      jobTitle: post.jobName,
      category: post.category?.trim() || "General",
      employmentType: "contract",
      joinedAt: Date.now(),
      status: "joining_pending",
      addMethod: "via_app",
      shiftPostId: post.id,
      employeeConfirmed: false,
    });

    syncWorkforceOpsStaff(employeeUniqueId);
    return { ok: true, staffId, created: true };
  } catch {
    return { ok: false, reason: "staff_write_error" };
  }
}
