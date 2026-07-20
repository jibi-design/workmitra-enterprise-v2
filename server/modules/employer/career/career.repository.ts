import { getPool } from "../../../db/pool.js";
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

export const employerCareerRepository = {
  async findPostById(postId: string): Promise<CareerPostRow | null> {
    const result = await getPool().query<CareerPostRow>(
      `SELECT id, employer_user_id, title, description, location, status, created_at, updated_at
       FROM career_posts
       WHERE id = $1 AND status != 'deleted'`,
      [postId],
    );
    return result.rows[0] ?? null;
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
              status, confirmed_at, created_at, updated_at
       FROM career_employments
       WHERE application_id = $1`,
      [applicationId],
    );
    return result.rows[0] ?? null;
  },

  async createOffer(params: {
    applicationId: string;
    employerUserId: string;
    terms: Record<string, unknown>;
    expiresAt: Date | null;
  }): Promise<CareerOfferRow> {
    const result = await getPool().query<CareerOfferRow>(
      `INSERT INTO career_offers (application_id, employer_user_id, terms, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id, application_id, employer_user_id, status, terms,
                 offered_at, expires_at, accepted_at, declined_at, updated_at`,
      [params.applicationId, params.employerUserId, JSON.stringify(params.terms), params.expiresAt],
    );
    return result.rows[0];
  },

  async updateApplicationStatus(applicationId: string, status: string): Promise<void> {
    await getPool().query(
      `UPDATE career_applications SET status = $2, updated_at = now() WHERE id = $1`,
      [applicationId, status],
    );
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
    await getPool().query(
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
  }): Promise<CreateEmploymentResult> {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");

      // Lock the application row to serialise concurrent confirm-hire calls
      const lockResult = await client.query<{ status: string }>(
        `SELECT status FROM career_applications WHERE id = $1 FOR UPDATE`,
        [params.applicationId],
      );

      const currentStatus = lockResult.rows[0]?.status;

      // If already hired (concurrent request won the race), just return existing
      if (currentStatus === "hired") {
        await client.query("COMMIT");
        const existing = await this.findEmploymentByApplicationId(params.applicationId);
        return { employment: existing!, wasCreated: false };
      }

      // Gate enforcement inside the transaction — status must be offer_accepted
      if (currentStatus !== "offer_accepted") {
        await client.query("ROLLBACK");
        throw Object.assign(
          new Error(
            `Cannot confirm hire — application must be 'offer_accepted', current: '${currentStatus}'`,
          ),
          { code: "INVALID_STATE", httpStatus: 409 },
        );
      }

      // Step A: update application to hired
      await client.query(
        `UPDATE career_applications SET status = 'hired', updated_at = now() WHERE id = $1`,
        [params.applicationId],
      );

      // Step B: insert employment — ON CONFLICT DO NOTHING for idempotency
      const insertResult = await client.query<{ id: string }>(
        `INSERT INTO career_employments
           (application_id, post_id, employee_user_id, employer_user_id)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (application_id) DO NOTHING
         RETURNING id`,
        [params.applicationId, params.postId, params.employeeUserId, params.employerUserId],
      );
      const wasCreated = insertResult.rowCount !== null && insertResult.rowCount > 0;

      // Step C: log lifecycle event
      await client.query(
        `INSERT INTO career_lifecycle_events
           (application_id, actor_user_id, actor_role, event_type, previous_status, new_status)
         VALUES ($1, $2, 'employer', 'hire_confirmed', 'offer_accepted', 'hired')`,
        [params.applicationId, params.employerUserId],
      );

      await client.query("COMMIT");

      // Fetch the employment record (works whether just created or already existed)
      const employment = await this.findEmploymentByApplicationId(params.applicationId);
      return { employment: employment!, wasCreated };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
};
