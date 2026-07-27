import { getPool } from "../../../db/pool.js";
import type {
  HrAttendanceLogRow,
  HrCompanyNoticeRow,
  HrIncidentReportRow,
  HrLeaveRequestRow,
  HrPerformanceReviewRow,
} from "../../hr/types.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isHrUuid(id: string): boolean {
  return UUID_RE.test(id.trim());
}

function asDetails(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export const employerHrRepository = {
  async listLeaveRequests(employerUserId: string): Promise<HrLeaveRequestRow[]> {
    const result = await getPool().query<HrLeaveRequestRow>(
      `SELECT id, employer_user_id, employee_user_id, employee_ml_id, hr_candidate_id,
              leave_type, status, from_date, to_date, reason,
              COALESCE(details, '{}'::jsonb) AS details, created_at, updated_at
       FROM hr_leave_requests
       WHERE employer_user_id = $1
       ORDER BY created_at DESC
       LIMIT 500`,
      [employerUserId],
    );
    return result.rows;
  },

  async createLeaveRequest(params: {
    employerUserId: string;
    employeeUserId?: string | null;
    employeeMlId: string;
    hrCandidateId: string;
    leaveType: string;
    status: string;
    fromDate: Date;
    toDate: Date;
    reason: string;
    details: Record<string, unknown>;
  }): Promise<HrLeaveRequestRow> {
    const result = await getPool().query<HrLeaveRequestRow>(
      `INSERT INTO hr_leave_requests
         (employer_user_id, employee_user_id, employee_ml_id, hr_candidate_id,
          leave_type, status, from_date, to_date, reason, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
       RETURNING id, employer_user_id, employee_user_id, employee_ml_id, hr_candidate_id,
                 leave_type, status, from_date, to_date, reason,
                 COALESCE(details, '{}'::jsonb) AS details, created_at, updated_at`,
      [
        params.employerUserId,
        params.employeeUserId ?? null,
        params.employeeMlId,
        params.hrCandidateId,
        params.leaveType,
        params.status,
        params.fromDate,
        params.toDate,
        params.reason,
        JSON.stringify(params.details),
      ],
    );
    return result.rows[0];
  },

  async updateLeaveRequest(
    id: string,
    employerUserId: string,
    patch: { status?: string; details?: Record<string, unknown> },
  ): Promise<HrLeaveRequestRow | null> {
    const existing = await getPool().query<HrLeaveRequestRow>(
      `SELECT id, employer_user_id, employee_user_id, employee_ml_id, hr_candidate_id,
              leave_type, status, from_date, to_date, reason,
              COALESCE(details, '{}'::jsonb) AS details, created_at, updated_at
       FROM hr_leave_requests
       WHERE id = $1 AND employer_user_id = $2`,
      [id, employerUserId],
    );
    const row = existing.rows[0];
    if (!row) return null;

    const nextStatus = patch.status?.trim() || row.status;
    const nextDetails = { ...asDetails(row.details), ...(patch.details ?? {}) };

    const result = await getPool().query<HrLeaveRequestRow>(
      `UPDATE hr_leave_requests
       SET status = $3,
           details = $4::jsonb,
           updated_at = now()
       WHERE id = $1 AND employer_user_id = $2
       RETURNING id, employer_user_id, employee_user_id, employee_ml_id, hr_candidate_id,
                 leave_type, status, from_date, to_date, reason,
                 COALESCE(details, '{}'::jsonb) AS details, created_at, updated_at`,
      [id, employerUserId, nextStatus, JSON.stringify(nextDetails)],
    );
    return result.rows[0] ?? null;
  },

  async listAttendanceLogs(employerUserId: string): Promise<HrAttendanceLogRow[]> {
    const result = await getPool().query<HrAttendanceLogRow>(
      `SELECT id, employer_user_id, employee_user_id, employee_ml_id, hr_candidate_id,
              work_date, status, notes,
              COALESCE(details, '{}'::jsonb) AS details, created_at, updated_at
       FROM hr_attendance_logs
       WHERE employer_user_id = $1
       ORDER BY work_date DESC
       LIMIT 1000`,
      [employerUserId],
    );
    return result.rows;
  },

  async listPerformanceReviews(employerUserId: string): Promise<HrPerformanceReviewRow[]> {
    const result = await getPool().query<HrPerformanceReviewRow>(
      `SELECT id, employer_user_id, employee_user_id, employee_ml_id, hr_candidate_id,
              period_label, period_from, period_to, rating, feedback, status,
              COALESCE(details, '{}'::jsonb) AS details, created_at, updated_at
       FROM hr_performance_reviews
       WHERE employer_user_id = $1
       ORDER BY created_at DESC
       LIMIT 500`,
      [employerUserId],
    );
    return result.rows;
  },

  async listIncidentReports(employerUserId: string): Promise<HrIncidentReportRow[]> {
    const result = await getPool().query<HrIncidentReportRow>(
      `SELECT id, employer_user_id, employee_user_id, employee_ml_id, hr_candidate_id,
              incident_date, incident_type, description, status,
              COALESCE(details, '{}'::jsonb) AS details, created_at, updated_at
       FROM hr_incident_reports
       WHERE employer_user_id = $1
       ORDER BY created_at DESC
       LIMIT 500`,
      [employerUserId],
    );
    return result.rows;
  },

  async listCompanyNotices(employerUserId: string): Promise<HrCompanyNoticeRow[]> {
    const result = await getPool().query<HrCompanyNoticeRow>(
      `SELECT id, employer_user_id, title, content, posted_at, expires_at,
              COALESCE(details, '{}'::jsonb) AS details, created_at, updated_at
       FROM hr_company_notices
       WHERE employer_user_id = $1
       ORDER BY posted_at DESC
       LIMIT 500`,
      [employerUserId],
    );
    return result.rows;
  },

  async createCompanyNotice(params: {
    employerUserId: string;
    title: string;
    content: string;
    expiresAt?: Date | null;
    details: Record<string, unknown>;
  }): Promise<HrCompanyNoticeRow> {
    const result = await getPool().query<HrCompanyNoticeRow>(
      `INSERT INTO hr_company_notices
         (employer_user_id, title, content, expires_at, details)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       RETURNING id, employer_user_id, title, content, posted_at, expires_at,
                 COALESCE(details, '{}'::jsonb) AS details, created_at, updated_at`,
      [
        params.employerUserId,
        params.title,
        params.content,
        params.expiresAt ?? null,
        JSON.stringify(params.details),
      ],
    );
    return result.rows[0];
  },

  async updateCompanyNotice(
    id: string,
    employerUserId: string,
    patch: { title?: string; content?: string; details?: Record<string, unknown> },
  ): Promise<HrCompanyNoticeRow | null> {
    const existing = await getPool().query<HrCompanyNoticeRow>(
      `SELECT id, employer_user_id, title, content, posted_at, expires_at,
              COALESCE(details, '{}'::jsonb) AS details, created_at, updated_at
       FROM hr_company_notices
       WHERE id = $1 AND employer_user_id = $2`,
      [id, employerUserId],
    );
    const row = existing.rows[0];
    if (!row) return null;

    const nextTitle = typeof patch.title === "string" ? patch.title.trim() : row.title;
    const nextContent = typeof patch.content === "string" ? patch.content : row.content;
    const nextDetails = { ...asDetails(row.details), ...(patch.details ?? {}) };

    const result = await getPool().query<HrCompanyNoticeRow>(
      `UPDATE hr_company_notices
       SET title = $3,
           content = $4,
           details = $5::jsonb,
           updated_at = now()
       WHERE id = $1 AND employer_user_id = $2
       RETURNING id, employer_user_id, title, content, posted_at, expires_at,
                 COALESCE(details, '{}'::jsonb) AS details, created_at, updated_at`,
      [id, employerUserId, nextTitle, nextContent, JSON.stringify(nextDetails)],
    );
    return result.rows[0] ?? null;
  },
};
