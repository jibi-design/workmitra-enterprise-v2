-- Career Lifecycle — Job Mitra
-- Migration 002: career_posts, career_applications, career_offers,
--                career_employments, career_lifecycle_events
--
-- Career Employment Gate (3-step, strictly enforced):
--   Step 1 — Employer issues offer   → application.status = 'offer_issued'
--   Step 2 — Employee accepts offer  → application.status = 'offer_accepted'
--   Step 3 — Employer confirms hire  → application.status = 'hired'
--                                    → career_employments row created (ONCE, idempotent)
--
-- SHIFT JOBS MUST NEVER USE THESE TABLES. Shift lifecycle is separate.

CREATE TABLE IF NOT EXISTS career_posts (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_user_id   UUID        NOT NULL REFERENCES auth_users(id) ON DELETE RESTRICT,
  title              TEXT        NOT NULL,
  description        TEXT        NOT NULL,
  location           TEXT,
  status             TEXT        NOT NULL DEFAULT 'draft'
                                 CHECK (status IN ('draft', 'published', 'closed', 'deleted')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT career_posts_title_not_empty       CHECK (length(trim(title)) > 0),
  CONSTRAINT career_posts_description_not_empty CHECK (length(trim(description)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_career_posts_employer
  ON career_posts (employer_user_id, status);
CREATE INDEX IF NOT EXISTS idx_career_posts_published
  ON career_posts (status, created_at DESC) WHERE status = 'published';

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS career_applications (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id           UUID        NOT NULL REFERENCES career_posts(id) ON DELETE RESTRICT,
  applicant_user_id UUID        NOT NULL REFERENCES auth_users(id)  ON DELETE RESTRICT,
  status            TEXT        NOT NULL DEFAULT 'pending'
                                CHECK (status IN (
                                  'pending', 'shortlisted', 'interview_scheduled',
                                  'offer_issued', 'offer_accepted', 'offer_declined',
                                  'hired', 'rejected', 'withdrawn'
                                )),
  cover_note        TEXT,
  applied_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Prevents an employee from applying to the same post twice
  CONSTRAINT career_applications_unique_applicant_post UNIQUE (post_id, applicant_user_id)
);

CREATE INDEX IF NOT EXISTS idx_career_applications_post
  ON career_applications (post_id, status);
CREATE INDEX IF NOT EXISTS idx_career_applications_applicant
  ON career_applications (applicant_user_id, status);

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS career_offers (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id   UUID        NOT NULL REFERENCES career_applications(id) ON DELETE RESTRICT,
  employer_user_id UUID        NOT NULL REFERENCES auth_users(id) ON DELETE RESTRICT,
  status           TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'withdrawn')),
  terms            JSONB       NOT NULL DEFAULT '{}',
  offered_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at       TIMESTAMPTZ,
  accepted_at      TIMESTAMPTZ,
  declined_at      TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- One active offer per application — prevents double-offer
  CONSTRAINT career_offers_unique_application UNIQUE (application_id),
  CONSTRAINT career_offers_terms_is_object    CHECK (jsonb_typeof(terms) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_career_offers_application
  ON career_offers (application_id, status);

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS career_employments (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id   UUID        NOT NULL REFERENCES career_applications(id) ON DELETE RESTRICT,
  post_id          UUID        NOT NULL REFERENCES career_posts(id)         ON DELETE RESTRICT,
  employee_user_id UUID        NOT NULL REFERENCES auth_users(id)           ON DELETE RESTRICT,
  employer_user_id UUID        NOT NULL REFERENCES auth_users(id)           ON DELETE RESTRICT,
  status           TEXT        NOT NULL DEFAULT 'active'
                               CHECK (status IN ('active', 'resigned', 'terminated')),
  confirmed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- PRIMARY idempotency constraint: one Employment record per application, ever.
  -- ON CONFLICT (application_id) DO NOTHING makes confirm-hire safe to call twice.
  CONSTRAINT career_employments_unique_application UNIQUE (application_id)
);

CREATE INDEX IF NOT EXISTS idx_career_employments_employee
  ON career_employments (employee_user_id, status);
CREATE INDEX IF NOT EXISTS idx_career_employments_employer
  ON career_employments (employer_user_id, status);

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS career_lifecycle_events (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID        NOT NULL REFERENCES career_applications(id) ON DELETE RESTRICT,
  actor_user_id  UUID        NOT NULL REFERENCES auth_users(id)          ON DELETE RESTRICT,
  actor_role     TEXT        NOT NULL CHECK (actor_role IN ('employee', 'employer', 'admin')),
  event_type     TEXT        NOT NULL CHECK (length(trim(event_type)) > 0),
  previous_status TEXT,
  new_status      TEXT,
  metadata       JSONB       NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT career_lifecycle_events_metadata_is_object CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_career_lifecycle_application
  ON career_lifecycle_events (application_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_career_lifecycle_actor
  ON career_lifecycle_events (actor_user_id, created_at DESC);
