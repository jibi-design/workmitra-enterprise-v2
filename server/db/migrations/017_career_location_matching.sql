-- Career work-area matching. Idempotent. No availability dates.
-- Reuses employee_location_profiles.base_pincode. Shift radius CHECK unchanged.

ALTER TABLE career_posts
  ADD COLUMN IF NOT EXISTS location_pincode TEXT;

UPDATE career_posts
SET location_pincode = NULLIF(BTRIM(details->>'locationPincode'), '')
WHERE location_pincode IS NULL
  AND details ? 'locationPincode'
  AND details->>'locationPincode' ~ '^[1-9][0-9]{5}$';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'career_posts_location_pincode_chk'
  ) THEN
    ALTER TABLE career_posts
      ADD CONSTRAINT career_posts_location_pincode_chk
      CHECK (location_pincode IS NULL OR location_pincode ~ '^[1-9][0-9]{5}$');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_career_posts_location_pincode
  ON career_posts (location_pincode)
  WHERE status = 'published' AND location_pincode IS NOT NULL;

ALTER TABLE employee_location_profiles
  ADD COLUMN IF NOT EXISTS career_commute_radius_km SMALLINT NOT NULL DEFAULT 10;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'employee_location_profiles_career_radius_chk'
  ) THEN
    ALTER TABLE employee_location_profiles
      ADD CONSTRAINT employee_location_profiles_career_radius_chk
      CHECK (career_commute_radius_km IN (10, 25, 50, -1));
  END IF;
END $$;
