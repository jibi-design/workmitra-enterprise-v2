/** Job Mitra | employmentDbTruth.service.ts | Phase 16 — Employment DB → LS cache */

import type {
  EmploymentRecord,
  EmploymentStatus,
  NoticePeriodDays,
} from "../../../shared/employment/employmentTypes";
import { readAll, writeAllChecked } from "../../../shared/employment/employmentStorageHelpers";
import {
  careerGateApi,
  isCareerApiSyncEnabled,
  type ServerCareerEmploymentDto,
} from "./careerGateApi.service";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function parseIsoMs(value: string, fallback: number): number {
  if (!value.trim()) return fallback;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : fallback;
}

function mapServerStatusToClient(
  serverStatus: string,
  details: Record<string, unknown>,
): EmploymentStatus {
  const client = details.clientStatus;
  if (
    client === "selected" ||
    client === "working" ||
    client === "notice" ||
    client === "resigned" ||
    client === "completed"
  ) {
    return client;
  }
  if (serverStatus === "terminated") return "completed";
  if (serverStatus === "resigned") return "resigned";
  if (asNumber(details.joinedAt, 0) > 0) return "working";
  return "selected";
}

function mapClientStatusToServer(status: EmploymentStatus): "active" | "resigned" | "terminated" {
  if (status === "completed") return "terminated";
  if (status === "resigned") return "resigned";
  return "active";
}

export function mapServerEmploymentToLocal(row: ServerCareerEmploymentDto): EmploymentRecord {
  const d = isRecord(row.details) ? row.details : {};
  const confirmedMs = parseIsoMs(row.confirmed_at, Date.now());
  const noticeRaw = asNumber(d.noticePeriodDays, 0);
  const noticePeriodDays = ([0, 7, 14, 30].includes(noticeRaw) ? noticeRaw : 0) as NoticePeriodDays;

  return {
    id: row.id,
    careerPostId: asString(d.careerPostId, row.post_id),
    employeeId: asString(d.employeeId, row.employee_user_id),
    employeeName: asString(d.employeeName, "Employee"),
    employeeMlId: asString(d.employeeMlId, ""),
    employerId: asString(d.employerId, row.employer_user_id),
    companyName: asString(d.companyName, "Company"),
    employerMlId: asString(d.employerMlId, ""),
    jobTitle: asString(d.jobTitle, asString(d.postTitle, "Role")),
    department: asString(d.department, ""),
    salaryMin: asNumber(d.salaryMin, 0),
    salaryMax: asNumber(d.salaryMax, 0),
    salaryPeriod: asString(d.salaryPeriod, "Monthly"),
    status: mapServerStatusToClient(row.status, d),
    offeredAt: asNumber(d.offeredAt, confirmedMs),
    acceptedAt: asNumber(d.acceptedAt, confirmedMs),
    joinedAt: d.joinedAt == null ? null : asNumber(d.joinedAt, 0) || null,
    resignedAt: d.resignedAt == null ? null : asNumber(d.resignedAt, 0) || null,
    completedAt: d.completedAt == null ? null : asNumber(d.completedAt, 0) || null,
    noticePeriodDays,
    lastWorkingDay: d.lastWorkingDay == null ? null : asNumber(d.lastWorkingDay, 0) || null,
    exitType: d.exitType === "resigned" || d.exitType === "terminated" ? d.exitType : null,
    exitReason: (d.exitReason as EmploymentRecord["exitReason"]) ?? null,
    exitNotes: asString(d.exitNotes, ""),
    wasWithdrawn: d.wasWithdrawn === true,
    withdrawnAt: d.withdrawnAt == null ? null : asNumber(d.withdrawnAt, 0) || null,
    workDurationDays: d.workDurationDays == null ? null : asNumber(d.workDurationDays, 0),
    workDurationDisplay: asString(d.workDurationDisplay, ""),
    timeline: Array.isArray(d.timeline) ? (d.timeline as EmploymentRecord["timeline"]) : [],
    forceCompleted: d.forceCompleted === true,
    employeeRated: d.employeeRated === true,
    employerRated: d.employerRated === true,
  };
}

export function employmentRecordToServerDetails(record: EmploymentRecord): Record<string, unknown> {
  return {
    clientStatus: record.status,
    careerPostId: record.careerPostId,
    employeeId: record.employeeId,
    employeeName: record.employeeName,
    employeeMlId: record.employeeMlId,
    employerId: record.employerId,
    companyName: record.companyName,
    employerMlId: record.employerMlId,
    jobTitle: record.jobTitle,
    department: record.department,
    salaryMin: record.salaryMin,
    salaryMax: record.salaryMax,
    salaryPeriod: record.salaryPeriod,
    offeredAt: record.offeredAt,
    acceptedAt: record.acceptedAt,
    joinedAt: record.joinedAt,
    resignedAt: record.resignedAt,
    completedAt: record.completedAt,
    noticePeriodDays: record.noticePeriodDays,
    lastWorkingDay: record.lastWorkingDay,
    exitType: record.exitType,
    exitReason: record.exitReason,
    exitNotes: record.exitNotes,
    wasWithdrawn: record.wasWithdrawn,
    withdrawnAt: record.withdrawnAt,
    workDurationDays: record.workDurationDays,
    workDurationDisplay: record.workDurationDisplay,
    timeline: record.timeline,
    forceCompleted: record.forceCompleted,
    employeeRated: record.employeeRated,
    employerRated: record.employerRated,
  };
}

export function serverStatusForRecord(record: EmploymentRecord): string {
  return mapClientStatusToServer(record.status);
}

/**
 * Hydrate shared employment LS from employee or employer list API.
 */
export async function hydrateEmploymentsFromDb(role: "employee" | "employer"): Promise<void> {
  if (!isCareerApiSyncEnabled()) return;

  try {
    const rows =
      role === "employee"
        ? await careerGateApi.listMyEmployments()
        : await careerGateApi.listEmployerStaffEmployments();

    const mapped = rows.map(mapServerEmploymentToLocal);
    const local = readAll();
    const byPost = new Map(mapped.map((r) => [r.careerPostId, r]));

    // Keep local-only demo records (non-UUID ids) that don't collide by post
    const localOnly = local.filter((r) => {
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(r.id);
      if (isUuid) return false;
      return !byPost.has(r.careerPostId);
    });

    writeAllChecked([...mapped, ...localOnly]);
  } catch {
    // keep LS cache
  }
}

export function upsertLocalEmploymentFromServer(row: ServerCareerEmploymentDto): void {
  const mapped = mapServerEmploymentToLocal(row);
  const all = readAll();
  const without = all.filter((r) => r.id !== mapped.id && r.careerPostId !== mapped.careerPostId);
  writeAllChecked([mapped, ...without]);
}

export async function dualWriteEmploymentUpdate(
  record: EmploymentRecord,
  role: "employee" | "employer",
): Promise<boolean> {
  if (!isCareerApiSyncEnabled()) return true;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    record.id,
  );
  if (!isUuid) return true;

  try {
    const body = {
      status: serverStatusForRecord(record),
      details: employmentRecordToServerDetails(record),
    };
    const updated =
      role === "employee"
        ? await careerGateApi.patchEmployeeEmployment(record.id, body)
        : await careerGateApi.patchEmployerEmployment(record.id, body);
    upsertLocalEmploymentFromServer(updated);
    return true;
  } catch {
    return false;
  }
}
