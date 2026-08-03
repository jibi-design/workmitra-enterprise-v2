-- Sprint 3 — platform_ops schema (audit + runtime actuators)
-- Apply via migrate.ts or Supabase SQL Editor

CREATE SCHEMA IF NOT EXISTS platform_ops;

CREATE TABLE IF NOT EXISTS platform_ops.admin_audit (
  id uuid PRIMARY KEY,
  at_iso timestamptz NOT NULL DEFAULT now(),
  who text NOT NULL,
  what text NOT NULL,
  tone text NOT NULL CHECK (tone IN ('green', 'yellow', 'red')),
  action text NOT NULL,
  client_ip text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS admin_audit_at_iso_idx
  ON platform_ops.admin_audit (at_iso DESC);

CREATE TABLE IF NOT EXISTS platform_ops.master_admins (
  email text PRIMARY KEY,
  display_name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform_ops.runtime_flags (
  id text PRIMARY KEY DEFAULT 'global',
  maintenance_mode boolean NOT NULL DEFAULT false,
  lockdown boolean NOT NULL DEFAULT false,
  kill_shift boolean NOT NULL DEFAULT false,
  kill_career boolean NOT NULL DEFAULT false,
  kill_planner boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text
);

INSERT INTO platform_ops.runtime_flags (id)
VALUES ('global')
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON SCHEMA platform_ops FROM anon;
    REVOKE ALL ON ALL TABLES IN SCHEMA platform_ops FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON SCHEMA platform_ops FROM authenticated;
    REVOKE ALL ON ALL TABLES IN SCHEMA platform_ops FROM authenticated;
  END IF;
  REVOKE ALL ON SCHEMA platform_ops FROM PUBLIC;
END $$;

COMMENT ON TABLE platform_ops.admin_audit IS
  'Sprint3: Super Admin privileged action trail';
COMMENT ON TABLE platform_ops.runtime_flags IS
  'Sprint3: remote maintenance / lockdown / kill switches honored by Job Mitra';
