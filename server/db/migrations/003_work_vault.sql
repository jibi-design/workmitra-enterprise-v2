-- Work Vault Authorization — Job Mitra
-- Migration 003: vault_otps, vault_sessions, vault_access_log
--
-- The Work Vault is the employee's secure document store.
-- An employer gains temporary read access by verifying a time-limited OTP
-- that the employee generates. The OTP is stored as an argon2id hash — never
-- plaintext. The resulting vault_session row governs exactly which folder IDs
-- the employer may access and for how long.
--
-- SECURITY PROPERTIES:
--   1. vault_otps.code_hash — argon2id hash of the 6-digit code. Plaintext
--      is returned to the employee ONCE and never persisted anywhere.
--   2. vault_otps.attempt_count — incremented on every failed verify.
--      At MAX_OTP_ATTEMPTS (5) the OTP is invalidated by setting used_at.
--   3. vault_sessions.visible_folder_ids — snapshot captured at OTP generation
--      time. Immutable after session creation. Employer cannot access any
--      folder not in this snapshot, even if they know the folder ID.
--   4. vault_access_log — INSERT-only from the application layer.
--      No UPDATE or DELETE is permitted. Employees cannot clear access history.
--   5. All OTP verify + session creation is done in a single BEGIN/COMMIT
--      transaction with SELECT FOR UPDATE on the OTP row.

-- ── vault_otps ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vault_otps (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id      UUID        NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  code_hash        TEXT        NOT NULL,
  visible_folder_ids TEXT[]    NOT NULL DEFAULT '{}',
  attempt_count    INTEGER     NOT NULL DEFAULT 0
                               CHECK (attempt_count >= 0),
  expires_at       TIMESTAMPTZ NOT NULL,
  used_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT vault_otps_expires_after_created CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS idx_vault_otps_employee_active
  ON vault_otps (employee_id, expires_at DESC)
  WHERE used_at IS NULL;

-- ── vault_sessions ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vault_sessions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id         UUID        NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  employer_id         UUID        NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  employer_name       TEXT        NOT NULL,
  employer_wm_id      TEXT        NOT NULL DEFAULT '',
  visible_folder_ids  TEXT[]      NOT NULL DEFAULT '{}',
  status              TEXT        NOT NULL DEFAULT 'active'
                                  CHECK (status IN ('active', 'expired', 'revoked')),
  started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at          TIMESTAMPTZ NOT NULL,
  revoked_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT vault_sessions_expires_after_start CHECK (expires_at > started_at),
  CONSTRAINT vault_sessions_revoked_requires_revoked_at
    CHECK (status != 'revoked' OR revoked_at IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_vault_sessions_employee
  ON vault_sessions (employee_id, status, expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_vault_sessions_employer
  ON vault_sessions (employer_id, status, expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_vault_sessions_active
  ON vault_sessions (status, expires_at)
  WHERE status = 'active';

-- ── vault_access_log ─────────────────────────────────────────────────────────
-- INSERT-ONLY. The application layer MUST NOT issue UPDATE or DELETE on this table.
-- This constraint is enforced by architecture convention (documented in .windsurfrules)
-- and may be enforced by a DB-level trigger or RLS policy in a future migration.
CREATE TABLE IF NOT EXISTS vault_access_log (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID        NOT NULL REFERENCES vault_sessions(id) ON DELETE RESTRICT,
  employee_id  UUID        NOT NULL REFERENCES auth_users(id) ON DELETE RESTRICT,
  employer_id  UUID        NOT NULL REFERENCES auth_users(id) ON DELETE RESTRICT,
  event_type   TEXT        NOT NULL
               CHECK (event_type IN ('session_created', 'session_revoked', 'session_expired')),
  occurred_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vault_access_log_session
  ON vault_access_log (session_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_vault_access_log_employee
  ON vault_access_log (employee_id, occurred_at DESC);
