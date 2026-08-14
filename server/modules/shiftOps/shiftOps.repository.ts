import { createHash } from "node:crypto";
import { getPool } from "../../db/pool.js";

export function hashQrToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export type AttendanceRow = {
  id: string;
  workspace_id: string;
  worker_user_id: string;
  checked_in_at: Date;
  checked_out_at: Date | null;
};

export const shiftOpsRepository = {
  async findWorkspaceWithPost(workspaceId: string): Promise<{
    id: string;
    post_id: string;
    app_id: string;
    worker_wm_id: string;
    status: string;
    employer_id: string;
  } | null> {
    const result = await getPool().query(
      `SELECT w.id, w.post_id, w.app_id, w.worker_wm_id, w.status, p.employer_id
       FROM shift_workspaces w
       JOIN shift_posts p ON p.id = w.post_id
       WHERE w.id = $1`,
      [workspaceId],
    );
    return result.rows[0] ?? null;
  },

  async upsertQrHash(workspaceId: string, tokenHash: string, issuedBy: string): Promise<void> {
    await getPool().query(
      `INSERT INTO shift_workspace_qr (workspace_id, token_hash, issued_by, issued_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (workspace_id)
       DO UPDATE SET token_hash = EXCLUDED.token_hash,
                     issued_by = EXCLUDED.issued_by,
                     issued_at = now()`,
      [workspaceId, tokenHash, issuedBy],
    );
  },

  async findQrHash(workspaceId: string): Promise<string | null> {
    const result = await getPool().query<{ token_hash: string }>(
      `SELECT token_hash FROM shift_workspace_qr WHERE workspace_id = $1`,
      [workspaceId],
    );
    return result.rows[0]?.token_hash ?? null;
  },

  async findOpenAttendance(workspaceId: string): Promise<AttendanceRow | null> {
    const result = await getPool().query<AttendanceRow>(
      `SELECT id, workspace_id, worker_user_id, checked_in_at, checked_out_at
       FROM shift_attendance
       WHERE workspace_id = $1 AND checked_out_at IS NULL
       LIMIT 1`,
      [workspaceId],
    );
    return result.rows[0] ?? null;
  },

  async insertCheckIn(workspaceId: string, workerUserId: string): Promise<AttendanceRow> {
    const result = await getPool().query<AttendanceRow>(
      `INSERT INTO shift_attendance (workspace_id, worker_user_id)
       VALUES ($1, $2)
       RETURNING id, workspace_id, worker_user_id, checked_in_at, checked_out_at`,
      [workspaceId, workerUserId],
    );
    return result.rows[0];
  },

  async checkOut(attendanceId: string, workerUserId: string): Promise<AttendanceRow | null> {
    const result = await getPool().query<AttendanceRow>(
      `UPDATE shift_attendance
       SET checked_out_at = now(), updated_at = now()
       WHERE id = $1 AND worker_user_id = $2 AND checked_out_at IS NULL
       RETURNING id, workspace_id, worker_user_id, checked_in_at, checked_out_at`,
      [attendanceId, workerUserId],
    );
    return result.rows[0] ?? null;
  },

  async listAttendance(workspaceId: string): Promise<AttendanceRow[]> {
    const result = await getPool().query<AttendanceRow>(
      `SELECT id, workspace_id, worker_user_id, checked_in_at, checked_out_at
       FROM shift_attendance
       WHERE workspace_id = $1
       ORDER BY checked_in_at DESC`,
      [workspaceId],
    );
    return result.rows;
  },

  async insertReview(params: {
    workspaceId: string | null;
    employmentId: string | null;
    reviewerUserId: string;
    revieweeUserId: string;
    direction: "employer_to_employee" | "employee_to_employer";
    rating: number;
    body: string;
  }): Promise<{ id: string }> {
    const result = await getPool().query<{ id: string }>(
      `INSERT INTO work_reviews
         (workspace_id, employment_id, reviewer_user_id, reviewee_user_id, direction, rating, body)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        params.workspaceId,
        params.employmentId,
        params.reviewerUserId,
        params.revieweeUserId,
        params.direction,
        params.rating,
        params.body,
      ],
    );
    return result.rows[0];
  },

  async findEmployment(employmentId: string): Promise<{
    id: string;
    employee_user_id: string;
    employer_user_id: string;
    status: string;
  } | null> {
    const result = await getPool().query(
      `SELECT id, employee_user_id, employer_user_id, status
       FROM career_employments WHERE id = $1`,
      [employmentId],
    );
    return result.rows[0] ?? null;
  },

  async insertExit(params: {
    employmentId: string;
    initiatedBy: string;
    kind: "resign" | "offboard";
    details: Record<string, unknown>;
  }): Promise<{ id: string }> {
    const result = await getPool().query<{ id: string }>(
      `INSERT INTO employment_exits (employment_id, initiated_by_user_id, kind, status, details)
       VALUES ($1, $2, $3, 'completed', $4::jsonb)
       RETURNING id`,
      [params.employmentId, params.initiatedBy, params.kind, JSON.stringify(params.details)],
    );
    return result.rows[0];
  },
};
