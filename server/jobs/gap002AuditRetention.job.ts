/** Job Mitra | server/jobs/gap002AuditRetention.job.ts | GAP-002 retention sweep (DRY_RUN default) */

import type pg from "pg";
import { type GapJobMode, toDateOnly } from "./gapRetention.shared.ts";

export type Gap002Result = {
  ok: true;
  gap: "GAP-002";
  job_name: "gap002_audit_retention";
  job_run_id: string;
  dry_run: boolean;
  destructive_action: boolean;
  target_env: "staging" | "dev";
  run_at: string;
  login_attempts_older_than_30_days_count: number;
  audit_events_older_than_90_days_count: number;
  rows_would_delete_login_attempts: number;
  rows_would_delete_audit_events: number;
  rows_deleted_login_attempts: number;
  rows_deleted_audit_events: number;
  oldest_login_attempt_date: string | null;
  newest_login_attempt_date: string | null;
  oldest_audit_event_date: string | null;
  newest_audit_event_date: string | null;
};

export async function runGap002AuditRetention(
  pool: pg.Pool,
  mode: GapJobMode,
): Promise<Gap002Result> {
  const runAt = new Date().toISOString();

  const attempts = await pool.query<{
    login_attempts_older_than_30_days_count: number;
    oldest_login_attempt_ts: Date | string | null;
    newest_login_attempt_ts: Date | string | null;
  }>(
    `SELECT
       COUNT(*)::int AS login_attempts_older_than_30_days_count,
       MIN(attempted_at) AS oldest_login_attempt_ts,
       MAX(attempted_at) AS newest_login_attempt_ts
     FROM auth_login_attempts
     WHERE attempted_at < now() - interval '30 days'`,
  );

  const audit = await pool.query<{
    audit_events_older_than_90_days_count: number;
    oldest_audit_event_ts: Date | string | null;
    newest_audit_event_ts: Date | string | null;
  }>(
    `SELECT
       COUNT(*)::int AS audit_events_older_than_90_days_count,
       MIN(created_at) AS oldest_audit_event_ts,
       MAX(created_at) AS newest_audit_event_ts
     FROM auth_audit_events
     WHERE created_at < now() - interval '90 days'`,
  );

  const attemptCount = attempts.rows[0]?.login_attempts_older_than_30_days_count ?? 0;
  const auditCount = audit.rows[0]?.audit_events_older_than_90_days_count ?? 0;

  let deletedAttempts = 0;
  let deletedAudit = 0;

  if (!mode.dryRun) {
    const d1 = await pool.query(
      `DELETE FROM auth_login_attempts
       WHERE attempted_at < now() - interval '30 days'`,
    );
    deletedAttempts = d1.rowCount ?? 0;

    const d2 = await pool.query(
      `DELETE FROM auth_audit_events
       WHERE created_at < now() - interval '90 days'`,
    );
    deletedAudit = d2.rowCount ?? 0;
  }

  return {
    ok: true,
    gap: "GAP-002",
    job_name: "gap002_audit_retention",
    job_run_id: mode.jobRunId,
    dry_run: mode.dryRun,
    destructive_action: !mode.dryRun,
    target_env: mode.targetEnv,
    run_at: runAt,
    login_attempts_older_than_30_days_count: attemptCount,
    audit_events_older_than_90_days_count: auditCount,
    rows_would_delete_login_attempts: mode.dryRun ? attemptCount : 0,
    rows_would_delete_audit_events: mode.dryRun ? auditCount : 0,
    rows_deleted_login_attempts: deletedAttempts,
    rows_deleted_audit_events: deletedAudit,
    oldest_login_attempt_date: toDateOnly(attempts.rows[0]?.oldest_login_attempt_ts),
    newest_login_attempt_date: toDateOnly(attempts.rows[0]?.newest_login_attempt_ts),
    oldest_audit_event_date: toDateOnly(audit.rows[0]?.oldest_audit_event_ts),
    newest_audit_event_date: toDateOnly(audit.rows[0]?.newest_audit_event_ts),
  };
}
