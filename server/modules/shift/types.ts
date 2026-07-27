/**
 * Shared Shift domain DB row types.
 * Shift MUST remain separate from Career tables.
 */

export type ShiftPostStatus = "active" | "completed" | "cancelled";

export type ShiftApplicationStatus =
  | "applied"
  | "shortlisted"
  | "waiting"
  | "confirmed"
  | "rejected"
  | "withdrawn"
  | "replaced"
  | "exited";

export type ShiftWorkspaceStatus =
  "active" | "upcoming" | "completed" | "left" | "replaced" | "cancelled";

export interface ShiftPostRow {
  id: string;
  employer_id: string;
  job_name: string;
  category: string;
  status: ShiftPostStatus;
  vacancies: number;
  start_at: Date;
  end_at: Date;
  details: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface ShiftApplicationRow {
  id: string;
  post_id: string;
  worker_wm_id: string;
  status: ShiftApplicationStatus;
  details: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface ShiftWorkspaceRow {
  id: string;
  post_id: string;
  app_id: string;
  worker_wm_id: string;
  status: ShiftWorkspaceStatus;
  created_at: Date;
  updated_at: Date;
}

export interface ShiftEventRow {
  id: string;
  post_id: string;
  kind: string;
  actor_id: string | null;
  meta: Record<string, unknown> | null;
  created_at: Date;
}
