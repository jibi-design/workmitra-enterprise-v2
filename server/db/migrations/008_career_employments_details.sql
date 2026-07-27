-- Phase 16 — career_employments details JSONB for client-rich employment cache

ALTER TABLE career_employments
  ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE career_employments
  DROP CONSTRAINT IF EXISTS career_employments_details_is_object;

ALTER TABLE career_employments
  ADD CONSTRAINT career_employments_details_is_object
  CHECK (jsonb_typeof(details) = 'object');
