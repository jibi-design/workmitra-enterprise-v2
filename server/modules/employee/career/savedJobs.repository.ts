import { getPool } from "../../../db/pool.js";
import { isCareerUuid } from "./career.repository.js";

export type CareerSavedJobRow = {
  id: string;
  employee_user_id: string;
  post_id: string;
  saved_at: string;
};

function mapRow(row: Record<string, unknown>): CareerSavedJobRow {
  const savedAt = row.saved_at;
  return {
    id: String(row.id),
    employee_user_id: String(row.employee_user_id),
    post_id: String(row.post_id),
    saved_at: savedAt instanceof Date ? savedAt.toISOString() : String(savedAt ?? ""),
  };
}

export const careerSavedJobsRepository = {
  async listByEmployee(employeeUserId: string): Promise<CareerSavedJobRow[]> {
    const result = await getPool().query<CareerSavedJobRow>(
      `SELECT id, employee_user_id, post_id, saved_at
       FROM career_saved_jobs
       WHERE employee_user_id = $1
       ORDER BY saved_at DESC
       LIMIT 50`,
      [employeeUserId],
    );
    return result.rows.map((row) => mapRow(row as Record<string, unknown>));
  },

  async insert(employeeUserId: string, postId: string): Promise<CareerSavedJobRow> {
    const inserted = await getPool().query<CareerSavedJobRow>(
      `INSERT INTO career_saved_jobs (employee_user_id, post_id)
       VALUES ($1, $2)
       ON CONFLICT (employee_user_id, post_id) DO NOTHING
       RETURNING id, employee_user_id, post_id, saved_at`,
      [employeeUserId, postId],
    );
    if (inserted.rows[0]) return mapRow(inserted.rows[0] as Record<string, unknown>);

    const existing = await getPool().query<CareerSavedJobRow>(
      `SELECT id, employee_user_id, post_id, saved_at
       FROM career_saved_jobs
       WHERE employee_user_id = $1 AND post_id = $2`,
      [employeeUserId, postId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new Error("career_saved_jobs insert conflict without existing row");
    }
    return mapRow(row as Record<string, unknown>);
  },

  async delete(employeeUserId: string, postId: string): Promise<boolean> {
    const result = await getPool().query(
      `DELETE FROM career_saved_jobs
       WHERE employee_user_id = $1 AND post_id = $2`,
      [employeeUserId, postId],
    );
    return (result.rowCount ?? 0) > 0;
  },

  async postExists(postId: string): Promise<boolean> {
    if (!isCareerUuid(postId)) return false;
    const result = await getPool().query(
      `SELECT 1 FROM career_posts WHERE id = $1 AND status <> 'deleted' LIMIT 1`,
      [postId],
    );
    return result.rows.length > 0;
  },
};
