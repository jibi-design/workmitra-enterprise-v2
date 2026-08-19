/** Job Mitra API | shift_events rows for workspace chat (no new table). */

import { getPool } from "../../db/pool.js";
import type { ShiftEventRow } from "./types.js";

export const WORKSPACE_EVENT_KINDS = ["workspace_broadcast", "workspace_direct"] as const;

export type WorkspaceEventKind = (typeof WORKSPACE_EVENT_KINDS)[number];

export async function insertWorkspaceEvent(params: {
  postId: string;
  kind: WorkspaceEventKind;
  actorId: string;
  meta: Record<string, unknown>;
}): Promise<ShiftEventRow> {
  const result = await getPool().query<ShiftEventRow>(
    `INSERT INTO shift_events (post_id, kind, actor_id, meta)
     VALUES ($1, $2, $3, $4::jsonb)
     RETURNING id, post_id, kind, actor_id, meta, created_at`,
    [params.postId, params.kind, params.actorId, JSON.stringify(params.meta)],
  );
  return result.rows[0];
}

export async function listWorkspaceEventsForEmployer(employerId: string): Promise<ShiftEventRow[]> {
  const result = await getPool().query<ShiftEventRow>(
    `SELECT e.id, e.post_id, e.kind, e.actor_id, e.meta, e.created_at
     FROM shift_events e
     INNER JOIN shift_posts p ON p.id = e.post_id
     WHERE p.employer_id = $1 AND e.kind = ANY($2::text[])
     ORDER BY e.created_at ASC
     LIMIT 200`,
    [employerId, [...WORKSPACE_EVENT_KINDS]],
  );
  return result.rows;
}

export async function listWorkspaceEventsForEmployee(userId: string): Promise<ShiftEventRow[]> {
  const result = await getPool().query<ShiftEventRow>(
    `SELECT DISTINCT e.id, e.post_id, e.kind, e.actor_id, e.meta, e.created_at
     FROM shift_events e
     INNER JOIN shift_applications a ON a.post_id = e.post_id
     WHERE e.kind = ANY($2::text[])
       AND a.status NOT IN ('withdrawn', 'rejected')
       AND (
         upper(a.worker_wm_id) = upper($1)
         OR COALESCE(a.details->>'applicant_user_id', '') = $1
       )
     ORDER BY e.created_at ASC
     LIMIT 200`,
    [userId, [...WORKSPACE_EVENT_KINDS]],
  );
  return result.rows;
}

export async function listWorkspaceEvents(postId: string): Promise<ShiftEventRow[]> {
  const result = await getPool().query<ShiftEventRow>(
    `SELECT id, post_id, kind, actor_id, meta, created_at
     FROM shift_events
     WHERE post_id = $1 AND kind = ANY($2::text[])
     ORDER BY created_at ASC
     LIMIT 80`,
    [postId, [...WORKSPACE_EVENT_KINDS]],
  );
  return result.rows;
}
