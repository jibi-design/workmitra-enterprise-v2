// App name: Job Mitra
// File name: careerHireActivationService.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\services\careerHireActivationService.ts

import { employmentStorage } from "../../../../shared/employment/employmentStorage";
import {
  readAll as readSharedEmployment,
  writeAll as writeSharedEmployment,
} from "../../../../shared/employment/employmentStorageHelpers";
import type { EmploymentRecord as SharedEmploymentRecord } from "../../../../shared/employment/employmentTypes";
import {
  employmentLifecycleStorage,
  type EmploymentRecord as LifecycleEmploymentRecord,
} from "../../../../shared/employment/employmentLifecycle.storage";
import {
  mapSharedEmploymentStatusToLifecycleStatus,
  mapSharedEmploymentStatusToStaffStatus,
} from "../../../career/services/careerEmploymentPublic";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";
import {
  myStaffStorage,
  restoreStaffRecords,
  type StaffRecord,
} from "../../myStaff/storage/myStaff.storage";
import { hrActivateFromCareerHire } from "../../hrManagement/storage/hrStorage.offer";
import {
  readAll as readHrRecords,
  writeAll as writeHrRecords,
} from "../../hrManagement/storage/hrStorage.core";
import type { HRCandidateRecord } from "../../hrManagement/types/hrManagement.types";
import { readCareerWorkspaces, writeCareerWorkspaces } from "../helpers/careerNormalizers";
import type { CareerApplication, CareerJobPost, CareerWorkspace } from "../types/careerTypes";
import { createCareerWorkspace } from "./careerWorkspaceService";

export type CareerHireActivationResult =
  | { ok: true; workspaceId: string }
  | {
      ok: false;
      reason:
        | "workspace_write_error"
        | "staff_write_error"
        | "lifecycle_write_error"
        | "shared_employment_write_error"
        | "hr_write_error";
    };

export type CareerHireActivationSnapshots = {
  workspaces: CareerWorkspace[];
  staff: StaffRecord[];
  lifecycle: LifecycleEmploymentRecord[];
  sharedEmployment: SharedEmploymentRecord[];
  hr: HRCandidateRecord[];
};

export function captureCareerHireActivationSnapshots(): CareerHireActivationSnapshots {
  return {
    workspaces: readCareerWorkspaces(),
    staff: myStaffStorage.getAll(),
    lifecycle: employmentLifecycleStorage.getAll(),
    sharedEmployment: readSharedEmployment(),
    hr: readHrRecords(),
  };
}

export function rollbackCareerHireActivationSnapshots(
  snapshots: CareerHireActivationSnapshots,
): void {
  writeCareerWorkspaces(snapshots.workspaces);
  restoreStaffRecords(snapshots.staff);
  employmentLifecycleStorage.restoreEmploymentLifecycleRecords(snapshots.lifecycle);
  writeSharedEmployment(snapshots.sharedEmployment);
  writeHrRecords(snapshots.hr);
}

function resolveCareerCandidateName(app: CareerApplication): string {
  const fromSnapshot = app.profileSnapshot?.fullName?.trim();
  if (fromSnapshot) return fromSnapshot;

  const fromApp = app.employeeName?.trim();
  return fromApp || "Applicant";
}

function normalizeOfferNoticeDays(value: number | undefined): 0 | 7 | 14 | 30 {
  if (value === 7 || value === 14 || value === 30) return value;
  return 0;
}

export function activateCareerHire(
  post: CareerJobPost,
  app: CareerApplication,
): CareerHireActivationResult {
  // Auth on: LS writers remain as UX/cache prelude; hireCandidate must dual-write
  // confirm-hire API or roll back. Auth off: LS remains authoritative for E2E/demo.
  const snapshots = captureCareerHireActivationSnapshots();
  const now = Date.now();
  const initialEmploymentStatus = "selected" as const;
  const candidateName = resolveCareerCandidateName(app);
  const candidateUniqueId = app.profileSnapshot?.uniqueId ?? app.employeeId;

  const workspaceResult = createCareerWorkspace(post);
  if (!workspaceResult.ok) {
    return { ok: false, reason: "workspace_write_error" };
  }

  try {
    const existingStaff = myStaffStorage.findByCareerPostId(post.id);

    if (!existingStaff) {
      myStaffStorage.addStaff({
        employeeUniqueId: candidateUniqueId,
        employeeName: candidateName,
        jobTitle: post.jobTitle,
        category: post.department || "General",
        employmentType: "full_time",
        joinedAt: now,
        status: mapSharedEmploymentStatusToStaffStatus(initialEmploymentStatus),
        addMethod: "via_app",
        careerPostId: post.id,
        employeeConfirmed: false,
      });
    }

    const existingLifecycleRecord = employmentLifecycleStorage
      .getAll()
      .find((item) => item.careerPostId === post.id && item.status !== "exited");

    if (!existingLifecycleRecord) {
      employmentLifecycleStorage.createEmployment({
        careerPostId: post.id,
        companyName: post.companyName,
        jobTitle: post.jobTitle,
        department: post.department,
        location: post.location,
        joinedAt: now,
        status: mapSharedEmploymentStatusToLifecycleStatus(initialEmploymentStatus),
        verified: true,
        hireMethod: "via_app",
      });
    }

    const existingEmploymentRecord = employmentStorage.getByPostId(post.id);
    const employerProfile = employerSettingsStorage.get();

    if (!existingEmploymentRecord) {
      const created = employmentStorage.create({
        careerPostId: post.id,
        employeeId: app.employeeId,
        employeeName: app.employeeName,
        employeeMlId: app.profileSnapshot?.uniqueId ?? app.employeeId,
        employerId: post.employerId,
        companyName: post.companyName,
        employerMlId: employerProfile.uniqueId ?? "",
        jobTitle: post.jobTitle,
        department: post.department,
        salaryMin: app.offerDetails?.salary ?? post.salaryMin,
        salaryMax: app.offerDetails?.salary ?? post.salaryMax,
        salaryPeriod: app.offerDetails?.salaryPeriod ?? post.salaryPeriod,
        noticePeriodDays: normalizeOfferNoticeDays(app.offerDetails?.noticePeriodDays),
      });

      if (!created) {
        rollbackCareerHireActivationSnapshots(snapshots);
        return { ok: false, reason: "shared_employment_write_error" };
      }
    }

    hrActivateFromCareerHire({
      careerPostId: post.id,
      applicationId: app.id,
      employeeUniqueId: candidateUniqueId,
      employeeName: candidateName,
      jobTitle: post.jobTitle,
      department: post.department || "General",
      location: post.location,
    });
  } catch {
    rollbackCareerHireActivationSnapshots(snapshots);
    return { ok: false, reason: "staff_write_error" };
  }

  return { ok: true, workspaceId: workspaceResult.workspaceId };
}
