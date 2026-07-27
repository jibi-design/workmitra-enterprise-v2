/** Job Mitra | server/jobs/gap001SessionCleanup.job.ts | GAP-001 session purge (DRY_RUN default) */

import type pg from "pg";
import { GAP001_ELIGIBLE_WHERE, type GapJobMode, toDateOnly } from "./gapRetention.shared.ts";

export type Gap001Result = {
  ok: true;
  gap: "GAP-001";
  job_name: "gap001_session_cleanup";
  job_run_id: string;
  dry_run: boolean;
  destructive_action: boolean;
  target_env: "staging" | "dev";
  run_at: string;
  eligible_expired_or_revoked_session_count: number;
  rows_would_delete: number;
  rows_deleted: number;
  active_session_eligible_count: number;
  active_sessions_excluded: boolean;
  oldest_eligible_date: string | null;
  newest_eligible_date: string | null;
};

export async function runGap001SessionCleanup(
  pool: pg.Pool,
  mode: GapJobMode,
): Promise<Gap001Result> {
  const runAt = new Date().toISOString();

  const gap001 = await pool.query<{
    eligible_expired_or_revoked_session_count: number;
    oldest_eligible_ts: Date | string | null;
    newest_eligible_ts: Date | string | null;
  }>(
    `SELECT
       COUNT(*)::int AS eligible_expired_or_revoked_session_count,
       MIN(
         COALESCE(
           revoked_at,
           LEAST(expires_at, idle_expires_at)
         )
       ) AS oldest_eligible_ts,
       MAX(
         COALESCE(
           revoked_at,
           LEAST(expires_at, idle_expires_at)
         )
       ) AS newest_eligible_ts
     FROM auth_sessions
     WHERE ${GAP001_ELIGIBLE_WHERE}`,
  );

  const gap001ActiveLeak = await pool.query<{ active_session_eligible_count: number }>(
    `SELECT COUNT(*)::int AS active_session_eligible_count
     FROM auth_sessions
     WHERE expires_at > now()
       AND idle_expires_at > now()
       AND revoked_at IS NULL
       AND (${GAP001_ELIGIBLE_WHERE})`,
  );

  const eligible = gap001.rows[0]?.eligible_expired_or_revoked_session_count ?? 0;
  const activeLeak = gap001ActiveLeak.rows[0]?.active_session_eligible_count ?? -1;

  if (activeLeak !== 0) {
    throw new Error(
      "GAP-001 safety abort: active sessions matched eligible predicate — delete blocked",
    );
  }

  let rowsDeleted = 0;
  if (!mode.dryRun) {
    const del = await pool.query<{ id: string }>(
      `DELETE FROM auth_sessions
       WHERE ${GAP001_ELIGIBLE_WHERE}
       RETURNING id`,
    );
    rowsDeleted = del.rowCount ?? del.rows.length;
  }

  return {
    ok: true,
    gap: "GAP-001",
    job_name: "gap001_session_cleanup",
    job_run_id: mode.jobRunId,
    dry_run: mode.dryRun,
    destructive_action: !mode.dryRun,
    target_env: mode.targetEnv,
    run_at: runAt,
    eligible_expired_or_revoked_session_count: eligible,
    rows_would_delete: mode.dryRun ? eligible : 0,
    rows_deleted: rowsDeleted,
    active_session_eligible_count: activeLeak,
    active_sessions_excluded: activeLeak === 0,
    oldest_eligible_date: toDateOnly(gap001.rows[0]?.oldest_eligible_ts),
    newest_eligible_date: toDateOnly(gap001.rows[0]?.newest_eligible_ts),
  };
}
