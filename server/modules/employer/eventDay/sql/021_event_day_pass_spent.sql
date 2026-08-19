-- Event Day Phase-1 gate — spent_at single-consume flag.
-- Canonical apply path: operator applies this SQL on jobmitra-enterprise-v2-dev.
-- Isolated from Shift, Career, Planner. Do not auto-migrate.
-- Unique check_in index on event_day_check_ins remains the live lock until this is applied.

ALTER TABLE event_day_passes
  ADD COLUMN IF NOT EXISTS spent_at TIMESTAMPTZ;

COMMENT ON COLUMN event_day_passes.spent_at IS
  'Set once when gate confirms entry. NULL means not consumed.';
