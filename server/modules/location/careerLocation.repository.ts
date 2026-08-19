/** Job Mitra API | Career commute profile. Reuses base_pincode. No dates. */

import { getPool } from "../../db/pool.js";
import { parseCareerCommuteRadius, type CareerCommuteRadiusKm } from "./careerCommuteRadius.js";
import { parsePincode } from "./pincode.js";

export type CareerLocationProfile = {
  basePincode: string | null;
  careerCommuteRadiusKm: CareerCommuteRadiusKm;
};

export const careerLocationRepository = {
  async upsert(
    userId: string,
    basePincode: string | null,
    careerCommuteRadiusKm: CareerCommuteRadiusKm,
  ): Promise<void> {
    const pin = parsePincode(basePincode);
    await getPool().query(
      `INSERT INTO employee_location_profiles
         (user_id, base_pincode, commute_radius_km, career_commute_radius_km, updated_at)
       VALUES ($1, $2, 10, $3, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         base_pincode = EXCLUDED.base_pincode,
         career_commute_radius_km = EXCLUDED.career_commute_radius_km,
         updated_at = NOW()`,
      [userId, pin, careerCommuteRadiusKm],
    );
  },

  async get(userId: string): Promise<CareerLocationProfile | null> {
    const result = await getPool().query<{
      base_pincode: string | null;
      career_commute_radius_km: number | null;
    }>(
      `SELECT base_pincode, career_commute_radius_km
       FROM employee_location_profiles
       WHERE user_id = $1`,
      [userId],
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      basePincode: parsePincode(row.base_pincode),
      careerCommuteRadiusKm: parseCareerCommuteRadius(row.career_commute_radius_km),
    };
  },

  async listWithBase(): Promise<
    Array<{
      userId: string;
      basePincode: string;
      careerCommuteRadiusKm: CareerCommuteRadiusKm;
    }>
  > {
    const result = await getPool().query<{
      user_id: string;
      base_pincode: string | null;
      career_commute_radius_km: number | null;
    }>(
      `SELECT user_id, base_pincode, career_commute_radius_km
       FROM employee_location_profiles
       WHERE base_pincode IS NOT NULL`,
    );
    const rows: Array<{
      userId: string;
      basePincode: string;
      careerCommuteRadiusKm: CareerCommuteRadiusKm;
    }> = [];
    for (const row of result.rows) {
      const pin = parsePincode(row.base_pincode);
      if (!pin) continue;
      rows.push({
        userId: row.user_id,
        basePincode: pin,
        careerCommuteRadiusKm: parseCareerCommuteRadius(row.career_commute_radius_km),
      });
    }
    return rows;
  },
};
