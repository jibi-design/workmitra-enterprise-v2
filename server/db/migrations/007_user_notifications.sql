-- Phase 15 — User notifications inbox (DB-authoritative when auth on)
-- Recipient is auth_users.id; recipient_ml_id keeps Mitra Labs ID for audit/fallback.

CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
  recipient_ml_id TEXT NOT NULL DEFAULT '',
  domain TEXT NOT NULL
    CHECK (domain IN ('shift', 'career', 'workforce', 'employment', 'system')),
  event_type TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  route TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ,
  CONSTRAINT user_notifications_recipient_present
    CHECK (recipient_user_id IS NOT NULL OR length(trim(recipient_ml_id)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_recipient_created
  ON user_notifications (recipient_user_id, created_at DESC)
  WHERE recipient_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_notifications_ml_created
  ON user_notifications (upper(recipient_ml_id), created_at DESC)
  WHERE length(trim(recipient_ml_id)) > 0;

CREATE INDEX IF NOT EXISTS idx_user_notifications_unread
  ON user_notifications (recipient_user_id, is_read)
  WHERE recipient_user_id IS NOT NULL AND is_read = false;
