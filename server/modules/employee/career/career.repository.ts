import { getPool } from "../../../db/pool.js";
import type { CareerApplicationRow, CareerOfferRow } from "../../career/types.js";

export const employeeCareerRepository = {
  async findApplicationById(applicationId: string): Promise<CareerApplicationRow | null> {
    const result = await getPool().query<CareerApplicationRow>(
      `SELECT id, post_id, applicant_user_id, status, cover_note, applied_at, updated_at
       FROM career_applications
       WHERE id = $1`,
      [applicationId],
    );
    return result.rows[0] ?? null;
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

  /**
   * Atomically accepts the offer.
   * Updates offer status to 'accepted' and application status to 'offer_accepted'.
   * Uses SELECT FOR UPDATE to prevent concurrent accept + decline race.
   */
  async acceptOfferTransaction(applicationId: string, offerId: string): Promise<void> {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");

      // Lock offer row to prevent concurrent accept/decline
      const lockResult = await client.query<{ status: string }>(
        `SELECT status FROM career_offers WHERE id = $1 FOR UPDATE`,
        [offerId],
      );

      const offerStatus = lockResult.rows[0]?.status;
      if (offerStatus !== "pending") {
        await client.query("ROLLBACK");
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

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Atomically declines the offer.
   * Updates offer status to 'declined' and application status to 'offer_declined'.
   */
  async declineOfferTransaction(applicationId: string, offerId: string): Promise<void> {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");

      const lockResult = await client.query<{ status: string }>(
        `SELECT status FROM career_offers WHERE id = $1 FOR UPDATE`,
        [offerId],
      );

      const offerStatus = lockResult.rows[0]?.status;
      if (offerStatus !== "pending") {
        await client.query("ROLLBACK");
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

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
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
};
