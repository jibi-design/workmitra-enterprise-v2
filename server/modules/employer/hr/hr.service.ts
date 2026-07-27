import type { AuthUser } from "../../auth/types.js";
import { employerHrRepository, isHrUuid } from "./hr.repository.js";
import type {
  HrAttendanceLogRow,
  HrCompanyNoticeRow,
  HrIncidentReportRow,
  HrLeaveRequestRow,
  HrPerformanceReviewRow,
} from "../../hr/types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asDate(value: unknown, fallback = new Date()): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "number" && Number.isFinite(value)) return new Date(value);
  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return fallback;
}

export const employerHrService = {
  async listLeaveRequests(
    employer: AuthUser,
  ): Promise<
    | { ok: true; leaveRequests: HrLeaveRequestRow[] }
    | { ok: false; code: string; message: string; httpStatus: number }
  > {
    try {
      const leaveRequests = await employerHrRepository.listLeaveRequests(employer.id);
      return { ok: true, leaveRequests };
    } catch {
      return {
        ok: false,
        code: "DB_ERROR",
        message: "Failed to list leave requests",
        httpStatus: 500,
      };
    }
  },

  async createLeaveRequest(
    employer: AuthUser,
    body: Record<string, unknown>,
  ): Promise<
    | { ok: true; leaveRequest: HrLeaveRequestRow }
    | { ok: false; code: string; message: string; httpStatus: number }
  > {
    const leaveType = asString(body.leave_type || body.leaveType, "annual");
    if (!["annual", "sick", "casual", "unpaid"].includes(leaveType)) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "Invalid leave_type",
        httpStatus: 400,
      };
    }

    const fromDate = asDate(body.from_date ?? body.fromDate);
    const toDate = asDate(body.to_date ?? body.toDate, fromDate);
    if (toDate.getTime() < fromDate.getTime()) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "to_date before from_date",
        httpStatus: 400,
      };
    }

    const details = isRecord(body.details) ? body.details : { ...body };
    const statusRaw = asString(body.status, "pending");
    const status = ["pending", "approved", "rejected", "cancelled"].includes(statusRaw)
      ? statusRaw
      : "pending";

    try {
      const leaveRequest = await employerHrRepository.createLeaveRequest({
        employerUserId: employer.id,
        employeeUserId: typeof body.employee_user_id === "string" ? body.employee_user_id : null,
        employeeMlId: asString(body.employee_ml_id ?? body.employeeMlId ?? body.employeeUniqueId),
        hrCandidateId: asString(body.hr_candidate_id ?? body.hrCandidateId),
        leaveType,
        status,
        fromDate,
        toDate,
        reason: asString(body.reason),
        details,
      });
      return { ok: true, leaveRequest };
    } catch {
      return {
        ok: false,
        code: "DB_ERROR",
        message: "Failed to create leave request",
        httpStatus: 500,
      };
    }
  },

  async updateLeaveRequest(
    leaveId: string,
    employer: AuthUser,
    body: Record<string, unknown>,
  ): Promise<
    | { ok: true; leaveRequest: HrLeaveRequestRow }
    | { ok: false; code: string; message: string; httpStatus: number }
  > {
    if (!isHrUuid(leaveId)) {
      return { ok: false, code: "VALIDATION_ERROR", message: "Invalid leave id", httpStatus: 400 };
    }

    const statusRaw = typeof body.status === "string" ? body.status.trim() : undefined;
    if (statusRaw && !["pending", "approved", "rejected", "cancelled"].includes(statusRaw)) {
      return { ok: false, code: "VALIDATION_ERROR", message: "Invalid status", httpStatus: 400 };
    }

    const details = isRecord(body.details) ? body.details : undefined;
    const updated = await employerHrRepository.updateLeaveRequest(leaveId, employer.id, {
      status: statusRaw,
      details,
    });
    if (!updated) {
      return { ok: false, code: "NOT_FOUND", message: "Leave request not found", httpStatus: 404 };
    }
    return { ok: true, leaveRequest: updated };
  },

  async listAttendanceLogs(
    employer: AuthUser,
  ): Promise<
    | { ok: true; attendanceLogs: HrAttendanceLogRow[] }
    | { ok: false; code: string; message: string; httpStatus: number }
  > {
    try {
      const attendanceLogs = await employerHrRepository.listAttendanceLogs(employer.id);
      return { ok: true, attendanceLogs };
    } catch {
      return {
        ok: false,
        code: "DB_ERROR",
        message: "Failed to list attendance logs",
        httpStatus: 500,
      };
    }
  },

  async listPerformanceReviews(
    employer: AuthUser,
  ): Promise<
    | { ok: true; performanceReviews: HrPerformanceReviewRow[] }
    | { ok: false; code: string; message: string; httpStatus: number }
  > {
    try {
      const performanceReviews = await employerHrRepository.listPerformanceReviews(employer.id);
      return { ok: true, performanceReviews };
    } catch {
      return {
        ok: false,
        code: "DB_ERROR",
        message: "Failed to list performance reviews",
        httpStatus: 500,
      };
    }
  },

  async listIncidentReports(
    employer: AuthUser,
  ): Promise<
    | { ok: true; incidentReports: HrIncidentReportRow[] }
    | { ok: false; code: string; message: string; httpStatus: number }
  > {
    try {
      const incidentReports = await employerHrRepository.listIncidentReports(employer.id);
      return { ok: true, incidentReports };
    } catch {
      return {
        ok: false,
        code: "DB_ERROR",
        message: "Failed to list incident reports",
        httpStatus: 500,
      };
    }
  },

  async listCompanyNotices(
    employer: AuthUser,
  ): Promise<
    | { ok: true; companyNotices: HrCompanyNoticeRow[] }
    | { ok: false; code: string; message: string; httpStatus: number }
  > {
    try {
      const companyNotices = await employerHrRepository.listCompanyNotices(employer.id);
      return { ok: true, companyNotices };
    } catch {
      return {
        ok: false,
        code: "DB_ERROR",
        message: "Failed to list company notices",
        httpStatus: 500,
      };
    }
  },

  async createCompanyNotice(
    employer: AuthUser,
    body: Record<string, unknown>,
  ): Promise<
    | { ok: true; companyNotice: HrCompanyNoticeRow }
    | { ok: false; code: string; message: string; httpStatus: number }
  > {
    const title = asString(body.title).trim();
    if (title.length < 1) {
      return { ok: false, code: "VALIDATION_ERROR", message: "title required", httpStatus: 400 };
    }
    const content = asString(body.content ?? body.body);
    const details = isRecord(body.details) ? body.details : { ...body };
    const expiresAt =
      body.expires_at == null && body.expiresAt == null
        ? null
        : asDate(body.expires_at ?? body.expiresAt);

    try {
      const companyNotice = await employerHrRepository.createCompanyNotice({
        employerUserId: employer.id,
        title,
        content,
        expiresAt,
        details,
      });
      return { ok: true, companyNotice };
    } catch {
      return {
        ok: false,
        code: "DB_ERROR",
        message: "Failed to create company notice",
        httpStatus: 500,
      };
    }
  },

  async updateCompanyNotice(
    noticeId: string,
    employer: AuthUser,
    body: Record<string, unknown>,
  ): Promise<
    | { ok: true; companyNotice: HrCompanyNoticeRow }
    | { ok: false; code: string; message: string; httpStatus: number }
  > {
    if (!isHrUuid(noticeId)) {
      return { ok: false, code: "VALIDATION_ERROR", message: "Invalid notice id", httpStatus: 400 };
    }

    const details = isRecord(body.details) ? body.details : undefined;
    const updated = await employerHrRepository.updateCompanyNotice(noticeId, employer.id, {
      title: typeof body.title === "string" ? body.title : undefined,
      content:
        typeof body.content === "string"
          ? body.content
          : typeof body.body === "string"
            ? body.body
            : undefined,
      details,
    });
    if (!updated) {
      return { ok: false, code: "NOT_FOUND", message: "Company notice not found", httpStatus: 404 };
    }
    return { ok: true, companyNotice: updated };
  },
};
