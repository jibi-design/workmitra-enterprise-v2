-- Event Day — per-event gate PIN hashes.
-- Canonical apply path: operator applies this SQL on jobmitra-enterprise-v2-dev.
-- Isolated from Shift, Career, Planner. Do not auto-migrate.
-- Until applied, unlock/save fall back to issuer-level event_day_gate_pins.

CREATE TABLE IF NOT EXISTS event_day_event_gate_pins (
  issuer_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  folder_id TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (issuer_id, folder_id),
  CONSTRAINT event_day_event_gate_pins_folder_len CHECK (char_length(folder_id) BETWEEN 8 AND 160),
  CONSTRAINT event_day_event_gate_pins_hash_len CHECK (char_length(pin_hash) BETWEEN 20 AND 255)
);

COMMENT ON TABLE event_day_event_gate_pins IS
  'Per-event folder gate PIN hash. Never store or return plaintext PIN.';
