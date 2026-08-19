import { getPool } from "../../../db/pool.js";
import { withResilientTransaction } from "../../../db/resilient.js";
import { CAREER_POST_SELECT } from "../../career/postSelect.js";
import type {
  CareerPostRow,
  CareerApplicationRow,
  CareerOfferRow,
  CareerEmploymentRow,
} from "../../career/types.js";

export interface CreateEmploymentResult {
  employment: CareerEmploymentRow;
  wasCreated: boolean;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isCareerUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

export const employerCareerRepository = {
  async findPostById(postId: string): Promise<CareerPostRow | null> {
    const result = await getPool().query<CareerPostRow>(
      `SELECT ${CAREER_POST_SELECT}
       FROM career_posts
       WHERE id = $1 AND status != 'deleted'`,
      [postId],
    );
    return result.rows[0] ?? null;
  },

  async listPostsByEmployer(employerUserId: string): Promise<CareerPostRow[]> {
    const result = await getPool().query<CareerPostRow>(
      `SELECT ${CAREER_POST_SELECT}
       FROM career_posts
       WHERE employer_user_id = $1 AND status != 'deleted'
       ORDER BY updated_at DESC`,
      [employerUserId],
    );
    return result.rows;
  },

  async createPost(params: {
    employerUserId: string;
    title: string;
    description: string;
    location: string | null;
    locationPincode: string;
    status: string;
    details: Record<string, unknown>;
  }): Promise<CareerPostRow> {
    return withResilientTransaction(async (client) => {
      const result = await client.query<CareerPostRow>(
        `INSERT INTO career_posts
           (employer_user_id, title, description, location, location_pincode, status, details)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
         RETURNING ${CAREER_POST_SELECT}`,
        [
          params.employerUserId,
          params.title,
          params.description,
          params.location,
          params.locationPincode,
          params.status,
          JSON.stringify(params.details),
        ],
      );
      return result.rows[0];
    });
  },

  async updatePost(params: {
    postId: string;
    employerUserId: string;
    title: string;
    description: string;
    location: string | null;
    locationPincode: string;
    status: string;
    details: Record<string, unknown>;
  }): Promise<CareerPostRow | null> {
    return withResilientTransaction(async (client) => {
      const result = await client.query<CareerPostRow>(
        `UPDATE career_posts
         SET title = $3,
             description = $4,
             location = $5,
             location_pincode = $6,
             status = $7,
             details = $8::jsonb,
             updated_at = now()
         WHERE id = $1 AND employer_user_id = $2 AND status != 'deleted'
         RETURNING ${CAREER_POST_SELECT}`,
        [
          params.postId,
          params.employerUserId,
          params.title,
          params.description,
          params.location,
          params.locationPincode,
          params.status,
          JSON.stringify(params.details),
        ],
      );
      return result.rows[0] ?? null;
    });
  },

  async softDeletePost(postId: string, employerUserId: string): Promise<boolean> {
    return withResilientTransaction(async (client) => {
      const result = await client.query(
        `UPDATE career_posts
         SET status = 'deleted', updated_at = now()
         WHERE id = $1 AND employer_user_id = $2 AND status != 'deleted'`,
        [postId, employerUserId],
      );
      return (result.rowCount ?? 0) > 0;
    });
  },

  async findApplicationById(applicationId: string): Promise<CareerApplicationRow | null> {
    const result = await getPool().query<CareerApplicationRow>(
      `SELECT id, post_id, applicant_user_id, status, cover_note, applied_at, updated_at
       FROM career_applications
       WHERE id = $1`,
      [applicationId],
    );
    return result.rows[0] ?? null;
  },

  async listApplicationsByPostId(postId: string): Promise<CareerApplicationRow[]> {
    const result = await getPool().query<CareerApplicationRow>(
      `SELECT id, post_id, applicant_user_id, status, cover_note, applied_at, updated_at
       FROM career_applications
       WHERE post_id = $1
       ORDER BY applied_at DESC
       LIMIT 500`,
      [postId],
    );
    return result.rows;
  },

  async findApplicationByPostAndId(
    postId: string,
    applicationId: string,
  ): Promise<CareerApplicationRow | null> {
    const result = await getPool().query<CareerApplicationRow>(
      `SELECT id, post_id, applicant_user_id, status, cover_note, applied_at, updated_at
       FROM career_applications
       WHERE id = $1 AND post_id = $2`,
      [applicationId, postId],
    );
    return result.rows[0] ?? null;
  },

  async findOfferByApplicationId(applicationId: string): Promise<CareerOfferRow | null> {
    const result = await getPool().query<CareerOfferRow>(
      `SELECT id, application_id, employer_user_id, status, terms,
              offered_at, expires_at, accepted_at, declined_at, updated_at
       FROM career_offers
       WHERE application_id = $1`,
      [applicationId],
    );
    return result.rows[0] ?? null;
  },

  async findEmploymentByApplicationId(applicationId: string): Promise<CareerEmploymentRow | null> {
    const result = await getPool().query<CareerEmploymentRow>(
      `SELECT id, application_id, post_id, employee_user_id, employer_user_id,
              status, COALESCE(details, '{}'::jsonb) AS details,
              confirmed_at, created_at, updated_at
       FROM career_employments
       WHERE application_id = $1`,
      [applicationId],
    );
    return result.rows[0] ?? null;
  },

  async listEmploymentsByEmployer(employerUserId: string): Promise<CareerEmploymentRow[]> {
    const result = await getPool().query<CareerEmploymentRow>(
      `SELECT id, application_id, post_id, employee_user_id, employer_user_id,
              status, COALESCE(details, '{}'::jsonb) AS details,
              confirmed_at, created_at, updated_at
       FROM career_employments
       WHERE employer_user_id = $1
       ORDER BY confirmed_at DESC
       LIMIT 200`,
      [employerUserId],
    );
    return result.rows;
  },

  async updateEmploymentDetails(
    employmentId: string,
    employerUserId: string,
    patch: { status?: string; details?: Record<string, unknown> },
  ): Promise<CareerEmploymentRow | null> {
    return withResilientTransaction(async (client) => {
      const existing = await client.query<CareerEmploymentRow>(
        `SELECT id, application_id, post_id, employee_user_id, employer_user_id,
                status, COALESCE(details, '{}'::jsonb) AS details,
                confirmed_at, created_at, updated_at
         FROM career_employments
         WHERE id = $1 AND employer_user_id = $2
         FOR UPDATE`,
        [employmentId, employerUserId],
      );
      const row = existing.rows[0];
      if (!row) return null;

      const nextStatus = patch.status?.trim() || row.status;
      const nextDetails = {
        ...(typeof row.details === "object" && row.details && !Array.isArray(row.details)
          ? row.details
          : {}),
        ...(patch.details ?? {}),
      };

      const result = await client.query<CareerEmploymentRow>(
        `UPDATE career_employments
         SET status = $3,
             details = $4::jsonb,
             updated_at = now()
         WHERE id = $1 AND employer_user_id = $2
         RETURNING id, application_id, post_id, employee_user_id, employer_user_id,
                   status, COALESCE(details, '{}'::jsonb) AS details,
                   confirmed_at, created_at, updated_at`,
        [employmentId, employerUserId, nextStatus, JSON.stringify(nextDetails)],
      );
      return result.rows[0] ?? null;
    });
  },

  async createOffer(params: {
    applicationId: string;
    employerUserId: string;
    terms: Record<string, unknown>;
    expiresAt: Date | null;
  }): Promise<CareerOfferRow> {
    return withResilientTransaction(async (client) => {
      await client.query(`SELECT id FROM career_applications WHERE id = $1 FOR UPDATE`, [
        params.applicationId,
      ]);
      const result = await client.query<CareerOfferRow>(
        `INSERT INTO career_offers (application_id, employer_user_id, terms, expires_at)
         VALUES ($1, $2, $3, $4)
         RETURNING id, application_id, employer_user_id, status, terms,
                   offered_at, expires_at, accepted_at, declined_at, updated_at`,
        [
          params.applicationId,
          params.employerUserId,
          JSON.stringify(params.terms),
          params.expiresAt,
        ],
      );
      return result.rows[0];
    });
  },

  async updateApplicationStatus(applicationId: string, status: string): Promise<void> {
    await withResilientTransaction(async (client) => {
      await client.query(`SELECT id FROM career_applications WHERE id = $1 FOR UPDATE`, [
        applicationId,
      ]);
      await client.query(
        `UPDATE career_applications SET status = $2, updated_at = now() WHERE id = $1`,
        [applicationId, status],
      );
    });
  },

  async logLifecycleEvent(params: {
    applicationId: string;
    actorUserId: string;
    actorRole: string;
    eventType: string;
    previousStatus: string | null;
    newStatus: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await withResilientTransaction(async (client) => {
      await client.query(
        `INSERT INTO career_lifecycle_events
           (application_id, actor_user_id, actor_role, event_type, previous_status, new_status, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          params.applicationId,
          params.actorUserId,
          params.actorRole,
          params.eventType,
          params.previousStatus ?? null,
          params.newStatus ?? null,
          JSON.stringify(params.metadata ?? {}),
        ],
      );
    });
  },

  /**
   * Atomically confirms the hire.
   *
   * Uses SELECT FOR UPDATE on the application to serialise concurrent calls.
   * Uses ON CONFLICT DO NOTHING on career_employments for idempotency.
   *
   * Returns the employment record (existing or newly created) and whether
   * this call actually created it (wasCreated = false means it already existed).
   */
  async confirmHireTransaction(params: {
    applicationId: string;
    postId: string;
    employeeUserId: string;
    employerUserId: string;
    details?: Record<string, unknown>;
  }): Promise<CreateEmploymentResult> {
    const outcome = await withResilientTransaction(async (client) => {
      // Lock the application row to serialise concurrent confirm-hire calls
      const lockResult = await client.query<{ status: string }>(
        `SELECT status FROM career_applications WHERE id = $1 FOR UPDATE`,
        [params.applicationId],
      );

      const currentStatus = lockResult.rows[0]?.status;

      if (currentStatus === "hired") {
        return { kind: "already" as const };
      }

      if (currentStatus !== "offer_accepted") {
        throw Object.assign(
          new Error(
            `Cannot confirm hire — application must be 'offer_accepted', current: '${currentStatus}'`,
          ),
          { code: "INVALID_STATE", httpStatus: 409 },
        );
      }

      await client.query(
        `UPDATE career_applications SET status = 'hired', updated_at = now() WHERE id = $1`,
        [params.applicationId],
      );

      const insertResult = await client.query<{ id: string }>(
        `INSERT INTO career_employments
           (application_id, post_id, employee_user_id, employer_user_id, details)
         VALUES ($1, $2, $3, $4, $5::jsonb)
         ON CONFLICT (application_id) DO NOTHING
         RETURNING id`,
        [
          params.applicationId,
          params.postId,
          params.employeeUserId,
          params.employerUserId,
          JSON.stringify(params.details ?? {}),
        ],
      );
      const wasCreated = insertResult.rowCount !== null && insertResult.rowCount > 0;

      if (!wasCreated && params.details) {
        await client.query(
          `UPDATE career_employments
           SET details = COALESCE(details, '{}'::jsonb) || $2::jsonb,
               updated_at = now()
           WHERE application_id = $1`,
          [params.applicationId, JSON.stringify(params.details)],
        );
      }

      await client.query(
        `INSERT INTO career_lifecycle_events
           (application_id, actor_user_id, actor_role, event_type, previous_status, new_status)
         VALUES ($1, $2, 'employer', 'hire_confirmed', 'offer_accepted', 'hired')`,
        [params.applicationId, params.employerUserId],
      );

      return { kind: "done" as const, wasCreated };
    });

    const employment = await this.findEmploymentByApplicationId(params.applicationId);
    return {
      employment: employment!,
      wasCreated: outcome.kind === "done" ? outcome.wasCreated : false,
    };
  },
};
