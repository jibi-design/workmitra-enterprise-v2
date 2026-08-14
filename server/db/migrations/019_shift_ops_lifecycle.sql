-- Shift Ops + career exit + bidirectional reviews — API-authoritative Postgres.

CREATE TABLE IF NOT EXISTS shift_workspace_qr (
  workspace_id UUID PRIMARY KEY REFERENCES shift_workspaces(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  issued_by UUID REFERENCES auth_users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS shift_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES shift_workspaces(id) ON DELETE CASCADE,
  worker_user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_out_at TIMESTAMPTZ,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT shift_attendance_details_is_object
    CHECK (jsonb_typeof(details) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_shift_attendance_workspace
  ON shift_attendance (workspace_id, checked_in_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_shift_attendance_open_session
  ON shift_attendance (workspace_id)
  WHERE checked_out_at IS NULL;

CREATE TABLE IF NOT EXISTS work_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES shift_workspaces(id) ON DELETE CASCADE,
  employment_id UUID REFERENCES career_employments(id) ON DELETE CASCADE,
  reviewer_user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  reviewee_user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  direction TEXT NOT NULL
    CHECK (direction IN ('employer_to_employee', 'employee_to_employer')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT work_reviews_subject_present
    CHECK (workspace_id IS NOT NULL OR employment_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_work_reviews_workspace
  ON work_reviews (workspace_id, created_at DESC)
  WHERE workspace_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_work_reviews_employment
  ON work_reviews (employment_id, created_at DESC)
  WHERE employment_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS employment_exits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employment_id UUID NOT NULL REFERENCES career_employments(id) ON DELETE CASCADE,
  initiated_by_user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('resign', 'offboard')),
  status TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('pending', 'completed')),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT employment_exits_details_is_object
    CHECK (jsonb_typeof(details) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_employment_exits_employment
  ON employment_exits (employment_id, created_at DESC);
