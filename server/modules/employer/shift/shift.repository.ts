import type { PoolClient } from "pg";
import { getPool } from "../../../db/pool.js";
import { withResilientTransaction } from "../../../db/resilient.js";
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
              location_pincode, created_at, updated_at`;

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
    locationPincode: string;
  }): Promise<ShiftPostRow> {
    const result = await getPool().query<ShiftPostRow>(
      `INSERT INTO shift_posts
         (employer_id, job_name, category, status, vacancies, start_at, end_at, details, location_pincode)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)
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
        params.locationPincode,
      ],
    );
    return result.rows[0];
  },

  async listApplicationsByPostId(postId: string): Promise<ShiftApplicationRow[]> {
    const result = await getPool().query<ShiftApplicationRow>(
      `SELECT ${APP_SELECT}
       FROM shift_applications
       WHERE post_id = $1
       ORDER BY updated_at DESC`,
      [postId],
    );
    return result.rows;
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

  /** Wave-1: lock post row so vacancy checks and confirms cannot TOCTOU. */
  async lockPostForUpdateTx(client: PoolClient, postId: string): Promise<ShiftPostRow | null> {
    const result = await client.query<ShiftPostRow>(
      `SELECT ${POST_SELECT}
       FROM shift_posts
       WHERE id = $1
       FOR UPDATE`,
      [postId],
    );
    return result.rows[0] ?? null;
  },

  async countConfirmedForPostTx(client: PoolClient, postId: string): Promise<number> {
    const result = await client.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM shift_applications
       WHERE post_id = $1 AND status = 'confirmed'`,
      [postId],
    );
    return Number(result.rows[0]?.count ?? 0);
  },

  async findApplicationByIdTx(
    client: PoolClient,
    appId: string,
  ): Promise<ShiftApplicationRow | null> {
    const result = await client.query<ShiftApplicationRow>(
      `SELECT ${APP_SELECT}
       FROM shift_applications
       WHERE id = $1
       FOR UPDATE`,
      [appId],
    );
    return result.rows[0] ?? null;
  },

  async findApplicationByPostAndWorkerTx(
    client: PoolClient,
    postId: string,
    workerWmId: string,
  ): Promise<ShiftApplicationRow | null> {
    const result = await client.query<ShiftApplicationRow>(
      `SELECT ${APP_SELECT}
       FROM shift_applications
       WHERE post_id = $1 AND upper(worker_wm_id) = upper($2)
       FOR UPDATE`,
      [postId, workerWmId],
    );
    return result.rows[0] ?? null;
  },

  async createApplicationTx(
    client: PoolClient,
    params: {
      postId: string;
      workerWmId: string;
      details: Record<string, unknown>;
    },
  ): Promise<ShiftApplicationRow> {
    const result = await client.query<ShiftApplicationRow>(
      `INSERT INTO shift_applications (post_id, worker_wm_id, status, details)
       VALUES ($1, $2, 'applied', $3::jsonb)
       RETURNING ${APP_SELECT}`,
      [params.postId, params.workerWmId, JSON.stringify(params.details)],
    );
    return result.rows[0];
  },

  async withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    // Layer 5: lock/statement timeouts + deadlock retry (vacancy CAS safe)
    return withResilientTransaction(fn, { retryOnDeadlock: true });
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

  /**
   * Wave-1 CAS: only flip to target status when current status is confirmable.
   * Prevents double-confirm races under concurrent writers.
   */
  async updateApplicationStatusIfConfirmableTx(
    client: PoolClient,
    appId: string,
    status: string,
    allowedFrom: readonly string[],
  ): Promise<ShiftApplicationRow | null> {
    const result = await client.query<ShiftApplicationRow>(
      `UPDATE shift_applications
       SET status = $2, updated_at = NOW()
       WHERE id = $1 AND status = ANY($3::text[])
       RETURNING ${APP_SELECT}`,
      [appId, status, [...allowedFrom]],
    );
    return result.rows[0] ?? null;
  },

  async createWorkspaceTx(
    client: PoolClient,
    params: { postId: string; appId: string; workerWmId: string },
  ): Promise<ShiftWorkspaceRow> {
    // Wave-5: never remap app_id on conflict — prevents workspace hijack across workers/apps
    const inserted = await client.query<ShiftWorkspaceRow>(
      `INSERT INTO shift_workspaces (post_id, app_id, worker_wm_id, status)
       VALUES ($1, $2, $3, 'active')
       ON CONFLICT (post_id, worker_wm_id) DO NOTHING
       RETURNING id, post_id, app_id, worker_wm_id, status, created_at, updated_at`,
      [params.postId, params.appId, params.workerWmId],
    );
    if (inserted.rows[0]) return inserted.rows[0];

    const existing = await client.query<ShiftWorkspaceRow>(
      `SELECT id, post_id, app_id, worker_wm_id, status, created_at, updated_at
       FROM shift_workspaces
       WHERE post_id = $1 AND upper(worker_wm_id) = upper($2)
       FOR UPDATE`,
      [params.postId, params.workerWmId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw Object.assign(new Error("Workspace conflict — insert failed"), {
        code: "WORKSPACE_CONFLICT",
        httpStatus: 409,
      });
    }
    if (row.app_id !== params.appId) {
      throw Object.assign(
        new Error("Workspace already bound to a different application for this worker"),
        { code: "WORKSPACE_APP_MISMATCH", httpStatus: 409 },
      );
    }
    if (row.status !== "active") {
      const reactivated = await client.query<ShiftWorkspaceRow>(
        `UPDATE shift_workspaces
         SET status = 'active', updated_at = NOW()
         WHERE id = $1 AND app_id = $2
         RETURNING id, post_id, app_id, worker_wm_id, status, created_at, updated_at`,
        [row.id, params.appId],
      );
      if (reactivated.rows[0]) return reactivated.rows[0];
    }
    return row;
  },

  async findWorkspaceById(workspaceId: string): Promise<ShiftWorkspaceRow | null> {
    const result = await getPool().query<ShiftWorkspaceRow>(
      `SELECT id, post_id, app_id, worker_wm_id, status, created_at, updated_at
       FROM shift_workspaces
       WHERE id = $1`,
      [workspaceId],
    );
    return result.rows[0] ?? null;
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

  async listWorkspacesByPost(postId: string): Promise<ShiftWorkspaceRow[]> {
    const result = await getPool().query<ShiftWorkspaceRow>(
      `SELECT id, post_id, app_id, worker_wm_id, status, created_at, updated_at
       FROM shift_workspaces
       WHERE post_id = $1`,
      [postId],
    );
    return result.rows;
  },

  async completeWorkspaceForEmployer(
    workspaceId: string,
    employerId: string,
  ): Promise<ShiftWorkspaceRow | null> {
    const result = await getPool().query<ShiftWorkspaceRow>(
      `UPDATE shift_workspaces w
       SET status = 'completed', updated_at = NOW()
       FROM shift_posts p
       WHERE w.id = $1 AND w.post_id = p.id AND p.employer_id = $2
       RETURNING w.id, w.post_id, w.app_id, w.worker_wm_id, w.status, w.created_at, w.updated_at`,
      [workspaceId, employerId],
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
    locationPincode: string;
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
           location_pincode = $10,
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
        params.locationPincode,
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
