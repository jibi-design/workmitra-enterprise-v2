/** Job Mitra API | Public active shift posts for nearby matching. */

import { getPool } from "../../../db/pool.js";
import type { ShiftPostRow } from "../../shift/types.js";

const POST_SELECT = `id, employer_id, job_name, category, status, vacancies,
              start_at, end_at, COALESCE(details, '{}'::jsonb) AS details,
              location_pincode, created_at, updated_at`;

export async function listActivePublishedPosts(): Promise<ShiftPostRow[]> {
  const result = await getPool().query<ShiftPostRow>(
    `SELECT ${POST_SELECT}
     FROM shift_posts
     WHERE status = 'active'
       AND COALESCE(details->>'isHiddenFromSearch', 'false') <> 'true'
     ORDER BY start_at ASC`,
  );
  return result.rows;
}
