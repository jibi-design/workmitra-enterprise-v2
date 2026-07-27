/** Phase 17 — Workforce row types */

export type WorkforceGroupRow = {
  id: string;
  employer_user_id: string;
  name: string;
  description: string;
  status: string;
  details: Record<string, unknown>;
  created_at: Date | string;
  updated_at: Date | string;
};

export type WorkforceGroupMemberRow = {
  id: string;
  group_id: string;
  employee_user_id: string | null;
  employee_ml_id: string;
  role: string;
  status: string;
  joined_at: Date | string;
  details: Record<string, unknown>;
  created_at: Date | string;
  updated_at: Date | string;
};
