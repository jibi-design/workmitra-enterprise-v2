import type { PoolClient } from "pg";
import { getPool } from "../../../db/pool.js";
import type {
  ShiftApplicationRow,
  ShiftEventRow,
  ShiftPostRow,
  ShiftWorkspaceRow,
} from "../../shift/types.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isShiftUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

const POST_SELECT = `id, employer_id, job_name, category, status, vacancies,
              start_at, end_at, COALESCE(details, '{}'::jsonb) AS details,
              created_at, updated_at`;

const APP_SELECT = `id, post_id, worker_wm_id, status,
              COALESCE(details, '{}'::jsonb) AS details, created_at, updated_at`;

export const employerShiftRepository = {
  async findPostById(postId: string): Promise<ShiftPostRow | null> {
    const result = await getPool().query<ShiftPostRow>(
      `SELECT ${POST_SELECT}
       FROM shift_posts
       WHERE id = $1`,
      [postId],
    );
    return result.rows[0] ?? null;
  },

  async listPostsByEmployer(employerId: string): Promise<ShiftPostRow[]> {
    const result = await getPool().query<ShiftPostRow>(
      `SELECT ${POST_SELECT}
       FROM shift_posts
       WHERE employer_id = $1
       ORDER BY updated_at DESC`,
      [employerId],
    );
    return result.rows;
  },

  async createPost(params: {
    employerId: string;
    jobName: string;
    category: string;
    status: string;
    vacancies: number;
    startAt: Date;
    endAt: Date;
    details: Record<string, unknown>;
  }): Promise<ShiftPostRow> {
    const result = await getPool().query<ShiftPostRow>(
      `INSERT INTO shift_posts
         (employer_id, job_name, category, status, vacancies, start_at, end_at, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
       RETURNING ${POST_SELECT}`,
      [
        params.employerId,
        params.jobName,
        params.category,
        params.status,
        params.vacancies,
        params.startAt,
        params.endAt,
        JSON.stringify(params.details),
      ],
    );
    return result.rows[0];
  },

  async findApplicationById(appId: string): Promise<ShiftApplicationRow | null> {
    const result = await getPool().query<ShiftApplicationRow>(
      `SELECT ${APP_SELECT}
       FROM shift_applications
       WHERE id = $1`,
      [appId],
    );
    return result.rows[0] ?? null;
  },

  async findApplicationByPostAndWorker(
    postId: string,
    workerWmId: string,
  ): Promise<ShiftApplicationRow | null> {
    const result = await getPool().query<ShiftApplicationRow>(
      `SELECT ${APP_SELECT}
       FROM shift_applications
       WHERE post_id = $1 AND upper(worker_wm_id) = upper($2)`,
      [postId, workerWmId],
    );
    return result.rows[0] ?? null;
  },

  async listApplicationsByWorker(workerWmId: string): Promise<ShiftApplicationRow[]> {
    const result = await getPool().query<ShiftApplicationRow>(
      `SELECT ${APP_SELECT}
       FROM shift_applications
       WHERE upper(worker_wm_id) = upper($1)
       ORDER BY updated_at DESC`,
      [workerWmId],
    );
    return result.rows;
  },

  async createApplication(params: {
    postId: string;
    workerWmId: string;
    details: Record<string, unknown>;
  }): Promise<ShiftApplicationRow> {
    const result = await getPool().query<ShiftApplicationRow>(
      `INSERT INTO shift_applications (post_id, worker_wm_id, status, details)
       VALUES ($1, $2, 'applied', $3::jsonb)
       RETURNING ${APP_SELECT}`,
      [params.postId, params.workerWmId, JSON.stringify(params.details)],
    );
    return result.rows[0];
  },

  async countConfirmedForPost(postId: string): Promise<number> {
    const result = await getPool().query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM shift_applications
       WHERE post_id = $1 AND status = 'confirmed'`,
      [postId],
    );
    return Number(result.rows[0]?.count ?? 0);
  },

  async withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async updateApplicationStatusTx(
    client: PoolClient,
    appId: string,
    status: string,
  ): Promise<ShiftApplicationRow | null> {
    const result = await client.query<ShiftApplicationRow>(
      `UPDATE shift_applications
       SET status = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING ${APP_SELECT}`,
      [appId, status],
    );
    return result.rows[0] ?? null;
  },

  async createWorkspaceTx(
    client: PoolClient,
    params: { postId: string; appId: string; workerWmId: string },
  ): Promise<ShiftWorkspaceRow> {
    const result = await client.query<ShiftWorkspaceRow>(
      `INSERT INTO shift_workspaces (post_id, app_id, worker_wm_id, status)
       VALUES ($1, $2, $3, 'active')
       ON CONFLICT (post_id, worker_wm_id) DO UPDATE
         SET app_id = EXCLUDED.app_id,
             status = 'active',
             updated_at = NOW()
       RETURNING id, post_id, app_id, worker_wm_id, status, created_at, updated_at`,
      [params.postId, params.appId, params.workerWmId],
    );
    return result.rows[0];
  },

  async findWorkspaceByPostAndApp(
    postId: string,
    appId: string,
  ): Promise<ShiftWorkspaceRow | null> {
    const result = await getPool().query<ShiftWorkspaceRow>(
      `SELECT id, post_id, app_id, worker_wm_id, status, created_at, updated_at
       FROM shift_workspaces
       WHERE post_id = $1 AND app_id = $2`,
      [postId, appId],
    );
    return result.rows[0] ?? null;
  },

  async updatePost(params: {
    postId: string;
    employerId: string;
    jobName: string;
    category: string;
    status: string;
    vacancies: number;
    startAt: Date;
    endAt: Date;
    details: Record<string, unknown>;
  }): Promise<ShiftPostRow | null> {
    const result = await getPool().query<ShiftPostRow>(
      `UPDATE shift_posts
       SET job_name = $3,
           category = $4,
           status = $5,
           vacancies = $6,
           start_at = $7,
           end_at = $8,
           details = $9::jsonb,
           updated_at = NOW()
       WHERE id = $1 AND employer_id = $2
       RETURNING ${POST_SELECT}`,
      [
        params.postId,
        params.employerId,
        params.jobName,
        params.category,
        params.status,
        params.vacancies,
        params.startAt,
        params.endAt,
        JSON.stringify(params.details),
      ],
    );
    return result.rows[0] ?? null;
  },

  async cancelPost(postId: string, employerId: string): Promise<ShiftPostRow | null> {
    const result = await getPool().query<ShiftPostRow>(
      `UPDATE shift_posts
       SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1 AND employer_id = $2 AND status != 'cancelled'
       RETURNING ${POST_SELECT}`,
      [postId, employerId],
    );
    return result.rows[0] ?? null;
  },

  async deletePostIfNoApplications(
    postId: string,
    employerId: string,
  ): Promise<"deleted" | "cancelled" | "not_found" | "forbidden"> {
    const post = await this.findPostById(postId);
    if (!post) return "not_found";
    if (post.employer_id !== employerId) return "forbidden";

    const countResult = await getPool().query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM shift_applications WHERE post_id = $1`,
      [postId],
    );
    const appCount = Number(countResult.rows[0]?.count ?? 0);
    if (appCount > 0) {
      const cancelled = await this.cancelPost(postId, employerId);
      return cancelled ? "cancelled" : "not_found";
    }

    await getPool().query(`DELETE FROM shift_posts WHERE id = $1 AND employer_id = $2`, [
      postId,
      employerId,
    ]);
    return "deleted";
  },

  async insertEventTx(
    client: PoolClient,
    params: {
      postId: string;
      kind: string;
      actorId: string | null;
      meta?: Record<string, unknown>;
    },
  ): Promise<ShiftEventRow> {
    const result = await client.query<ShiftEventRow>(
      `INSERT INTO shift_events (post_id, kind, actor_id, meta)
       VALUES ($1, $2, $3, $4::jsonb)
       RETURNING id, post_id, kind, actor_id, meta, created_at`,
      [params.postId, params.kind, params.actorId, JSON.stringify(params.meta ?? {})],
    );
    return result.rows[0];
  },
};
