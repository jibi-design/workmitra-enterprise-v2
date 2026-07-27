-- MIG-002 / Phase 6: Shift lifecycle schema — EXECUTABLE
-- Shift tables MUST NOT reference career_* tables
-- worker_wm_id is the Phase-0 identity anchor (wmId)
-- Migrate to auth_users FK after UUID identity is unified
--
-- Job Mitra | server/db/migrations/004_shift_lifecycle.sql

CREATE TABLE IF NOT EXISTS shift_posts (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID        NOT NULL REFERENCES auth_users(id),
  job_name    TEXT        NOT NULL,
  category    TEXT        NOT NULL,
  status      TEXT        NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
  vacancies   INT         NOT NULL CHECK (vacancies > 0),
  start_at    TIMESTAMPTZ NOT NULL,
  end_at      TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shift_posts_employer
  ON shift_posts (employer_id, status);

CREATE TABLE IF NOT EXISTS shift_applications (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id       UUID        NOT NULL REFERENCES shift_posts(id),
  worker_wm_id  TEXT        NOT NULL,
  status        TEXT        NOT NULL CHECK (status IN (
    'applied', 'shortlisted', 'waiting', 'confirmed',
    'rejected', 'withdrawn', 'replaced', 'exited'
  )),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, worker_wm_id)
);

CREATE INDEX IF NOT EXISTS idx_shift_applications_post
  ON shift_applications (post_id, status);

CREATE INDEX IF NOT EXISTS idx_shift_applications_worker
  ON shift_applications (worker_wm_id, status);

CREATE TABLE IF NOT EXISTS shift_workspaces (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id       UUID        NOT NULL REFERENCES shift_posts(id),
  app_id        UUID        NOT NULL REFERENCES shift_applications(id),
  worker_wm_id  TEXT        NOT NULL,
  status        TEXT        NOT NULL CHECK (status IN (
    'active', 'upcoming', 'completed', 'left', 'replaced', 'cancelled'
  )),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, worker_wm_id)
);

CREATE INDEX IF NOT EXISTS idx_shift_workspaces_post
  ON shift_workspaces (post_id, status);

-- Missing in design draft: list workspaces for a worker
CREATE INDEX IF NOT EXISTS idx_shift_workspaces_worker
  ON shift_workspaces (worker_wm_id, status);

CREATE TABLE IF NOT EXISTS shift_events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID        NOT NULL REFERENCES shift_posts(id),
  kind        TEXT        NOT NULL,
  actor_id    UUID        REFERENCES auth_users(id),
  meta        JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shift_events_post
  ON shift_events (post_id, created_at DESC);
