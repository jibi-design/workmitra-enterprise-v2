-- Phase 17 — HR operational tables (DB-authoritative when auth on)
-- Tenant scope: employer_user_id = auth_users.id (employer session).
-- Client-rich payloads live in details JSONB; query columns stay normalized.

-- Leave requests
CREATE TABLE IF NOT EXISTS hr_leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  employee_user_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
  employee_ml_id TEXT NOT NULL DEFAULT '',
  hr_candidate_id TEXT NOT NULL DEFAULT '',
  leave_type TEXT NOT NULL
    CHECK (leave_type IN ('annual', 'sick', 'casual', 'unpaid')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  from_date TIMESTAMPTZ NOT NULL,
  to_date TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT hr_leave_requests_details_is_object
    CHECK (jsonb_typeof(details) = 'object'),
  CONSTRAINT hr_leave_requests_date_order CHECK (to_date >= from_date)
);

CREATE INDEX IF NOT EXISTS idx_hr_leave_employer_created
  ON hr_leave_requests (employer_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hr_leave_employee
  ON hr_leave_requests (employee_user_id)
  WHERE employee_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_hr_leave_status
  ON hr_leave_requests (employer_user_id, status);

-- Attendance logs
CREATE TABLE IF NOT EXISTS hr_attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  employee_user_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
  employee_ml_id TEXT NOT NULL DEFAULT '',
  hr_candidate_id TEXT NOT NULL DEFAULT '',
  work_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'present'
    CHECK (status IN ('present', 'absent', 'leave', 'off')),
  notes TEXT NOT NULL DEFAULT '',
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT hr_attendance_logs_details_is_object
    CHECK (jsonb_typeof(details) = 'object'),
  CONSTRAINT hr_attendance_logs_unique_day
    UNIQUE (employer_user_id, hr_candidate_id, work_date)
);

CREATE INDEX IF NOT EXISTS idx_hr_attendance_employer_date
  ON hr_attendance_logs (employer_user_id, work_date DESC);
CREATE INDEX IF NOT EXISTS idx_hr_attendance_employee
  ON hr_attendance_logs (employee_user_id)
  WHERE employee_user_id IS NOT NULL;

-- Performance reviews
CREATE TABLE IF NOT EXISTS hr_performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  employee_user_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
  employee_ml_id TEXT NOT NULL DEFAULT '',
  hr_candidate_id TEXT NOT NULL DEFAULT '',
  period_label TEXT NOT NULL DEFAULT '',
  period_from TIMESTAMPTZ,
  period_to TIMESTAMPTZ,
  rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  feedback TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'sent'
    CHECK (status IN ('sent', 'acknowledged', 'disputed')),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT hr_performance_reviews_details_is_object
    CHECK (jsonb_typeof(details) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_hr_perf_employer_created
  ON hr_performance_reviews (employer_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hr_perf_employee
  ON hr_performance_reviews (employee_user_id)
  WHERE employee_user_id IS NOT NULL;

-- Incident reports
CREATE TABLE IF NOT EXISTS hr_incident_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  employee_user_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
  employee_ml_id TEXT NOT NULL DEFAULT '',
  hr_candidate_id TEXT NOT NULL DEFAULT '',
  incident_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  incident_type TEXT NOT NULL DEFAULT 'general',
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'reported'
    CHECK (status IN ('reported', 'acknowledged', 'in_progress', 'resolved')),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT hr_incident_reports_details_is_object
    CHECK (jsonb_typeof(details) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_hr_incident_employer_created
  ON hr_incident_reports (employer_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hr_incident_employee
  ON hr_incident_reports (employee_user_id)
  WHERE employee_user_id IS NOT NULL;

-- Company notices
CREATE TABLE IF NOT EXISTS hr_company_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT hr_company_notices_details_is_object
    CHECK (jsonb_typeof(details) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_hr_notices_employer_posted
  ON hr_company_notices (employer_user_id, posted_at DESC);

-- Letter templates / issued letters (client stores issued LetterRecord in letters_v1)
CREATE TABLE IF NOT EXISTS hr_letter_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  letter_type TEXT NOT NULL DEFAULT 'general',
  content TEXT NOT NULL DEFAULT '',
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT hr_letter_templates_details_is_object
    CHECK (jsonb_typeof(details) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_hr_letters_employer_created
  ON hr_letter_templates (employer_user_id, created_at DESC);

-- Roster plans (one row per day assignment; shifts/assignments in details)
CREATE TABLE IF NOT EXISTS hr_roster_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  period_label TEXT NOT NULL DEFAULT '',
  period_start DATE,
  period_end DATE,
  shifts JSONB NOT NULL DEFAULT '[]'::jsonb,
  assignments JSONB NOT NULL DEFAULT '[]'::jsonb,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT hr_roster_plans_details_is_object
    CHECK (jsonb_typeof(details) = 'object'),
  CONSTRAINT hr_roster_plans_shifts_is_array
    CHECK (jsonb_typeof(shifts) = 'array'),
  CONSTRAINT hr_roster_plans_assignments_is_array
    CHECK (jsonb_typeof(assignments) = 'array')
);

CREATE INDEX IF NOT EXISTS idx_hr_roster_employer_created
  ON hr_roster_plans (employer_user_id, created_at DESC);

-- Staff availability fill-requests
CREATE TABLE IF NOT EXISTS hr_staff_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  employee_user_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
  employee_ml_id TEXT NOT NULL DEFAULT '',
  date_range_start DATE,
  date_range_end DATE,
  available_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT hr_staff_availability_details_is_object
    CHECK (jsonb_typeof(details) = 'object'),
  CONSTRAINT hr_staff_availability_hours_is_object
    CHECK (jsonb_typeof(available_hours) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_hr_staff_avail_employer_created
  ON hr_staff_availability (employer_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hr_staff_avail_employee
  ON hr_staff_availability (employee_user_id)
  WHERE employee_user_id IS NOT NULL;

-- Task assignments
CREATE TABLE IF NOT EXISTS hr_task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  employee_user_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
  employee_ml_id TEXT NOT NULL DEFAULT '',
  hr_candidate_id TEXT NOT NULL DEFAULT '',
  task_title TEXT NOT NULL DEFAULT '',
  due_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'assigned'
    CHECK (status IN ('assigned', 'in_progress', 'completed')),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT hr_task_assignments_details_is_object
    CHECK (jsonb_typeof(details) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_hr_tasks_employer_created
  ON hr_task_assignments (employer_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hr_tasks_employee
  ON hr_task_assignments (employee_user_id)
  WHERE employee_user_id IS NOT NULL;

-- Employer private notes
CREATE TABLE IF NOT EXISTS hr_employer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  employee_user_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
  employee_ml_id TEXT NOT NULL DEFAULT '',
  hr_candidate_id TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT hr_employer_notes_details_is_object
    CHECK (jsonb_typeof(details) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_hr_notes_employer_created
  ON hr_employer_notes (employer_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hr_notes_employee
  ON hr_employer_notes (employee_user_id)
  WHERE employee_user_id IS NOT NULL;
