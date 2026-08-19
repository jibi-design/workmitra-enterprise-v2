/** Job Mitra API | DB persistence for availability broadcasts + employee location. */

import { getPool } from "../../db/pool.js";
import type { CommuteRadiusKm } from "../location/commuteRadius.js";
import { toIsoDate } from "./availability.dates.js";
import type { AvailabilityBroadcastRecord } from "./availability.types.js";

type BroadcastRow = {
  worker_user_id: string;
  worker_ml_id: string;
  selected_dates: string[] | Date[];
  base_pincode: string | null;
  commute_radius_km: number;
  city: string | null;
  expires_at: Date | null;
  updated_at: Date;
};

const BROADCAST_SELECT = `worker_user_id, worker_ml_id,
  COALESCE(
    ARRAY(SELECT to_char(d, 'YYYY-MM-DD') FROM unnest(selected_dates) AS d),
    '{}'::text[]
  ) AS selected_dates,
  base_pincode, commute_radius_km, city, expires_at, updated_at`;

function toIso(value: string | Date): string {
  if (typeof value === "string") {
    const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);
    return match?.[1] ?? value.slice(0, 10);
  }
  return toIsoDate(value);
}

function mapBroadcast(row: BroadcastRow): AvailabilityBroadcastRecord {
  const dates = Array.isArray(row.selected_dates) ? row.selected_dates.map(toIso) : [];
  const radius = row.commute_radius_km;
  return {
    workerUserId: row.worker_user_id,
    workerMlId: row.worker_ml_id,
    selectedDates: dates,
    basePincode: row.base_pincode,
    commuteRadiusKm: radius === 0 || radius === 5 || radius === 10 || radius === 15 ? radius : 10,
    city: row.city ?? undefined,
    expiresAt: row.expires_at ? row.expires_at.getTime() : Date.now(),
    updatedAt: row.updated_at.getTime(),
  };
}

export const availabilityRepository = {
  async upsertBroadcast(row: AvailabilityBroadcastRecord): Promise<AvailabilityBroadcastRecord> {
    const result = await getPool().query<BroadcastRow>(
      `INSERT INTO shift_availability_broadcasts
         (worker_user_id, worker_ml_id, selected_dates, base_pincode, commute_radius_km,
          city, expires_at, updated_at)
       VALUES ($1, $2, $3::date[], $4, $5, $6, to_timestamp($7 / 1000.0), NOW())
       ON CONFLICT (worker_user_id) DO UPDATE SET
         worker_ml_id = EXCLUDED.worker_ml_id,
         selected_dates = EXCLUDED.selected_dates,
         base_pincode = EXCLUDED.base_pincode,
         commute_radius_km = EXCLUDED.commute_radius_km,
         city = EXCLUDED.city,
         expires_at = EXCLUDED.expires_at,
         updated_at = NOW()
       RETURNING ${BROADCAST_SELECT}`,
      [
        row.workerUserId,
        row.workerMlId,
        row.selectedDates,
        row.basePincode,
        row.commuteRadiusKm,
        row.city ?? null,
        row.expiresAt,
      ],
    );
    return mapBroadcast(result.rows[0]);
  },

  async getBroadcast(workerUserId: string): Promise<AvailabilityBroadcastRecord | null> {
    const result = await getPool().query<BroadcastRow>(
      `SELECT ${BROADCAST_SELECT}
       FROM shift_availability_broadcasts
       WHERE worker_user_id = $1`,
      [workerUserId],
    );
    return result.rows[0] ? mapBroadcast(result.rows[0]) : null;
  },

  async deleteBroadcast(workerUserId: string): Promise<void> {
    await getPool().query(
      `DELETE FROM shift_availability_broadcasts WHERE worker_user_id = $1`,
      [workerUserId],
    );
  },

  async listBroadcasts(): Promise<AvailabilityBroadcastRecord[]> {
    const result = await getPool().query<BroadcastRow>(
      `SELECT ${BROADCAST_SELECT}
       FROM shift_availability_broadcasts`,
    );
    return result.rows.map(mapBroadcast);
  },

  async upsertLocation(
    userId: string,
    basePincode: string | null,
    commuteRadiusKm: CommuteRadiusKm,
  ): Promise<void> {
    await getPool().query(
      `INSERT INTO employee_location_profiles (user_id, base_pincode, commute_radius_km, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         base_pincode = EXCLUDED.base_pincode,
         commute_radius_km = EXCLUDED.commute_radius_km,
         updated_at = NOW()`,
      [userId, basePincode, commuteRadiusKm],
    );
  },

  async getLocation(userId: string): Promise<{
    basePincode: string | null;
    commuteRadiusKm: CommuteRadiusKm;
  } | null> {
    const result = await getPool().query<{
      base_pincode: string | null;
      commute_radius_km: number;
    }>(
      `SELECT base_pincode, commute_radius_km
       FROM employee_location_profiles
       WHERE user_id = $1`,
      [userId],
    );
    const row = result.rows[0];
    if (!row) return null;
    const radius = row.commute_radius_km;
    return {
      basePincode: row.base_pincode,
      commuteRadiusKm: radius === 0 || radius === 5 || radius === 10 || radius === 15 ? radius : 10,
    };
  },
};
