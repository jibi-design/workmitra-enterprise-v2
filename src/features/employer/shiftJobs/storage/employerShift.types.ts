// App name: Job Mitra
// File name: employerShift.types.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\storage\employerShift.types.ts

export type ExperienceLabel = "helper" | "fresher_ok" | "experienced";

export type ShiftCategory = string;

export type AnalysisStatus = "not_started" | "done";

export type ShiftPayBasis = "per_hour" | "per_day" | "fixed_total" | "not_listed";

export type ApplicantStatus =
  | "applied"
  | "shortlisted"
  | "waiting"
  | "confirmed"
  | "rejected"
  | "withdrawn"
  | "replaced"
  | "exited";

export type PriorityTag = "priority" | "good" | "review";

export type PostSettings = {
  backupSlots: number;
  autoPromoteBackup: boolean;
  notifyBackup: boolean;
};

export type ShiftQuickQuestion = {
  id: string;
  text: string;
};

export type ShiftPostStatus = "active" | "completed" | "cancelled";

export type ShiftPost = {
  id: string;
  companyName: string;
  jobName: string;
  category: ShiftCategory;
  experience: ExperienceLabel;
  payPerDay: number;
  payBasis?: ShiftPayBasis;
  locationName: string;
  locationPincode?: string;
  locationAddress?: string;
  distanceKm: number;
  startAt: number;
  endAt: number;
  description?: string;
  shiftTiming?: string;
  mapsLink?: string;
  isHiddenFromSearch?: boolean;
  planId?: string;
  planSlotDate?: string;
  source?: "planner" | "single";
  /** Formal Shift Ops site UUID (group link) — used by confirm / membership. */
  siteId?: string;
  mustHave: string[];
  goodToHave: string[];
  whatWeProvide?: string[];
  quickQuestions?: ShiftQuickQuestion[];
  dressCode?: string;
  jobType?: "one-time" | "weekly" | "custom";
  vacancies: number;
  waitingBuffer: number;
  analysisStatus: AnalysisStatus;
  analyzedAt?: number;
  analysisNote?: string;
  shortlistIds: string[];
  waitingIds: string[];
  confirmedIds: string[];
  rejectedIds: string[];
  status?: ShiftPostStatus;
  settings?: PostSettings;
};

export type ApplicantProfileSnapshot = {
  uniqueId?: string;
  fullName?: string;
  city?: string;
  experience?: string;
  skills?: string[];
  languages?: string[];
};

export type RequirementAnswer = "meets" | "not_sure" | "dont_meet";

export type EmployeeShiftApplication = {
  id: string;
  postId: string;
  createdAt: number;
  status: ApplicantStatus;
  /** Client clock when status last moved (shortlist/wait/reject/confirm path). */
  statusChangedAt?: number;
  profileSnapshot?: ApplicantProfileSnapshot;
  mustHaveAnswers: Record<string, RequirementAnswer>;
  goodToHaveAnswers: Record<string, RequirementAnswer>;
  notes: Record<string, string>;
  withdrawnAt?: number;
  /** Employee attendance intent (I'll be there) — local + details, not a clock-in. */
  attendanceConfirmedAt?: number;
  replacedAt?: number;
  replacedReason?: "no_show" | "schedule_change" | "quality_issue" | "other";
  quickAnswers?: Record<string, "yes" | "no">;
  rating?: 1 | 2 | 3 | 4 | 5;
  ratingComment?: string;
  ratedAt?: number;
  priorityTag?: PriorityTag;
  planId?: string;
  planApplyBatchId?: string;
  selectedDates?: string[];
};

export type EmployeeNotification = {
  id: string;
  domain: "shift" | "career" | "workforce";
  title: string;
  body?: string;
  createdAt: number;
  isRead: boolean;
  route?: string;
};

export type EmployeeWorkspaceUpdate = {
  id: string;
  createdAt: number;
  kind: "system" | "broadcast" | "direct";
  title: string;
  body?: string;
};

export type EmployeeWorkspace = {
  id: string;
  postId: string;
  appId?: string;
  workerMlId?: string;
  workerName?: string;
  companyName: string;
  jobName: string;
  category: ShiftCategory;
  locationName: string;
  locationAddress?: string;
  mapsLink?: string;
  startAt: number;
  endAt: number;
  status: "active" | "upcoming" | "completed" | "left" | "replaced" | "cancelled";
  lastActivityAt: number;
  unreadCount: number;
  updates: EmployeeWorkspaceUpdate[];
  exitedAt?: number;
  exitReason?: "emergency" | "sick" | "travel" | "other";
  exitNote?: string;
  replacedAt?: number;
  replacedReason?: "no_show" | "schedule_change" | "quality_issue" | "other";
  rating?: 1 | 2 | 3 | 4 | 5;
  ratingComment?: string;
  ratedAt?: number;
  employerRating?: number;
  employerRatingComment?: string;
  employerRatedAt?: number;
};

export type EmployerShiftActivityKind =
  | "post_created"
  | "post_closed"
  | "post_expired"
  | "analysis_run"
  | "analysis_reset"
  | "hidden"
  | "unhidden"
  | "move_shortlist"
  | "move_waiting"
  | "candidate_rejected"
  | "confirmed"
  | "replaced";

export type EmployerShiftActivityEntry = {
  id: string;
  postId: string;
  kind: EmployerShiftActivityKind;
  createdAt: number;
  title: string;
  body?: string;
  route?: string;
};

export type UnknownRecord = Record<string, unknown>;
