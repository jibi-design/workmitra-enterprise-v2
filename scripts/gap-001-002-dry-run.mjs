/**
 * Job Mitra — GAP-001 / GAP-002 dry-run evidence collector (SELECT-only).
 *
 * Purpose: Read-only row counts for locked staging/dev retention policy.
 * Does NOT DELETE, UPDATE, INSERT, or schedule jobs.
 *
 * Prerequisites (staging/dev only — never production):
 *   DRY_RUN_TARGET_ENV=staging   (or dev)
 *   AUTH_USER_SOURCE=db          (required — enforced)
 *   DATABASE_URL                 (staging pooler — never printed)
 *
 * Fail-closed blocks: NODE_ENV=production, RENDER_SERVICE_NAME, CF_PAGES=1
 *
 * Import safety: DB pool is dynamically imported only after all guards pass.
 *
 * Usage (after operator/architect approves script review):
 *   DRY_RUN_TARGET_ENV=staging npx tsx scripts/gap-001-002-dry-run.mjs
 *
 * Logging policy: counts and dates only — no secrets, tokens, hashes, emails, metadata, ip_hash.
 */

const TARGET = process.env.DRY_RUN_TARGET_ENV ?? "";

function redactError(err) {
  const message = err instanceof Error ? err.message : "unknown_error";
  return message
    .replace(/postgres(ql)?:\/\/\S+/gi, "[redacted]")
    .replace(/password=\S+/gi, "password=[redacted]");
}

function toDateOnly(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function failClosed(error) {
  console.log(
    JSON.stringify({
      ok: false,
      dry_run: true,
      destructive_action: false,
      error,
    }),
  );
  process.exit(1);
}

// ─── Fail-closed environment guards (before DB connection) ───────────────────

if (TARGET !== "staging" && TARGET !== "dev") {
  failClosed("DRY_RUN_TARGET_ENV must be staging or dev — production not allowed");
}

if (process.env.NODE_ENV === "production") {
  failClosed("NODE_ENV=production is not allowed for dry-run evidence collection");
}

if (process.env.RENDER_SERVICE_NAME) {
  failClosed("Render production/staging service environment detected — dry-run blocked");
}

if (process.env.CF_PAGES === "1") {
  failClosed("Cloudflare Pages runtime detected — dry-run blocked");
}

if (process.env.AUTH_USER_SOURCE !== "db") {
  failClosed("AUTH_USER_SOURCE must be db for dry-run evidence collection");
}

if (!process.env.DATABASE_URL) {
  failClosed("DATABASE_URL not set");
}

/** GAP-001 locked staging/dev predicate — expired or revoked, 30+ days past event. */
const GAP001_ELIGIBLE_WHERE = `
  (expires_at < now() - interval '30 days')
  OR (idle_expires_at < now() - interval '30 days')
  OR (revoked_at IS NOT NULL AND revoked_at < now() - interval '30 days')
`;

let closePoolFn = null;

try {
  const { getPool, closePool } = await import("../server/db/pool.ts");
  closePoolFn = closePool;

  const pool = getPool();

  // GAP-001: eligible session count + date bounds (no token/hash columns selected)
  const gap001 = await pool.query(
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

  // GAP-001: active sessions must NOT match eligible predicate (expect 0)
  const gap001ActiveLeak = await pool.query(
    `SELECT COUNT(*)::int AS active_session_eligible_count
     FROM auth_sessions
     WHERE expires_at > now()
       AND idle_expires_at > now()
       AND revoked_at IS NULL
       AND (${GAP001_ELIGIBLE_WHERE})`,
  );

  // GAP-002: auth_login_attempts older than 30 days (count + dates only)
  const gap002Attempts = await pool.query(
    `SELECT
       COUNT(*)::int AS login_attempts_older_than_30_days_count,
       MIN(attempted_at) AS oldest_login_attempt_ts,
       MAX(attempted_at) AS newest_login_attempt_ts
     FROM auth_login_attempts
     WHERE attempted_at < now() - interval '30 days'`,
  );

  // GAP-002: auth_audit_events older than 90 days (count + dates only — no metadata)
  const gap002Audit = await pool.query(
    `SELECT
       COUNT(*)::int AS audit_events_older_than_90_days_count,
       MIN(created_at) AS oldest_audit_event_ts,
       MAX(created_at) AS newest_audit_event_ts
     FROM auth_audit_events
     WHERE created_at < now() - interval '90 days'`,
  );

  const g1 = gap001.rows[0] ?? {};
  const g1leak = gap001ActiveLeak.rows[0]?.active_session_eligible_count ?? -1;
  const g2a = gap002Attempts.rows[0] ?? {};
  const g2e = gap002Audit.rows[0] ?? {};

  console.log(
    JSON.stringify(
      {
        ok: true,
        dry_run: true,
        destructive_action: false,
        target_env: TARGET,
        gap: "GAP-001",
        eligible_expired_or_revoked_session_count:
          g1.eligible_expired_or_revoked_session_count ?? 0,
        active_session_eligible_count: g1leak,
        active_sessions_excluded: g1leak === 0,
        oldest_eligible_date: toDateOnly(g1.oldest_eligible_ts),
        newest_eligible_date: toDateOnly(g1.newest_eligible_ts),
      },
      null,
      2,
    ),
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        dry_run: true,
        destructive_action: false,
        target_env: TARGET,
        gap: "GAP-002",
        login_attempts_older_than_30_days_count:
          g2a.login_attempts_older_than_30_days_count ?? 0,
        audit_events_older_than_90_days_count:
          g2e.audit_events_older_than_90_days_count ?? 0,
        oldest_login_attempt_date: toDateOnly(g2a.oldest_login_attempt_ts),
        newest_login_attempt_date: toDateOnly(g2a.newest_login_attempt_ts),
        oldest_audit_event_date: toDateOnly(g2e.oldest_audit_event_ts),
        newest_audit_event_date: toDateOnly(g2e.newest_audit_event_ts),
      },
      null,
      2,
    ),
  );
} catch (err) {
  console.log(
    JSON.stringify({
      ok: false,
      dry_run: true,
      destructive_action: false,
      error: redactError(err),
    }),
  );
  process.exit(1);
} finally {
  if (typeof closePoolFn === "function") {
    await closePoolFn();
  }
}
