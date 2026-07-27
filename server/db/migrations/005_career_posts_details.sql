-- Career posts details payload (Phase 12B)
-- Stores rich client CareerJobPost fields while keeping columnar SoT for id/status/title.

ALTER TABLE career_posts
  ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE career_posts
  DROP CONSTRAINT IF EXISTS career_posts_details_is_object;

ALTER TABLE career_posts
  ADD CONSTRAINT career_posts_details_is_object
  CHECK (jsonb_typeof(details) = 'object');

CREATE INDEX IF NOT EXISTS idx_career_posts_employer_updated
  ON career_posts (employer_user_id, updated_at DESC)
  WHERE status != 'deleted';
