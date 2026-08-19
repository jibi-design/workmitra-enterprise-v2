-- Career saved / bookmarked jobs (employee). SHIFT FAVORITES MUST NEVER USE THIS TABLE.

CREATE TABLE IF NOT EXISTS career_saved_jobs (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_user_id   UUID        NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  post_id            UUID        NOT NULL REFERENCES career_posts(id) ON DELETE CASCADE,
  saved_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT career_saved_jobs_unique_employee_post UNIQUE (employee_user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_career_saved_jobs_employee_saved
  ON career_saved_jobs (employee_user_id, saved_at DESC);
