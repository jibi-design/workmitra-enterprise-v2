-- Phase 13: Shift posts/applications rich details (DB SoT + LS cache merge)

ALTER TABLE shift_posts
  ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE shift_posts
  DROP CONSTRAINT IF EXISTS shift_posts_details_is_object;

ALTER TABLE shift_posts
  ADD CONSTRAINT shift_posts_details_is_object
  CHECK (jsonb_typeof(details) = 'object');

ALTER TABLE shift_applications
  ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE shift_applications
  DROP CONSTRAINT IF EXISTS shift_applications_details_is_object;

ALTER TABLE shift_applications
  ADD CONSTRAINT shift_applications_details_is_object
  CHECK (jsonb_typeof(details) = 'object');
