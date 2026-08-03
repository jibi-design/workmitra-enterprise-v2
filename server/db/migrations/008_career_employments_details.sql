-- Phase 16 — career_employments details JSONB for client-rich employment cache
-- Layer 5: fully idempotent (safe re-run / partial-failure recovery).

ALTER TABLE career_employments
  ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'career_employments_details_is_object'
  ) THEN
    ALTER TABLE career_employments
      ADD CONSTRAINT career_employments_details_is_object
      CHECK (jsonb_typeof(details) = 'object');
  END IF;
END $$;
