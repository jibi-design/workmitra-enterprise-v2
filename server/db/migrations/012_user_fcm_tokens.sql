-- Wave-5.1: FCM device tokens bound to auth user (R3)

CREATE TABLE IF NOT EXISTS user_fcm_tokens (
  user_id     TEXT        PRIMARY KEY,
  fcm_token   TEXT        NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_fcm_tokens_updated
  ON user_fcm_tokens (updated_at DESC);
