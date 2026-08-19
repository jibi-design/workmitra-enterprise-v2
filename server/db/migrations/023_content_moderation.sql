-- Content reports / moderation cases (Shift and Career isolated by domain).
-- target_post_id is TEXT so local jm_* ids and server UUIDs both store.

CREATE TABLE IF NOT EXISTS content_reports (
  report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL CHECK (domain IN ('shift', 'career')),
  target_post_id TEXT NOT NULL,
  target_employer_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
  reporter_employee_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  reason_code TEXT NOT NULL CHECK (reason_code IN (
    'fake_pay', 'asks_money', 'harassment', 'discriminatory', 'duplicate_spam', 'other'
  )),
  note TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN (
    'submitted', 'in_review', 'upheld', 'dismissed', 'duplicate'
  )),
  weight NUMERIC(6, 2) NOT NULL DEFAULT 1,
  snapshot_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT content_reports_note_len CHECK (note IS NULL OR char_length(note) <= 500),
  CONSTRAINT content_reports_snapshot_obj CHECK (jsonb_typeof(snapshot_json) = 'object'),
  CONSTRAINT content_reports_unique_reporter UNIQUE (reporter_employee_id, domain, target_post_id)
);

CREATE INDEX IF NOT EXISTS idx_content_reports_case
  ON content_reports (domain, target_post_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_reports_reporter_created
  ON content_reports (reporter_employee_id, created_at DESC);

CREATE TABLE IF NOT EXISTS content_report_cases (
  case_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL CHECK (domain IN ('shift', 'career')),
  target_post_id TEXT NOT NULL,
  employer_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
  open_count INT NOT NULL DEFAULT 0,
  weighted_score NUMERIC(8, 2) NOT NULL DEFAULT 0,
  queue_status TEXT NOT NULL DEFAULT 'open' CHECK (queue_status IN (
    'open', 'triage', 'held', 'cleared', 'removed'
  )),
  hidden_at TIMESTAMPTZ,
  hidden_reason TEXT CHECK (hidden_reason IS NULL OR hidden_reason IN ('admin', 'auto_hold')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT content_report_cases_unique_target UNIQUE (domain, target_post_id)
);

CREATE INDEX IF NOT EXISTS idx_content_report_cases_queue
  ON content_report_cases (queue_status, updated_at DESC);

CREATE TABLE IF NOT EXISTS content_moderation_actions (
  action_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES content_report_cases(case_id) ON DELETE CASCADE,
  actor_admin_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE RESTRICT,
  action TEXT NOT NULL CHECK (action IN (
    'dismiss', 'hide', 'restore', 'remove', 'warn'
  )),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT content_moderation_actions_note_len CHECK (note IS NULL OR char_length(note) <= 500)
);

CREATE INDEX IF NOT EXISTS idx_content_moderation_actions_case
  ON content_moderation_actions (case_id, created_at DESC);

COMMENT ON TABLE content_reports IS
  'Employee reports of Shift or Career postings. Domain isolates Shift from Career.';
