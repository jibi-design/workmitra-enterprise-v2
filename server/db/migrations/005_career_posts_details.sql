-- Career posts details payload (Phase 12B)
-- Stores rich client CareerJobPost fields while keeping columnar SoT for id/status/title.
-- Layer 5: fully idempotent (safe re-run / partial-failure recovery).

ALTER TABLE career_posts
  ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'career_posts_details_is_object'
  ) THEN
    ALTER TABLE career_posts
      ADD CONSTRAINT career_posts_details_is_object
      CHECK (jsonb_typeof(details) = 'object');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_career_posts_employer_updated
  ON career_posts (employer_user_id, updated_at DESC)
  WHERE status != 'deleted';
