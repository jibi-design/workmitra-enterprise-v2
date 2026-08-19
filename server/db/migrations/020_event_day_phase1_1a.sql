-- Event Day Phase-1.1a — isolated pass / gate PIN / check-in tables.
-- Operator approved apply 020 (2026-08-17). Isolated from Shift, Career, Planner, HR, Workforce.

CREATE TABLE IF NOT EXISTS event_day_passes (
  pass_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issuer_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL,
  guest_name TEXT NOT NULL,
  candidate_ref TEXT,
  event_name TEXT,
  venue_name TEXT NOT NULL,
  venue_address TEXT,
  purpose TEXT NOT NULL CHECK (purpose IN ('interview', 'event', 'venue', 'generic')),
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'revoked', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT event_day_passes_token_hash_unique UNIQUE (token_hash),
  CONSTRAINT event_day_passes_window_chk CHECK (valid_until > valid_from),
  CONSTRAINT event_day_passes_guest_name_len CHECK (char_length(guest_name) BETWEEN 1 AND 120),
  CONSTRAINT event_day_passes_venue_name_len CHECK (char_length(venue_name) BETWEEN 1 AND 160),
  CONSTRAINT event_day_passes_token_hash_hex CHECK (token_hash ~ '^[0-9a-f]{64}$')
);

CREATE INDEX IF NOT EXISTS idx_event_day_passes_issuer_updated
  ON event_day_passes (issuer_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_event_day_passes_issuer_window
  ON event_day_passes (issuer_id, valid_from);

CREATE TABLE IF NOT EXISTS event_day_gate_pins (
  issuer_id UUID PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
  pin_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT event_day_gate_pins_hash_len CHECK (char_length(pin_hash) BETWEEN 20 AND 255)
);

CREATE TABLE IF NOT EXISTS event_day_check_ins (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pass_id UUID NOT NULL REFERENCES event_day_passes(pass_id) ON DELETE CASCADE,
  issuer_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  staff_name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('check_in', 'scan_verify')),
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  device_id TEXT,
  CONSTRAINT event_day_check_ins_staff_name_len CHECK (char_length(staff_name) BETWEEN 1 AND 120)
);

CREATE INDEX IF NOT EXISTS idx_event_day_check_ins_issuer_verified
  ON event_day_check_ins (issuer_id, verified_at DESC);

CREATE INDEX IF NOT EXISTS idx_event_day_check_ins_pass
  ON event_day_check_ins (pass_id, verified_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_event_day_check_ins_one_pin_entry
  ON event_day_check_ins (pass_id)
  WHERE action = 'check_in';

COMMENT ON TABLE event_day_passes IS
  'Event Day door passes. token_hash = SHA-256 hex of opaque QR token. No plaintext token. No guest_contact in 1.1a.';
COMMENT ON TABLE event_day_gate_pins IS
  'Per-issuer gate PIN hash only. Never store or return plaintext PIN.';
COMMENT ON TABLE event_day_check_ins IS
  'PIN check_in is once per pass. scan_verify may repeat. Do not store pass tokens here.';

DO $$
DECLARE
  t text;
  has_anon boolean;
  has_authenticated boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') INTO has_anon;
  SELECT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated')
    INTO has_authenticated;

  FOREACH t IN ARRAY ARRAY[
    'event_day_passes',
    'event_day_gate_pins',
    'event_day_check_ins'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I_no_postgrest ON public.%I', t, t);

    IF has_anon AND has_authenticated THEN
      EXECUTE format(
        'CREATE POLICY %I_no_postgrest ON public.%I
           AS RESTRICTIVE FOR ALL TO anon, authenticated
           USING (false) WITH CHECK (false)',
        t, t
      );
    ELSIF has_anon THEN
      EXECUTE format(
        'CREATE POLICY %I_no_postgrest ON public.%I
           AS RESTRICTIVE FOR ALL TO anon
           USING (false) WITH CHECK (false)',
        t, t
      );
    ELSIF has_authenticated THEN
      EXECUTE format(
        'CREATE POLICY %I_no_postgrest ON public.%I
           AS RESTRICTIVE FOR ALL TO authenticated
           USING (false) WITH CHECK (false)',
        t, t
      );
    END IF;

    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', t);
    IF has_anon THEN
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon', t);
    END IF;
    IF has_authenticated THEN
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM authenticated', t);
    END IF;
  END LOOP;
END $$;
