/** Phase 17 — HR row types */

export type HrLeaveRequestRow = {
  id: string;
  employer_user_id: string;
  employee_user_id: string | null;
  employee_ml_id: string;
  hr_candidate_id: string;
  leave_type: string;
  status: string;
  from_date: Date | string;
  to_date: Date | string;
  reason: string;
  details: Record<string, unknown>;
  created_at: Date | string;
  updated_at: Date | string;
};

export type HrAttendanceLogRow = {
  id: string;
  employer_user_id: string;
  employee_user_id: string | null;
  employee_ml_id: string;
  hr_candidate_id: string;
  work_date: Date | string;
  status: string;
  notes: string;
  details: Record<string, unknown>;
  created_at: Date | string;
  updated_at: Date | string;
};

export type HrPerformanceReviewRow = {
  id: string;
  employer_user_id: string;
  employee_user_id: string | null;
  employee_ml_id: string;
  hr_candidate_id: string;
  period_label: string;
  period_from: Date | string | null;
  period_to: Date | string | null;
  rating: number | null;
  feedback: string;
  status: string;
  details: Record<string, unknown>;
  created_at: Date | string;
  updated_at: Date | string;
};

export type HrIncidentReportRow = {
  id: string;
  employer_user_id: string;
  employee_user_id: string | null;
  employee_ml_id: string;
  hr_candidate_id: string;
  incident_date: Date | string;
  incident_type: string;
  description: string;
  status: string;
  details: Record<string, unknown>;
  created_at: Date | string;
  updated_at: Date | string;
};

export type HrCompanyNoticeRow = {
  id: string;
  employer_user_id: string;
  title: string;
  content: string;
  posted_at: Date | string;
  expires_at: Date | string | null;
  details: Record<string, unknown>;
  created_at: Date | string;
  updated_at: Date | string;
};
