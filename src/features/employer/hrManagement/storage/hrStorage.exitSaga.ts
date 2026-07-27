// src/features/employer/hrManagement/storage/hrStorage.exitSaga.ts
//
// GAP-019: Cross-domain exit saga — HR + My Staff + lifecycle + shared employment.

import { employmentLifecycleStorage } from "../../../../shared/employment/employmentLifecycle.storage";
import type { ExitReason as LifecycleExitReason } from "../../../../shared/employment/employmentLifecycle.storage";
import { myStaffStorage, restoreStaffRecords } from "../../myStaff/storage/myStaff.storage";
import type { StaffExitReason } from "../../myStaff/storage/myStaff.storage";
import { employmentActions } from "../../../../shared/employment/employmentStorage";
import { employmentStorage } from "../../../../shared/employment/employmentStorage";
import {
  readAll as readSharedEmployment,
  writeAll as writeSharedEmployment,
} from "../../../../shared/employment/employmentStorageHelpers";
import type { ExitTrigger } from "../types/exitProcessing.types";
import {
  hrGetById,
  pushStatusChange,
  readAll as readHrRecords,
  writeAll as writeHrRecords,
} from "./hrStorage.core";

export type HrCompleteExitSagaResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "not_found"
        | "not_ready"
        | "hr_write_error"
        | "staff_write_error"
        | "lifecycle_write_error"
        | "shared_employment_write_error";
    };

function mapExitTriggerToStaffReason(trigger: ExitTrigger): StaffExitReason {
  if (trigger === "employer_terminated") return "terminated";
  if (trigger === "contract_ended") return "contract_end";
  if (trigger === "mutual_agreement") return "mutual_agreement";
  return "resigned";
}

function mapExitTriggerToLifecycleReason(trigger: ExitTrigger): LifecycleExitReason {
  return mapExitTriggerToStaffReason(trigger);
}

async function syncSharedEmploymentExit(
  careerPostId: string,
  trigger: ExitTrigger,
  note: string,
): Promise<boolean> {
  const record = employmentStorage.getByPostId(careerPostId);
  if (!record || record.status === "completed") return true;

  if (trigger === "employer_terminated") {
    return (
      (await employmentActions.terminate(careerPostId, "other", note || "HR exit completed")) !==
      null
    );
  }

  if (trigger === "contract_ended") {
    return (
      (await employmentActions.terminate(
        careerPostId,
        "contract_ended",
        note || "Contract ended",
      )) !== null
    );
  }

  const confirmed = await employmentActions.confirmResignation(careerPostId);
  if (confirmed) return true;

  return (
    (await employmentActions.terminate(careerPostId, "other", note || "HR exit completed")) !== null
  );
}

export async function hrCompleteExitSaga(id: string): Promise<HrCompleteExitSagaResult> {
  const rec = hrGetById(id);
  if (!rec || rec.status !== "exit_processing" || !rec.exitData) {
    return { ok: false, reason: "not_found" };
  }

  const allCleared = rec.exitData.clearanceItems.every((item) => item.completedAt);
  if (!allCleared || !rec.exitData.experienceLetterSent) {
    return { ok: false, reason: "not_ready" };
  }

  const exitedAt = Date.now();
  const exitReason = mapExitTriggerToStaffReason(rec.exitData.trigger);
  const lifecycleReason = mapExitTriggerToLifecycleReason(rec.exitData.trigger);
  const triggerNote = rec.exitData.triggerNote?.trim() || "HR exit completed";

  const priorHrRecords = readHrRecords();
  const priorStaffRecords = myStaffStorage.getAll();
  const priorLifecycleRecords = employmentLifecycleStorage.getAll();
  const priorSharedEmploymentRecords = readSharedEmployment();

  const staffRecord =
    myStaffStorage.findByUniqueId(rec.employeeUniqueId) ??
    (rec.careerPostId ? myStaffStorage.findByCareerPostId(rec.careerPostId) : null);

  const lifecycleRecord = priorLifecycleRecords.find(
    (record) => record.careerPostId === rec.careerPostId && record.status !== "exited",
  );

  const sharedEmploymentRecord = rec.careerPostId
    ? employmentStorage.getByPostId(rec.careerPostId)
    : null;

  // Step 1 — CRITICAL: HR record exited.
  const hrIndex = priorHrRecords.findIndex((record) => record.id === id);
  if (hrIndex < 0) return { ok: false, reason: "not_found" };

  const nextHrRecords = [...priorHrRecords];
  nextHrRecords[hrIndex] = {
    ...rec,
    status: "exited",
    exitData: { ...rec.exitData, exitCompletedAt: exitedAt },
    statusHistory: pushStatusChange(
      rec,
      "exit_processing",
      "exited",
      "employer",
      "Exit process completed",
    ),
    updatedAt: exitedAt,
  };

  try {
    writeHrRecords(nextHrRecords);
  } catch {
    return { ok: false, reason: "hr_write_error" };
  }

  // Step 2 — CRITICAL: My Staff exited (when linked).
  if (staffRecord) {
    const staffUpdated = myStaffStorage.endEmployment(staffRecord.id, exitReason, exitedAt);

    if (!staffUpdated) {
      writeHrRecords(priorHrRecords);
      return { ok: false, reason: "staff_write_error" };
    }
  }

  // Step 3 — CRITICAL: employment lifecycle exited (when linked).
  if (lifecycleRecord) {
    const lifecycleUpdated = employmentLifecycleStorage.processExit(
      lifecycleRecord.id,
      lifecycleReason,
      exitedAt,
    );

    if (!lifecycleUpdated) {
      restoreStaffRecords(priorStaffRecords);
      writeHrRecords(priorHrRecords);
      return { ok: false, reason: "lifecycle_write_error" };
    }
  }

  // Step 4 — CRITICAL: shared career employment completed (when linked).
  if (sharedEmploymentRecord && sharedEmploymentRecord.status !== "completed") {
    const sharedUpdated = await syncSharedEmploymentExit(
      rec.careerPostId,
      rec.exitData.trigger,
      triggerNote,
    );

    if (!sharedUpdated) {
      writeSharedEmployment(priorSharedEmploymentRecords);
      employmentLifecycleStorage.restoreEmploymentLifecycleRecords(priorLifecycleRecords);
      restoreStaffRecords(priorStaffRecords);
      writeHrRecords(priorHrRecords);
      return { ok: false, reason: "shared_employment_write_error" };
    }
  }

  return { ok: true };
}
