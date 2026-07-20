// App name: Job Mitra
// File name: shiftApplicationTypes.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\types\shiftApplicationTypes.ts

export type ExperienceLabel = "helper" | "fresher_ok" | "experienced";

export type ShiftApplicationStatus =
  | "applied"
  | "shortlisted"
  | "waiting"
  | "confirmed"
  | "rejected"
  | "withdrawn"
  | "replaced"
  | "exited";

export type AnswerState = "meets" | "not_sure" | "dont_meet";

export type ShiftPostData = {
  id: string;
  companyName: string;
  jobName: string;
  experience: ExperienceLabel;
  payPerDay: number;
  locationName: string;
  locationAddress?: string;
  mapsLink?: string;
  startAt: number;
  endAt: number;
  isHiddenFromSearch?: boolean;
  shiftType?: string;
};

export type ShiftApplicationData = {
  id: string;
  postId: string;
  createdAt: number;
  status: ShiftApplicationStatus;
  mustHaveAnswers: Record<string, AnswerState>;
  goodToHaveAnswers: Record<string, AnswerState>;
  notes: Record<string, string>;
  withdrawnAt?: number;
  attendanceConfirmedAt?: number;
  replacedAt?: number;
  replacedReason?: "no_show" | "schedule_change" | "quality_issue" | "other";
  planId?: string;
  planApplyBatchId?: string;
  selectedDates?: string[];
};

export type ApplicationTab = "all" | "active" | "confirmed" | "closed";
