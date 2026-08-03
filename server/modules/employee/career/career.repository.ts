import { getPool } from "../../../db/pool.js";
import { withResilientTransaction } from "../../../db/resilient.js";
import type {
  CareerApplicationRow,
  CareerEmploymentRow,
  CareerOfferRow,
  CareerPostRow,
} from "../../career/types.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isCareerUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

export const employeeCareerRepository = {
  async findPublishedPostById(postId: string): Promise<CareerPostRow | null> {
    const result = await getPool().query<CareerPostRow>(
      `SELECT id, employer_user_id, title, description, location, status,
              COALESCE(details, '{}'::jsonb) AS details, created_at, updated_at
       FROM career_posts
       WHERE id = $1 AND status = 'published'`,
      [postId],
    );
    return result.rows[0] ?? null;
  },

  async listPublishedPosts(): Promise<CareerPostRow[]> {
    const result = await getPool().query<CareerPostRow>(
      `SELECT id, employer_user_id, title, description, location, status,
              COALESCE(details, '{}'::jsonb) AS details, created_at, updated_at
       FROM career_posts
       WHERE status = 'published'
       ORDER BY updated_at DESC
       LIMIT 200`,
    );
    return result.rows;
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

  async findApplicationByPostAndApplicant(
    postId: string,
    applicantUserId: string,
  ): Promise<CareerApplicationRow | null> {
    const result = await getPool().query<CareerApplicationRow>(
      `SELECT id, post_id, applicant_user_id, status, cover_note, applied_at, updated_at
       FROM career_applications
       WHERE post_id = $1 AND applicant_user_id = $2`,
      [postId, applicantUserId],
    );
    return result.rows[0] ?? null;
  },

  async listApplicationsByApplicant(applicantUserId: string): Promise<CareerApplicationRow[]> {
    const result = await getPool().query<CareerApplicationRow>(
      `SELECT id, post_id, applicant_user_id, status, cover_note, applied_at, updated_at
       FROM career_applications
       WHERE applicant_user_id = $1
       ORDER BY applied_at DESC`,
      [applicantUserId],
    );
    return result.rows;
  },

  async createApplication(params: {
    postId: string;
    applicantUserId: string;
    coverNote: string | null;
  }): Promise<CareerApplicationRow> {
    return withResilientTransaction(async (client) => {
      await client.query(
        `SELECT id FROM career_posts WHERE id = $1 AND status = 'published' FOR UPDATE`,
        [params.postId],
      );
      const result = await client.query<CareerApplicationRow>(
        `INSERT INTO career_applications (post_id, applicant_user_id, status, cover_note)
         VALUES ($1, $2, 'pending', $3)
         RETURNING id, post_id, applicant_user_id, status, cover_note, applied_at, updated_at`,
        [params.postId, params.applicantUserId, params.coverNote],
      );
      return result.rows[0];
    });
  },

  async findPendingOfferByApplicationId(applicationId: string): Promise<CareerOfferRow | null> {
    const result = await getPool().query<CareerOfferRow>(
      `SELECT id, application_id, employer_user_id, status, terms,
              offered_at, expires_at, accepted_at, declined_at, updated_at
       FROM career_offers
       WHERE application_id = $1 AND status = 'pending'`,
      [applicationId],
    );
    return result.rows[0] ?? null;
  },

  async acceptOfferTransaction(applicationId: string, offerId: string): Promise<void> {
    await withResilientTransaction(async (client) => {
      const lockResult = await client.query<{ status: string }>(
        `SELECT status FROM career_offers WHERE id = $1 FOR UPDATE`,
        [offerId],
      );

      const offerStatus = lockResult.rows[0]?.status;
      if (offerStatus !== "pending") {
        throw Object.assign(
          new Error(`Offer is no longer pending — current status: '${offerStatus}'`),
          { code: "CONFLICT", httpStatus: 409 },
        );
      }

      await client.query(
        `UPDATE career_offers
         SET status = 'accepted', accepted_at = now(), updated_at = now()
         WHERE id = $1`,
        [offerId],
      );

      await client.query(
        `UPDATE career_applications SET status = 'offer_accepted', updated_at = now()
         WHERE id = $1`,
        [applicationId],
      );
    });
  },

  async declineOfferTransaction(applicationId: string, offerId: string): Promise<void> {
    await withResilientTransaction(async (client) => {
      const lockResult = await client.query<{ status: string }>(
        `SELECT status FROM career_offers WHERE id = $1 FOR UPDATE`,
        [offerId],
      );

      const offerStatus = lockResult.rows[0]?.status;
      if (offerStatus !== "pending") {
        throw Object.assign(
          new Error(`Offer is no longer pending — current status: '${offerStatus}'`),
          { code: "CONFLICT", httpStatus: 409 },
        );
      }

      await client.query(
        `UPDATE career_offers
         SET status = 'declined', declined_at = now(), updated_at = now()
         WHERE id = $1`,
        [offerId],
      );

      await client.query(
        `UPDATE career_applications SET status = 'offer_declined', updated_at = now()
         WHERE id = $1`,
        [applicationId],
      );
    });
  },

  /**
   * Employee self-withdraw — only pending | shortlisted | interview_scheduled.
   */
  async withdrawApplicationTransaction(applicationId: string): Promise<{ previousStatus: string }> {
    return withResilientTransaction(async (client) => {
      const lockResult = await client.query<{ status: string }>(
        `SELECT status FROM career_applications WHERE id = $1 FOR UPDATE`,
        [applicationId],
      );

      const previousStatus = lockResult.rows[0]?.status;
      if (
        previousStatus !== "pending" &&
        previousStatus !== "shortlisted" &&
        previousStatus !== "interview_scheduled"
      ) {
        throw Object.assign(
          new Error(`Cannot withdraw — application is in '${previousStatus ?? "missing"}' status`),
          { code: "CONFLICT", httpStatus: 409 },
        );
      }

      await client.query(
        `UPDATE career_applications SET status = 'withdrawn', updated_at = now()
         WHERE id = $1`,
        [applicationId],
      );

      return { previousStatus };
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

  async listEmploymentsByEmployee(employeeUserId: string): Promise<CareerEmploymentRow[]> {
    const result = await getPool().query<CareerEmploymentRow>(
      `SELECT id, application_id, post_id, employee_user_id, employer_user_id,
              status, COALESCE(details, '{}'::jsonb) AS details,
              confirmed_at, created_at, updated_at
       FROM career_employments
       WHERE employee_user_id = $1
       ORDER BY confirmed_at DESC
       LIMIT 200`,
      [employeeUserId],
    );
    return result.rows;
  },

  async updateEmploymentByEmployee(
    employmentId: string,
    employeeUserId: string,
    patch: { status?: string; details?: Record<string, unknown> },
  ): Promise<CareerEmploymentRow | null> {
    return withResilientTransaction(async (client) => {
      const existing = await client.query<CareerEmploymentRow>(
        `SELECT id, application_id, post_id, employee_user_id, employer_user_id,
                status, COALESCE(details, '{}'::jsonb) AS details,
                confirmed_at, created_at, updated_at
         FROM career_employments
         WHERE id = $1 AND employee_user_id = $2
         FOR UPDATE`,
        [employmentId, employeeUserId],
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
         WHERE id = $1 AND employee_user_id = $2
         RETURNING id, application_id, post_id, employee_user_id, employer_user_id,
                   status, COALESCE(details, '{}'::jsonb) AS details,
                   confirmed_at, created_at, updated_at`,
        [employmentId, employeeUserId, nextStatus, JSON.stringify(nextDetails)],
      );
      return result.rows[0] ?? null;
    });
  },
};
