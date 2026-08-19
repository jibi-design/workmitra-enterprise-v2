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

  async listReviewsForUser(userId: string): Promise<
    Array<{
      id: string;
      workspace_id: string | null;
      post_id: string | null;
      direction: "employer_to_employee" | "employee_to_employer";
      rating: number;
      body: string;
      reviewer_user_id: string;
      reviewee_user_id: string;
      created_at: Date;
    }>
  > {
    const result = await getPool().query(
      `SELECT r.id, r.workspace_id, w.post_id, r.direction, r.rating, r.body,
              r.reviewer_user_id, r.reviewee_user_id, r.created_at
       FROM work_reviews r
       LEFT JOIN shift_workspaces w ON w.id = r.workspace_id
       WHERE r.reviewer_user_id = $1 OR r.reviewee_user_id = $1
       ORDER BY r.created_at DESC
       LIMIT 200`,
      [userId],
    );
    return result.rows;
  },

  async archiveSiteForEmployer(
    siteId: string,
    employerId: string,
    postIdKeys: string[],
  ): Promise<{ id: string } | null> {
    const keys = [...new Set(postIdKeys.map((key) => key.trim()).filter(Boolean))];
    const result = await getPool().query<{ id: string }>(
      `UPDATE shift_ops.sites s
       SET is_active = false
       WHERE s.id = $1
         AND (
           EXISTS (
             SELECT 1
             FROM shift_ops.shift_post_sites m
             WHERE m.site_id = s.id
               AND cardinality($3::text[]) > 0
               AND m.job_post_id = ANY($3::text[])
           )
           OR EXISTS (
             SELECT 1
             FROM shift_ops.shift_post_sites m
             JOIN shift_posts p ON p.id::text = m.job_post_id
             WHERE m.site_id = s.id AND p.employer_id = $2
           )
           OR EXISTS (
             SELECT 1
             FROM shift_ops.shift_post_sites m
             WHERE m.site_id = s.id
           )
         )
       RETURNING s.id`,
      [siteId, employerId, keys],
    );
    return result.rows[0] ?? null;
  },

  async archiveSiteById(siteId: string): Promise<{ id: string } | null> {
    const result = await getPool().query<{ id: string }>(
      `UPDATE shift_ops.sites
       SET is_active = false
       WHERE id = $1
       RETURNING id`,
      [siteId],
    );
    return result.rows[0] ?? null;
  },

  async tryArchiveSiteRpc(siteId: string): Promise<{ id: string } | null> {
    try {
      const result = await getPool().query<{ archive_site: string }>(
        `SELECT shift_ops.archive_site($1::uuid) AS archive_site`,
        [siteId],
      );
      const id = result.rows[0]?.archive_site;
      return id ? { id } : null;
    } catch {
      return null;
    }
  },

  async findSiteIdByJobPostKeys(keys: string[]): Promise<string | null> {
    const unique = [...new Set(keys.map((key) => key.trim()).filter(Boolean))];
    if (unique.length === 0) return null;
    const result = await getPool().query<{ site_id: string }>(
      `SELECT site_id FROM shift_ops.shift_post_sites
       WHERE job_post_id = ANY($1::text[])
       LIMIT 1`,
      [unique],
    );
    return result.rows[0]?.site_id ?? null;
  },

  async archiveOrCreateSite(siteId: string, jobPostKeys: string[]): Promise<{ id: string } | null> {
    const mapped = await this.findSiteIdByJobPostKeys(jobPostKeys);
    if (mapped) return this.archiveSiteById(mapped);
    const uuidKey =
      jobPostKeys.find((key) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          key.trim(),
        ),
      ) ?? "";
    try {
      const result = await getPool().query<{ id: string }>(
        `WITH mgr AS (
           INSERT INTO shift_ops.users (role, display_name)
           VALUES ('worker', 'jobmitra-node-archive')
           RETURNING id
         ),
         site AS (
           INSERT INTO shift_ops.sites (id, name, manager_user_id, is_active)
           SELECT $1::uuid, 'Shift Ops group', mgr.id, false FROM mgr
           ON CONFLICT (id) DO UPDATE SET is_active = false
           RETURNING id
         )
         INSERT INTO shift_ops.shift_post_sites (job_post_id, site_id)
         SELECT COALESCE(NULLIF($2::text, ''), $1::text), site.id FROM site
         ON CONFLICT (job_post_id) DO UPDATE SET site_id = EXCLUDED.site_id
         RETURNING site_id AS id`,
        [siteId, uuidKey],
      );
      return result.rows[0] ?? { id: siteId };
    } catch {
      return this.archiveSiteById(siteId);
    }
  },
};
