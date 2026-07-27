-- Phase 17 — Workforce Ops tables (DB-authoritative when auth on)
-- Tenant scope: employer_user_id on groups; members/roles/schedules cascade via group_id.

CREATE TABLE IF NOT EXISTS workforce_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed')),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT workforce_groups_details_is_object
    CHECK (jsonb_typeof(details) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_workforce_groups_employer_created
  ON workforce_groups (employer_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workforce_groups_employer_status
  ON workforce_groups (employer_user_id, status);

CREATE TABLE IF NOT EXISTS workforce_group_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES workforce_groups(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT workforce_group_roles_permissions_is_object
    CHECK (jsonb_typeof(permissions) = 'object'),
  CONSTRAINT workforce_group_roles_details_is_object
    CHECK (jsonb_typeof(details) = 'object'),
  CONSTRAINT workforce_group_roles_unique_name
    UNIQUE (group_id, role_name)
);

CREATE INDEX IF NOT EXISTS idx_workforce_roles_group
  ON workforce_group_roles (group_id);

CREATE TABLE IF NOT EXISTS workforce_group_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES workforce_groups(id) ON DELETE CASCADE,
  schedule_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT workforce_group_schedules_json_is_object
    CHECK (jsonb_typeof(schedule_json) = 'object'),
  CONSTRAINT workforce_group_schedules_details_is_object
    CHECK (jsonb_typeof(details) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_workforce_schedules_group
  ON workforce_group_schedules (group_id, effective_from DESC);

CREATE TABLE IF NOT EXISTS workforce_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES workforce_groups(id) ON DELETE CASCADE,
  employee_user_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
  employee_ml_id TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'exited', 'replaced')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT workforce_group_members_details_is_object
    CHECK (jsonb_typeof(details) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_workforce_members_group
  ON workforce_group_members (group_id, joined_at DESC);
CREATE INDEX IF NOT EXISTS idx_workforce_members_employee
  ON workforce_group_members (employee_user_id)
  WHERE employee_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workforce_members_ml
  ON workforce_group_members (upper(employee_ml_id))
  WHERE length(trim(employee_ml_id)) > 0;
