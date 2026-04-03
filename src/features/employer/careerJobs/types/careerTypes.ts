// src/features/employer/careerJobs/types/careerTypes.ts
//
// All Career Jobs domain type definitions.
// Pure types only — no logic, no imports, no side effects.

// ─────────────────────────────────────────────────────────────────────────────
// Career Job Post
// ─────────────────────────────────────────────────────────────────────────────

export type CareerJobType = "full-time" | "part-time" | "contract";

export type CareerWorkMode = "on-site" | "remote" | "hybrid";

export type CareerSalaryPeriod = "monthly" | "yearly";

export type CareerPostStatus = "draft" | "active" | "paused" | "closed" | "filled";

export type InterviewMode = "in-person" | "phone" | "video";

export type InterviewRoundConfig = {
  round: number;
  label: string;
  mode: InterviewMode;
};

export type CareerJobPost = {
  id: string;
  employerId: string;
  companyName: string;

  // ── Job Details ──
  jobTitle: string;
  department: string;
  jobType: CareerJobType;
  workMode: CareerWorkMode;
  location: string;

  // ── Compensation ──
  salaryMin: number;
  salaryMax: number;
  salaryPeriod: CareerSalaryPeriod;

  // ── Requirements ──
  experienceMin: number;
  experienceMax: number;
  qualifications: string[];
  skills: string[];
  description: string;
  responsibilities: string[];

  // ── Interview Pipeline Config ──
  interviewRounds: number;
  roundConfigs: InterviewRoundConfig[];

  // ── Status & Meta ──
  status: CareerPostStatus;
  createdAt: number;
  updatedAt: number;
  closingDate: number;

  // ── Screening Questions ──
  screeningQuestions?: { id: string; text: string }[];

  // ── Template Support ──
  isTemplate: boolean;
  templateName?: string;
  clonedFrom?: string;

  // ── Analytics (auto-computed on read) ──
  totalApplications: number;
  shortlisted: number;
  inInterview: number;
  offered: number;
  hired: number;
  rejected: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Career Application
// ─────────────────────────────────────────────────────────────────────────────

export type CareerApplicationStage =
  | "applied"
  | "shortlisted"
  | "interview"
  | "offered"
  | "hired"
  | "rejected"
  | "withdrawn";

export type RoundResultStatus =
  | "scheduled"
  | "pending"
  | "passed"
  | "failed"
  | "skipped"
  | "cancelled";

export type RoundResult = {
  round: number;
  label: string;
  status: RoundResultStatus;
  feedback: string;
  interviewMode: InterviewMode;
  scheduledDate?: string;
  scheduledTime?: string;
  location?: string;
  meetingLink?: string;
  completedAt?: number;
};

export type CareerApplicationProfileSnapshot = {
  uniqueId?: string;
  fullName?: string;
  city?: string;
  experience?: string;
  skills?: string[];
  languages?: string[];
};

export type CareerApplication = {
  id: string;
  jobId: string;
  employeeId: string;
  employeeName: string;
  employeePhone: string;

  // ── Application Data ──
  resumeSummary: string;
  coverNote: string;
  expectedSalary: number;
  noticePeriod: string;

  // ── Profile Snapshot ──
  profileSnapshot?: CareerApplicationProfileSnapshot;

  // ── Pipeline Status ──
  stage: CareerApplicationStage;
  currentRound: number;
  roundResults: RoundResult[];

  // ── Meta ──
  appliedAt: number;
  updatedAt: number;
  employerNotes: string;
  rejectionReason?: string;
  rejectedAt?: number;
  offeredAt?: number;
  offerDetails?: CareerOfferInput;
  hiredAt?: number;
 withdrawnAt?: number;
  screeningAnswers?: Record<string, "yes" | "no">;
};

// ─────────────────────────────────────────────────────────────────────────────
// Career Workspace (post-hire)
// ─────────────────────────────────────────────────────────────────────────────

export type CareerWorkspaceUpdateKind = "system" | "broadcast" | "direct";

export type CareerWorkspaceUpdate = {
  id: string;
  createdAt: number;
  kind: CareerWorkspaceUpdateKind;
  title: string;
  body?: string;
};

export type CareerWorkspaceStatus = "active" | "onboarding" | "completed" | "terminated";

export type CareerWorkspace = {
  id: string;
  jobId: string;
  companyName: string;
  jobTitle: string;
  department: string;
  location: string;
  status: CareerWorkspaceStatus;
  lastActivityAt: number;
  unreadCount: number;
  updates: CareerWorkspaceUpdate[];
  hiredAt: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Employer Activity Log
// ─────────────────────────────────────────────────────────────────────────────

export type EmployerCareerActivityKind =
  | "post_created"
  | "post_paused"
  | "post_resumed"
  | "post_closed"
  | "post_filled"
  | "candidate_shortlisted"
  | "candidate_rejected"
  | "interview_scheduled"
  | "interview_passed"
  | "interview_failed"
  | "offer_sent"
  | "candidate_hired"
  | "candidate_withdrawn";

export type EmployerCareerActivityEntry = {
  id: string;
  postId: string;
  kind: EmployerCareerActivityKind;
  createdAt: number;
  title: string;
  body?: string;
  route?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Employee Notification (shared system, domain: "career")
// ─────────────────────────────────────────────────────────────────────────────

export type CareerNotification = {
  id: string;
  domain: "career";
  title: string;
  body?: string;
  createdAt: number;
  isRead: boolean;
  route?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Interview Schedule Input (used by pipeline service)
// ─────────────────────────────────────────────────────────────────────────────

export type CareerOfferInput = {
  jobTitle: string;
  salary: number;
  salaryPeriod: CareerSalaryPeriod;
  startDate: string;
  noticePeriodDays: 0 | 7 | 14 | 30;
  message?: string;
};

export type InterviewScheduleInput = {
  scheduledDate: string;
  scheduledTime: string;
  mode: InterviewMode;
  location?: string;
  meetingLink?: string;
};