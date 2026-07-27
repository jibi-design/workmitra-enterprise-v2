export interface ApiEnvelope<T> {
  data: T;
  meta?: { requestId?: string };
}

export type ServerCareerApplicationDto = {
  id: string;
  post_id: string;
  applicant_user_id: string;
  status: string;
  cover_note: string | null;
  applied_at: string;
  updated_at: string;
};

export type ServerCareerPostDto = {
  id: string;
  employer_user_id: string;
  title: string;
  description: string;
  location: string | null;
  status: string;
  details: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ServerCareerEmploymentDto = {
  id: string;
  application_id: string;
  post_id: string;
  employee_user_id: string;
  employer_user_id: string;
  status: string;
  details: Record<string, unknown>;
  confirmed_at: string;
  created_at: string;
  updated_at: string;
};

export const EMPLOYER_CAREER = "/v1/jobmitra/employer/career";
export const EMPLOYEE_CAREER = "/v1/jobmitra/employee/career";
