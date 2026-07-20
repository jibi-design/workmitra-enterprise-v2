// App name: Job Mitra
// File name: shiftPostApply.types.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\types\shiftPostApply.types.ts

import type { AnswerState } from "../helpers/shiftApplyHelpers";

export type ShiftApplicationStatus =
  | "applied"
  | "shortlisted"
  | "waiting"
  | "confirmed"
  | "rejected"
  | "withdrawn"
  | "replaced"
  | "exited";

export type ShiftReplacementReason = "no_show" | "schedule_change" | "quality_issue" | "other";

export type ShiftApplicationRecord = {
  id: string;
  postId: string;
  createdAt: number;
  status: ShiftApplicationStatus;
  profileSnapshot?: {
    uniqueId?: string;
    fullName?: string;
    city?: string;
    experience?: string;
    skills?: string[];
    languages?: string[];
  };
  mustHaveAnswers: Record<string, AnswerState>;
  goodToHaveAnswers: Record<string, AnswerState>;
  notes: Record<string, string>;
  withdrawnAt?: number;
  attendanceConfirmedAt?: number;
  replacedAt?: number;
  replacedReason?: ShiftReplacementReason;
  quickAnswers?: Record<string, "yes" | "no">;
};

export type WorkspaceStatus = "active" | "upcoming" | "completed" | "left" | "replaced";

export type WorkspaceRecord = {
  id: string;
  postId: string;
  status: WorkspaceStatus;
};
