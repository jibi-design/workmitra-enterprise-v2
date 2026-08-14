-- Demand Planner plans — Postgres persistent store (replaces in-memory Map).

CREATE TABLE IF NOT EXISTS planner_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'cancelled')),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT planner_plans_details_is_object
    CHECK (jsonb_typeof(details) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_planner_plans_employer_updated
  ON planner_plans (employer_user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_planner_plans_employer_status
  ON planner_plans (employer_user_id, status);
