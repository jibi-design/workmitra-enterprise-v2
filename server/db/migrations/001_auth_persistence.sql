-- Phase 2 Auth Persistence — Job Mitra (product_scope = jobmitra)
-- Run via: npm run db:migrate

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS auth_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'locked', 'suspended', 'deleted')),
  locked_until TIMESTAMPTZ,
  failed_login_count INT NOT NULL DEFAULT 0,
  failed_login_window_start TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT auth_users_email_unique UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS auth_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('employee', 'employer', 'admin')),
  product_scope TEXT NOT NULL DEFAULT 'jobmitra',
  is_primary BOOLEAN NOT NULL DEFAULT true,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT auth_user_roles_unique UNIQUE (user_id, role, product_scope)
);

CREATE INDEX IF NOT EXISTS idx_auth_user_roles_user_scope
  ON auth_user_roles (user_id, product_scope) WHERE is_primary = true;

CREATE TABLE IF NOT EXISTS auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  session_token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  idle_expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  ip_hash TEXT,
  user_agent TEXT,
  CONSTRAINT auth_sessions_token_hash_unique UNIQUE (session_token_hash)
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires ON auth_sessions (expires_at) WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS auth_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
  session_id UUID REFERENCES auth_sessions(id) ON DELETE SET NULL,
  ip_hash TEXT,
  user_agent TEXT,
  request_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_audit_created ON auth_audit_events (created_at);
CREATE INDEX IF NOT EXISTS idx_auth_audit_user ON auth_audit_events (user_id, created_at);

CREATE TABLE IF NOT EXISTS auth_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_normalized TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_login_attempts_lookup
  ON auth_login_attempts (email_normalized, ip_hash, attempted_at);
