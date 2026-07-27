/** Job Mitra | hrService.ts | Phase 17 — HR DB hydrate + dual-write */

import type { LeaveRequest, LeaveStatus, LeaveType } from "../types/leaveManagement.types";
import type { CompanyNotice, NoticeTarget } from "../types/companyNotice.types";
import { leaveManagementStorage } from "../storage/leaveManagement.storage";
import { companyNoticeStorage } from "../storage/companyNotice.storage";
import { hrEmployerScopedKey } from "../storage/hrStorageKeys";
import {
  hrGateApi,
  isHrApiSyncEnabled,
  type ServerHrCompanyNoticeDto,
  type ServerHrLeaveRequestDto,
} from "./hrGateApi.service";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(id: string): boolean {
  return UUID_RE.test(id);
}

function parseMs(value: string, fallback: number): number {
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : fallback;
}

function mapLeaveFromServer(row: ServerHrLeaveRequestDto): LeaveRequest {
  const d = row.details;
  const leaveType = (
    ["annual", "sick", "casual", "unpaid"].includes(row.leave_type) ? row.leave_type : "annual"
  ) as LeaveType;
  const status = (
    ["pending", "approved", "rejected", "cancelled"].includes(row.status) ? row.status : "pending"
  ) as LeaveStatus;

  return {
    id: row.id,
    hrCandidateId: typeof d.hrCandidateId === "string" ? d.hrCandidateId : row.hr_candidate_id,
    employeeUniqueId:
      typeof d.employeeUniqueId === "string" ? d.employeeUniqueId : row.employee_ml_id,
    employeeName: typeof d.employeeName === "string" ? d.employeeName : "Employee",
    leaveType,
    fromDate: typeof d.fromDate === "number" ? d.fromDate : parseMs(row.from_date, Date.now()),
    toDate: typeof d.toDate === "number" ? d.toDate : parseMs(row.to_date, Date.now()),
    totalDays: typeof d.totalDays === "number" ? d.totalDays : 1,
    reason: row.reason || (typeof d.reason === "string" ? d.reason : ""),
    status,
    respondedAt: typeof d.respondedAt === "number" ? d.respondedAt : undefined,
    respondedBy: typeof d.respondedBy === "string" ? d.respondedBy : undefined,
    responseComment: typeof d.responseComment === "string" ? d.responseComment : undefined,
    appliedAt: typeof d.appliedAt === "number" ? d.appliedAt : parseMs(row.created_at, Date.now()),
    cancelledAt: typeof d.cancelledAt === "number" ? d.cancelledAt : undefined,
  };
}

function mapNoticeFromServer(row: ServerHrCompanyNoticeDto): CompanyNotice {
  const d = row.details;
  const targetRaw = typeof d.target === "string" ? d.target : "all";
  const target = (
    ["all", "department", "location"].includes(targetRaw) ? targetRaw : "all"
  ) as NoticeTarget;

  return {
    id: row.id,
    title: row.title,
    body: row.content || (typeof d.body === "string" ? d.body : ""),
    target,
    targetValue: typeof d.targetValue === "string" ? d.targetValue : "",
    recipientCount: typeof d.recipientCount === "number" ? d.recipientCount : 0,
    recipientIds: Array.isArray(d.recipientIds)
      ? d.recipientIds.filter((x): x is string => typeof x === "string")
      : [],
    readReceipts: Array.isArray(d.readReceipts)
      ? (d.readReceipts as CompanyNotice["readReceipts"])
      : [],
    createdAt: typeof d.createdAt === "number" ? d.createdAt : parseMs(row.posted_at, Date.now()),
  };
}

function writeLeaveCache(records: LeaveRequest[]): void {
  localStorage.setItem(hrEmployerScopedKey("leave_requests_v1"), JSON.stringify(records));
  window.dispatchEvent(new Event("wm:hr-leave-changed"));
}

function writeNoticeCache(records: CompanyNotice[]): void {
  localStorage.setItem(hrEmployerScopedKey("company_notices_v1"), JSON.stringify(records));
  window.dispatchEvent(new Event("wm:company-notices-changed"));
}

function upsertLeaveLocal(mapped: LeaveRequest): void {
  const all = leaveManagementStorage.getAllRequests();
  const without = all.filter(
    (r) =>
      r.id !== mapped.id &&
      !(
        r.hrCandidateId === mapped.hrCandidateId &&
        !isUuid(r.id) &&
        r.appliedAt === mapped.appliedAt
      ),
  );
  // Also drop local-only draft with same localId in details bridge
  writeLeaveCache([mapped, ...without.filter((r) => r.id !== mapped.id)]);
}

function upsertNoticeLocal(mapped: CompanyNotice): void {
  const all = companyNoticeStorage.getAll();
  writeNoticeCache([mapped, ...all.filter((n) => n.id !== mapped.id)]);
}

export async function hydrateHrLeaveRequestsFromDb(): Promise<LeaveRequest[]> {
  if (!isHrApiSyncEnabled()) return leaveManagementStorage.getAllRequests();

  try {
    const rows = await hrGateApi.listLeaveRequests();
    const mapped = rows.map(mapLeaveFromServer);
    const local = leaveManagementStorage.getAllRequests();
    const byId = new Set(mapped.map((r) => r.id));
    const localOnly = local.filter((r) => !isUuid(r.id) && !byId.has(r.id));
    const merged = [...mapped, ...localOnly];
    writeLeaveCache(merged);
    return merged;
  } catch {
    return leaveManagementStorage.getAllRequests();
  }
}

export async function hydrateHrCompanyNoticesFromDb(): Promise<CompanyNotice[]> {
  if (!isHrApiSyncEnabled()) return companyNoticeStorage.getAll();

  try {
    const rows = await hrGateApi.listCompanyNotices();
    const mapped = rows.map(mapNoticeFromServer);
    const local = companyNoticeStorage.getAll();
    const byId = new Set(mapped.map((r) => r.id));
    const localOnly = local.filter((n) => !isUuid(n.id) && !byId.has(n.id));
    const merged = [...mapped, ...localOnly];
    writeNoticeCache(merged);
    return merged;
  } catch {
    return companyNoticeStorage.getAll();
  }
}

export async function hydrateHrReadsFromDb(): Promise<void> {
  if (!isHrApiSyncEnabled()) return;
  await Promise.all([
    hydrateHrLeaveRequestsFromDb(),
    hydrateHrCompanyNoticesFromDb(),
    hrGateApi.listAttendanceLogs().catch(() => []),
    hrGateApi.listPerformanceReviews().catch(() => []),
    hrGateApi.listIncidentReports().catch(() => []),
  ]);
}

export async function createLeaveRequestDualWrite(data: {
  hrCandidateId: string;
  employeeUniqueId: string;
  employeeName: string;
  leaveType: LeaveType;
  fromDate: number;
  toDate: number;
  reason: string;
}): Promise<string | null> {
  const prior = leaveManagementStorage.getAllRequests();
  const localId = leaveManagementStorage.applyLeave(data);
  const created = leaveManagementStorage.getById(localId);
  if (!created) return null;

  if (!isHrApiSyncEnabled()) return localId;

  try {
    const server = await hrGateApi.createLeaveRequest({
      leave_type: created.leaveType,
      status: created.status,
      from_date: new Date(created.fromDate).toISOString(),
      to_date: new Date(created.toDate).toISOString(),
      reason: created.reason,
      employee_ml_id: created.employeeUniqueId,
      hr_candidate_id: created.hrCandidateId,
      details: { ...created, localId },
    });
    const mapped = mapLeaveFromServer(server);
    writeLeaveCache([mapped, ...prior.filter((r) => r.id !== localId)]);
    return mapped.id;
  } catch {
    writeLeaveCache(prior);
    return null;
  }
}

export async function updateLeaveStatusDualWrite(
  id: string,
  status: LeaveStatus,
  comment?: string,
): Promise<boolean> {
  const prior = leaveManagementStorage.getAllRequests();
  let ok = false;
  if (status === "approved") ok = leaveManagementStorage.approveLeave(id, comment);
  else if (status === "rejected")
    ok = leaveManagementStorage.rejectLeave(id, comment || "No reason provided");
  else if (status === "cancelled") ok = leaveManagementStorage.cancelLeave(id);
  if (!ok) return false;

  if (!isHrApiSyncEnabled()) return true;

  const updated = leaveManagementStorage.getById(id);
  if (!updated) return false;

  if (!isUuid(id)) {
    writeLeaveCache(prior);
    return false;
  }

  try {
    const server = await hrGateApi.patchLeaveRequest(id, {
      status,
      details: { ...updated },
    });
    upsertLeaveLocal(mapLeaveFromServer(server));
    return true;
  } catch {
    writeLeaveCache(prior);
    return false;
  }
}

export async function createCompanyNoticeDualWrite(data: {
  title: string;
  body: string;
  target: NoticeTarget;
  targetValue: string;
}): Promise<string | null> {
  const prior = companyNoticeStorage.getAll();
  const localId = companyNoticeStorage.sendNotice(data);
  const created = companyNoticeStorage.getAll().find((n) => n.id === localId) ?? null;
  if (!created) return null;

  if (!isHrApiSyncEnabled()) return localId;

  try {
    const server = await hrGateApi.createCompanyNotice({
      title: created.title,
      content: created.body,
      details: { ...created, localId },
    });
    const mapped = mapNoticeFromServer(server);
    writeNoticeCache([mapped, ...prior.filter((n) => n.id !== localId)]);
    return mapped.id;
  } catch {
    writeNoticeCache(prior);
    return null;
  }
}

export async function updateCompanyNoticeDualWrite(
  id: string,
  patch: { title?: string; body?: string },
): Promise<boolean> {
  if (!isHrApiSyncEnabled()) return true;
  if (!isUuid(id)) return false;

  const prior = companyNoticeStorage.getAll();
  const current = prior.find((n) => n.id === id);
  if (!current) return false;

  const next: CompanyNotice = {
    ...current,
    title: patch.title?.trim() || current.title,
    body: patch.body ?? current.body,
  };
  writeNoticeCache(prior.map((n) => (n.id === id ? next : n)));

  try {
    const server = await hrGateApi.patchCompanyNotice(id, {
      title: next.title,
      content: next.body,
      details: { ...next },
    });
    upsertNoticeLocal(mapNoticeFromServer(server));
    return true;
  } catch {
    writeNoticeCache(prior);
    return false;
  }
}

/** Facade exports used by pages */
export const hrService = {
  hydrateReads: hydrateHrReadsFromDb,
  listLeaveRequests: hydrateHrLeaveRequestsFromDb,
  listCompanyNotices: hydrateHrCompanyNoticesFromDb,
  createLeaveRequest: createLeaveRequestDualWrite,
  updateLeaveStatus: updateLeaveStatusDualWrite,
  createCompanyNotice: createCompanyNoticeDualWrite,
  updateCompanyNotice: updateCompanyNoticeDualWrite,
  isSyncEnabled: isHrApiSyncEnabled,
};
