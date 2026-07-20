/**
 * GAP-004 — read-only SELECT verification for audit/login evidence tables.
 * Never prints secrets, tokens, or connection strings.
 */
import { getPool, closePool } from "../server/db/pool.ts";

const EVENT_TYPES = ["login_rate_limited", "login_failed"];

try {
  const pool = getPool();

  const audit = await pool.query(
    `SELECT event_type, created_at
     FROM auth_audit_events
     WHERE event_type = ANY($1::text[])
     ORDER BY created_at DESC
     LIMIT 5`,
    [EVENT_TYPES],
  );

  const attempts = await pool.query(
    `SELECT COUNT(*)::int AS failed_count
     FROM auth_login_attempts
     WHERE success = false
       AND attempted_at > now() - interval '20 minutes'`,
  );

  const recentAny = await pool.query(
    `SELECT event_type, created_at
     FROM auth_audit_events
     ORDER BY created_at DESC
     LIMIT 3`,
  );

  console.log(
    JSON.stringify({
      ok: true,
      auditFilteredRowCount: audit.rows.length,
      auditFilteredLatestType: audit.rows[0]?.event_type ?? null,
      failedAttemptCount: attempts.rows[0]?.failed_count ?? 0,
      recentAnyRowCount: recentAny.rows.length,
      recentAnyLatestType: recentAny.rows[0]?.event_type ?? null,
    }),
  );
} catch (err) {
  const message = err instanceof Error ? err.message : "unknown_error";
  console.log(JSON.stringify({ ok: false, error: message.replace(/postgres(ql)?:\/\/\S+/gi, "[redacted]") }));
  process.exit(1);
} finally {
  await closePool();
}
