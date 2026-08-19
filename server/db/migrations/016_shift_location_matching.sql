-- Location matching: job-site pincode column + employee commute profile + availability broadcasts.
-- Idempotent. Old posts may keep NULL location_pincode; live create/update is fail-closed in service.

ALTER TABLE shift_posts
  ADD COLUMN IF NOT EXISTS location_pincode TEXT;

UPDATE shift_posts
SET location_pincode = NULLIF(BTRIM(details->>'locationPincode'), '')
WHERE location_pincode IS NULL
  AND details ? 'locationPincode'
  AND details->>'locationPincode' ~ '^[1-9][0-9]{5}$';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'shift_posts_location_pincode_chk'
  ) THEN
    ALTER TABLE shift_posts
      ADD CONSTRAINT shift_posts_location_pincode_chk
      CHECK (location_pincode IS NULL OR location_pincode ~ '^[1-9][0-9]{5}$');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_shift_posts_location_pincode
  ON shift_posts (location_pincode)
  WHERE status = 'active' AND location_pincode IS NOT NULL;

CREATE TABLE IF NOT EXISTS employee_location_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
  base_pincode TEXT,
  commute_radius_km SMALLINT NOT NULL DEFAULT 10,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT employee_location_profiles_pincode_chk
    CHECK (base_pincode IS NULL OR base_pincode ~ '^[1-9][0-9]{5}$'),
  CONSTRAINT employee_location_profiles_radius_chk
    CHECK (commute_radius_km IN (0, 5, 10, 15))
);

CREATE TABLE IF NOT EXISTS shift_availability_broadcasts (
  worker_user_id UUID PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
  worker_ml_id TEXT NOT NULL,
  selected_dates DATE[] NOT NULL DEFAULT '{}',
  base_pincode TEXT,
  commute_radius_km SMALLINT NOT NULL DEFAULT 10,
  city TEXT,
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT shift_availability_broadcasts_pincode_chk
    CHECK (base_pincode IS NULL OR base_pincode ~ '^[1-9][0-9]{5}$'),
  CONSTRAINT shift_availability_broadcasts_radius_chk
    CHECK (commute_radius_km IN (0, 5, 10, 15))
);

CREATE INDEX IF NOT EXISTS idx_shift_availability_broadcasts_active
  ON shift_availability_broadcasts (base_pincode)
  WHERE cardinality(selected_dates) > 0;
