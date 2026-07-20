// App name: Job Mitra
// File name: careerEmploymentSideSyncService.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\services\careerEmploymentSideSyncService.ts

// Keeps legacy side records aligned with the shared Career employment source.
// Temporary bridge until Employment Detail/Home fully migrate to shared employmentStorage.

import {
  employmentLifecycleStorage,
  type ExitReason,
} from "../../employment/storage/employmentLifecycle.storage";
import {
  myStaffStorage,
  restoreStaffRecords,
  type StaffExitReason,
} from "../../../employer/myStaff/storage/myStaff.storage";
import type {
  EmployeeResignReason,
  EmployerTerminateReason,
  EmploymentRecord,
} from "../../../../shared/employment/employmentTypes";
import {
  mapSharedEmploymentStatusToLifecycleStatus,
  mapSharedEmploymentStatusToStaffStatus,
} from "./careerEmploymentStatusMap";

export type CareerSideSyncResult =
  { ok: true } | { ok: false; reason: "staff_write_error" | "lifecycle_write_error" };

function getActiveLifecycleRecord(careerPostId: string) {
  return (
    employmentLifecycleStorage
      .getAll()
      .find((item) => item.careerPostId === careerPostId && item.status !== "exited") ?? null
  );
}

function getStaffRecord(careerPostId: string) {
  return myStaffStorage.findByCareerPostId(careerPostId);
}

function mapEmployerTerminateReasonToStaffExitReason(
  reason: EmployerTerminateReason,
): StaffExitReason {
  if (reason === "contract_ended") return "contract_end";
  if (reason === "company_restructuring") return "layoff";

  return "terminated";
}

function mapEmployerTerminateReasonToLifecycleExitReason(
  reason: EmployerTerminateReason,
): ExitReason {
  if (reason === "contract_ended") return "contract_end";
  if (reason === "company_restructuring") return "layoff";

  return "terminated";
}

function runSideSync(
  careerPostId: string,
  mutate: (args: {
    staff: ReturnType<typeof getStaffRecord>;
    lifecycleRecord: ReturnType<typeof getActiveLifecycleRecord>;
  }) => void,
): CareerSideSyncResult {
  const priorStaff = myStaffStorage.getAll();
  const priorLifecycle = employmentLifecycleStorage.getAll();
  let staffUpdated = false;

  try {
    const staff = getStaffRecord(careerPostId);
    const lifecycleRecord = getActiveLifecycleRecord(careerPostId);

    if (staff) {
      staffUpdated = true;
    }

    mutate({ staff, lifecycleRecord });
    return { ok: true };
  } catch {
    if (staffUpdated) {
      restoreStaffRecords(priorStaff);
    }
    employmentLifecycleStorage.restoreEmploymentLifecycleRecords(priorLifecycle);
    return { ok: false, reason: staffUpdated ? "lifecycle_write_error" : "staff_write_error" };
  }
}

export function syncCareerSideRecordsAfterMarkJoined(
  careerPostId: string,
  result: EmploymentRecord,
  joinedAt: number,
): CareerSideSyncResult {
  const lifecycleStatus = mapSharedEmploymentStatusToLifecycleStatus(result.status);
  const staffStatus = mapSharedEmploymentStatusToStaffStatus(result.status);

  return runSideSync(careerPostId, ({ staff, lifecycleRecord }) => {
    if (staff) {
      myStaffStorage.updateStaff(staff.id, {
        status: staffStatus,
        joinedAt,
        employeeConfirmed: true,
      });
    }

    if (lifecycleRecord) {
      employmentLifecycleStorage.update(lifecycleRecord.id, {
        status: lifecycleStatus,
        joinedAt,
        verified: true,
      });
    }
  });
}

export function syncCareerSideRecordsAfterResignation(
  careerPostId: string,
  result: EmploymentRecord,
  reason: EmployeeResignReason,
  notes: string,
): CareerSideSyncResult {
  const lifecycleStatus = mapSharedEmploymentStatusToLifecycleStatus(result.status);
  const staffStatus = mapSharedEmploymentStatusToStaffStatus(result.status);
  const cleanNotes = notes.trim();
  const safeNote = cleanNotes ? `${reason}: ${cleanNotes}` : reason;

  return runSideSync(careerPostId, ({ staff, lifecycleRecord }) => {
    if (staff) {
      myStaffStorage.updateStaff(staff.id, {
        status: staffStatus,
      });
    }

    if (lifecycleRecord) {
      employmentLifecycleStorage.update(lifecycleRecord.id, {
        status: lifecycleStatus,
        resignationNote: safeNote,
        preferredLastDate: result.lastWorkingDay ?? Date.now(),
      });
    }
  });
}

export function syncCareerSideRecordsAfterWithdraw(careerPostId: string): CareerSideSyncResult {
  const lifecycleStatus = mapSharedEmploymentStatusToLifecycleStatus("working");
  const staffStatus = mapSharedEmploymentStatusToStaffStatus("working");

  return runSideSync(careerPostId, ({ staff, lifecycleRecord }) => {
    if (staff) {
      myStaffStorage.updateStaff(staff.id, {
        status: staffStatus,
      });
    }

    if (lifecycleRecord) {
      employmentLifecycleStorage.update(lifecycleRecord.id, {
        status: lifecycleStatus,
        resignationNote: undefined,
        preferredLastDate: undefined,
      });
    }
  });
}

export function syncCareerSideRecordsAfterConfirmResignation(
  careerPostId: string,
  result: EmploymentRecord,
): CareerSideSyncResult {
  const completedAt = result.completedAt ?? Date.now();

  return runSideSync(careerPostId, ({ staff, lifecycleRecord }) => {
    if (staff) {
      myStaffStorage.acceptResignation(staff.id, completedAt);
    }

    if (lifecycleRecord) {
      employmentLifecycleStorage.processExit(lifecycleRecord.id, "resigned", completedAt);
    }
  });
}

export function syncCareerSideRecordsAfterTerminate(
  careerPostId: string,
  result: EmploymentRecord,
  reason: EmployerTerminateReason,
): CareerSideSyncResult {
  const completedAt = result.completedAt ?? Date.now();

  return runSideSync(careerPostId, ({ staff, lifecycleRecord }) => {
    if (staff) {
      myStaffStorage.endEmployment(
        staff.id,
        mapEmployerTerminateReasonToStaffExitReason(reason),
        completedAt,
      );
    }

    if (lifecycleRecord) {
      employmentLifecycleStorage.processExit(
        lifecycleRecord.id,
        mapEmployerTerminateReasonToLifecycleExitReason(reason),
        completedAt,
      );
    }
  });
}

export function syncCareerSideRecordsAfterForceComplete(
  careerPostId: string,
  completedAt: number,
): CareerSideSyncResult {
  return runSideSync(careerPostId, ({ staff, lifecycleRecord }) => {
    if (staff) {
      myStaffStorage.acceptResignation(staff.id, completedAt);
    }

    if (lifecycleRecord) {
      employmentLifecycleStorage.processExit(lifecycleRecord.id, "resigned", completedAt);
    }
  });
}
