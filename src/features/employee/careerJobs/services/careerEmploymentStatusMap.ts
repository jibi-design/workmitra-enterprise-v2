// App name: Job Mitra
// File name: careerEmploymentStatusMap.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\services\careerEmploymentStatusMap.ts

// Single mapping point between shared Career employment source status
// and legacy lifecycle / myStaff display statuses.

import type { EmploymentStatus as SharedEmploymentStatus } from "../../../../shared/employment/employmentTypes";
import type { EmploymentStatus as LegacyEmploymentStatus } from "../../employment/storage/employmentLifecycle.storage";
import type { StaffStatus } from "../../../career/storage/myStaffPublic";

export function mapSharedEmploymentStatusToLifecycleStatus(
  status: SharedEmploymentStatus,
): LegacyEmploymentStatus {
  if (status === "selected") return "joining_pending";
  if (status === "working") return "active";
  if (status === "notice") return "notice_period";
  if (status === "resigned") return "resignation_pending";
  return "exited";
}

export function mapSharedEmploymentStatusToStaffStatus(
  status: SharedEmploymentStatus,
): StaffStatus {
  if (status === "selected") return "joining_pending";
  if (status === "working") return "active";
  if (status === "notice") return "notice_period";
  if (status === "resigned") return "resignation_pending";
  return "exited";
}
