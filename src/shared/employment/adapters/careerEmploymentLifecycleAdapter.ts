// App name: Job Mitra
// File name: careerEmploymentLifecycleAdapter.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\shared\employment\adapters\careerEmploymentLifecycleAdapter.ts

import { employmentStorage } from "../employmentStorage";
import type {
  EmploymentRecord as SharedEmploymentRecord,
  EmployeeResignReason,
  EmployerTerminateReason,
} from "../employmentTypes";

export type CareerLifecycleEmploymentStatus =
  "joining_pending" | "active" | "probation" | "resignation_pending" | "notice_period" | "exited";

export type CareerLifecycleExitReason =
  "resigned" | "terminated" | "layoff" | "contract_end" | "mutual_agreement";

export type CareerLifecycleEmploymentRecord = {
  id: string;
  careerPostId: string;
  companyName: string;
  jobTitle: string;
  department: string;
  location: string;
  joinedAt: number;
  exitedAt?: number;
  status: CareerLifecycleEmploymentStatus;
  exitReason?: CareerLifecycleExitReason;
  resignationNote?: string;
  preferredLastDate?: number;
  employerRating?: number;
  employerComment?: string;
  employeeRating?: number;
  employeeComment?: string;
  resignationReminderCount?: number;
  verified: boolean;
  hireMethod: "via_app" | "manually_added";
  createdAt: number;
  updatedAt: number;
};

const ACTIVE_LIFECYCLE_STATUSES: CareerLifecycleEmploymentStatus[] = [
  "joining_pending",
  "active",
  "probation",
  "resignation_pending",
  "notice_period",
];

function mapStatus(status: SharedEmploymentRecord["status"]): CareerLifecycleEmploymentStatus {
  if (status === "selected") return "joining_pending";
  if (status === "working") return "active";
  if (status === "notice") return "notice_period";
  if (status === "resigned") return "resignation_pending";
  return "exited";
}

function mapExitReason(
  exitType: SharedEmploymentRecord["exitType"],
  exitReason: EmployeeResignReason | EmployerTerminateReason | null,
): CareerLifecycleExitReason | undefined {
  if (exitType === "resigned") return "resigned";
  if (exitType === "terminated") return "terminated";

  if (exitReason === "contract_ended") return "contract_end";
  if (exitReason === "company_restructuring") return "layoff";

  return undefined;
}

function getJoinedAt(record: SharedEmploymentRecord): number {
  return record.joinedAt ?? record.acceptedAt ?? record.offeredAt;
}

function getCreatedAt(record: SharedEmploymentRecord): number {
  return record.offeredAt ?? record.acceptedAt ?? getJoinedAt(record);
}

function getUpdatedAt(record: SharedEmploymentRecord): number {
  return (
    record.completedAt ??
    record.resignedAt ??
    record.joinedAt ??
    record.acceptedAt ??
    record.offeredAt
  );
}

function toLifecycleRecord(record: SharedEmploymentRecord): CareerLifecycleEmploymentRecord {
  const status = mapStatus(record.status);
  const joinedAt = getJoinedAt(record);
  const exitedAt = record.completedAt ?? undefined;
  const exitReason = mapExitReason(record.exitType, record.exitReason);

  return {
    id: record.id,
    careerPostId: record.careerPostId,
    companyName: record.companyName,
    jobTitle: record.jobTitle,
    department: record.department,
    location: "",
    joinedAt,
    exitedAt,
    status,
    exitReason,
    resignationNote: record.exitNotes || undefined,
    preferredLastDate: record.lastWorkingDay ?? record.resignedAt ?? undefined,
    verified:
      record.status === "completed" ||
      record.status === "working" ||
      record.status === "notice" ||
      record.status === "resigned",
    hireMethod: "via_app",
    createdAt: getCreatedAt(record),
    updatedAt: getUpdatedAt(record),
  };
}

function sortNewestFirst(
  records: CareerLifecycleEmploymentRecord[],
): CareerLifecycleEmploymentRecord[] {
  return [...records].sort((a, b) => b.createdAt - a.createdAt);
}

function sortOldestJoinedFirst(
  records: CareerLifecycleEmploymentRecord[],
): CareerLifecycleEmploymentRecord[] {
  return [...records].sort((a, b) => a.joinedAt - b.joinedAt);
}

function isActiveLifecycleRecord(record: CareerLifecycleEmploymentRecord): boolean {
  return ACTIVE_LIFECYCLE_STATUSES.includes(record.status);
}

export function getCareerLifecycleRecordsFromShared(): CareerLifecycleEmploymentRecord[] {
  return sortNewestFirst(employmentStorage.getAll().map(toLifecycleRecord));
}

export function getCareerLifecycleActiveListFromShared(): CareerLifecycleEmploymentRecord[] {
  return sortNewestFirst(getCareerLifecycleRecordsFromShared().filter(isActiveLifecycleRecord));
}

export function getCareerLifecycleVerifiedHistoryFromShared(): CareerLifecycleEmploymentRecord[] {
  return getCareerLifecycleRecordsFromShared()
    .filter((record) => record.status === "exited" && record.verified)
    .sort((a, b) => (b.exitedAt ?? b.createdAt) - (a.exitedAt ?? a.createdAt));
}

export function getCareerLifecycleByPostIdFromShared(
  careerPostId: string,
): CareerLifecycleEmploymentRecord | null {
  return (
    getCareerLifecycleRecordsFromShared().find((record) => record.careerPostId === careerPostId) ??
    null
  );
}

export function getCareerLifecyclePrimaryActiveFromShared(): CareerLifecycleEmploymentRecord | null {
  return sortOldestJoinedFirst(getCareerLifecycleActiveListFromShared())[0] ?? null;
}
