-- Wave-5: server-side direct invite proof + confirm idempotency

CREATE TABLE IF NOT EXISTS shift_direct_invites (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id       UUID        NOT NULL REFERENCES shift_posts(id) ON DELETE CASCADE,
  employer_id   UUID        NOT NULL REFERENCES auth_users(id),
  worker_wm_id  TEXT        NOT NULL,
  token         TEXT        NOT NULL UNIQUE,
  status        TEXT        NOT NULL CHECK (status IN (
    'pending', 'accepted', 'declined', 'expired', 'consumed'
  )),
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consumed_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_shift_direct_invites_post_worker
  ON shift_direct_invites (post_id, worker_wm_id, status);

CREATE TABLE IF NOT EXISTS api_idempotency_keys (
  actor_id       TEXT        NOT NULL,
  idem_key       TEXT        NOT NULL,
  http_status    INT         NOT NULL,
  response_json  JSONB       NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (actor_id, idem_key)
);

CREATE INDEX IF NOT EXISTS idx_api_idempotency_created
  ON api_idempotency_keys (created_at);
