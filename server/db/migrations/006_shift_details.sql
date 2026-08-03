-- Phase 13: Shift posts/applications rich details (DB SoT + LS cache merge)
-- Layer 5: fully idempotent (safe re-run / partial-failure recovery).

ALTER TABLE shift_posts
  ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'shift_posts_details_is_object'
  ) THEN
    ALTER TABLE shift_posts
      ADD CONSTRAINT shift_posts_details_is_object
      CHECK (jsonb_typeof(details) = 'object');
  END IF;
END $$;

ALTER TABLE shift_applications
  ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'shift_applications_details_is_object'
  ) THEN
    ALTER TABLE shift_applications
      ADD CONSTRAINT shift_applications_details_is_object
      CHECK (jsonb_typeof(details) = 'object');
  END IF;
END $$;
