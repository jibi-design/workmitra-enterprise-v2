-- Sprint enterprise — immutable Super-Admin audit ledger hardening
-- Append-only: block UPDATE/DELETE via trigger; add hash-chain columns

ALTER TABLE platform_ops.admin_audit
  ADD COLUMN IF NOT EXISTS entry_hash text;

ALTER TABLE platform_ops.admin_audit
  ADD COLUMN IF NOT EXISTS prev_hash text;

CREATE INDEX IF NOT EXISTS admin_audit_entry_hash_idx
  ON platform_ops.admin_audit (entry_hash);

CREATE OR REPLACE FUNCTION platform_ops.deny_admin_audit_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'platform_ops.admin_audit is append-only (immutable ledger)';
END;
$$;

DROP TRIGGER IF EXISTS admin_audit_no_update ON platform_ops.admin_audit;
CREATE TRIGGER admin_audit_no_update
  BEFORE UPDATE ON platform_ops.admin_audit
  FOR EACH ROW
  EXECUTE PROCEDURE platform_ops.deny_admin_audit_mutation();

DROP TRIGGER IF EXISTS admin_audit_no_delete ON platform_ops.admin_audit;
CREATE TRIGGER admin_audit_no_delete
  BEFORE DELETE ON platform_ops.admin_audit
  FOR EACH ROW
  EXECUTE PROCEDURE platform_ops.deny_admin_audit_mutation();

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE UPDATE, DELETE ON platform_ops.admin_audit FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE UPDATE, DELETE ON platform_ops.admin_audit FROM authenticated;
  END IF;
  REVOKE UPDATE, DELETE ON platform_ops.admin_audit FROM PUBLIC;
END $$;

COMMENT ON TABLE platform_ops.admin_audit IS
  'Immutable Super-Admin audit ledger (append-only; UPDATE/DELETE denied)';
