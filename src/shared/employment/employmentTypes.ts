// src/shared/employment/employmentTypes.ts
// Session 17: Employment lifecycle type definitions.
// Shared between employer and employee career sections.

/* ── Employment Statuses ── */
export type EmploymentStatus =
  | "selected"     // Employer offered, employee accepted
  | "working"      // Employer marked as joined
  | "notice"       // Employee resigned, notice period active
  | "resigned"     // Employee resigned, pending employer confirm (no notice / notice ended)
  | "completed";   // Employment ended (resign confirmed OR terminated), rating unlocked

/** How the employment ended — null while still active. */
export type ExitType = "resigned" | "terminated" | null;

/* ── Notice Period ── */
export type NoticePeriodDays = 0 | 7 | 14 | 30;

export const NOTICE_PERIOD_OPTIONS: readonly { value: NoticePeriodDays; label: string }[] = [
  { value: 0, label: "None" },
  { value: 7, label: "7 days" },
  { value: 14, label: "14 days" },
  { value: 30, label: "30 days" },
] as const;

/* ── Exit Reasons — Employee ── */
export type EmployeeResignReason =
  | "better_opportunity"
  | "personal_reasons"
  | "relocation"
  | "health_issues"
  | "unsatisfied_environment"
  | "other";

export const EMPLOYEE_RESIGN_REASONS: readonly { value: EmployeeResignReason; label: string }[] = [
  { value: "better_opportunity", label: "Found better opportunity" },
  { value: "personal_reasons", label: "Personal reasons" },
  { value: "relocation", label: "Relocation" },
  { value: "health_issues", label: "Health issues" },
  { value: "unsatisfied_environment", label: "Unsatisfied with work environment" },
  { value: "other", label: "Other" },
] as const;

/* ── Exit Reasons — Employer ── */
export type EmployerTerminateReason =
  | "performance_issues"
  | "attendance_problems"
  | "contract_ended"
  | "company_restructuring"
  | "misconduct"
  | "other";

export const EMPLOYER_TERMINATE_REASONS: readonly { value: EmployerTerminateReason; label: string }[] = [
  { value: "performance_issues", label: "Performance issues" },
  { value: "attendance_problems", label: "Attendance problems" },
  { value: "contract_ended", label: "Contract ended" },
  { value: "company_restructuring", label: "Company restructuring" },
  { value: "misconduct", label: "Misconduct" },
  { value: "other", label: "Other" },
] as const;

/* ── Timeline Entry (audit trail) ── */
export type TimelineEntry = {
  /** Which status was set */
  status: EmploymentStatus | "withdrawn";
  /** Epoch ms when this change happened */
  timestamp: number;
  /** Who triggered the change */
  actor: "employee" | "employer" | "system";
  /** Optional note (e.g. exit reason label, withdrawal note) */
  note: string;
};

/* ── Employment Record ── */
export type EmploymentRecord = {
  /** Unique employment record ID (e.g. "emp_<postId>_<timestamp>") */
  id: string;
  /** Career post this employment belongs to */
  careerPostId: string;

  /** Employee info */
  employeeId: string;
  employeeName: string;
  employeeWmId: string;

  /** Employer info */
  employerId: string;
  companyName: string;
  employerWmId: string;

  /** Job details (snapshot from offer) */
  jobTitle: string;
  department: string;
  salaryMin: number;
  salaryMax: number;
  salaryPeriod: string;

  /** Current status */
  status: EmploymentStatus;

  /** Key dates (epoch ms, null = not yet reached) */
  offeredAt: number;
  acceptedAt: number;
  joinedAt: number | null;
  resignedAt: number | null;
  completedAt: number | null;

  /** Notice period */
  noticePeriodDays: NoticePeriodDays;
  lastWorkingDay: number | null;

  /** Exit details (null while active) */
  exitType: ExitType;
  exitReason: EmployeeResignReason | EmployerTerminateReason | null;
  exitNotes: string;

  /** Resignation withdrawal tracking */
  wasWithdrawn: boolean;
  withdrawnAt: number | null;

  /** Work duration (calculated on completion) */
  workDurationDays: number | null;
  workDurationDisplay: string;

  /** Audit trail — every status change recorded */
  timeline: TimelineEntry[];

  /** Force-complete: employee closed after employer ignored for 7+ days */
  forceCompleted: boolean;

  /** Rating completion flags */
  employeeRated: boolean;
  employerRated: boolean;
};

/** Days after notice expiry / resignation before employee can force-complete. */
export const FORCE_COMPLETE_GRACE_DAYS = 7;

/* ── Status Badge Config ── */
export type StatusBadgeConfig = {
  label: string;
  color: string;
  bgColor: string;
};

export const STATUS_BADGE_MAP: Readonly<Record<EmploymentStatus, StatusBadgeConfig>> = {
  selected:  { label: "Selected",             color: "#1d4ed8", bgColor: "rgba(29,78,216,0.08)" },
  working:   { label: "Currently Working",    color: "#16a34a", bgColor: "rgba(22,163,74,0.08)" },
  notice:    { label: "Notice Period",         color: "#b45309", bgColor: "rgba(180,83,9,0.08)" },
  resigned:  { label: "Resignation Pending",   color: "#b45309", bgColor: "rgba(180,83,9,0.08)" },
  completed: { label: "Completed",             color: "#1d4ed8", bgColor: "rgba(29,78,216,0.08)" },
};

/** Badge override when completed via termination. */
export const TERMINATED_BADGE: StatusBadgeConfig = {
  label: "Terminated", color: "#dc2626", bgColor: "rgba(220,38,38,0.08)",
};

/** Badge override when force-completed by employee (employer unresponsive). */
export const FORCE_COMPLETED_BADGE: StatusBadgeConfig = {
  label: "Completed (unconfirmed)", color: "#b45309", bgColor: "rgba(180,83,9,0.08)",
};

/* ── Valid Status Transitions ── */
export const VALID_TRANSITIONS: Readonly<Record<EmploymentStatus, readonly EmploymentStatus[]>> = {
  selected:  ["working"],
  working:   ["notice", "resigned", "completed"],
  notice:    ["completed", "working"],
  resigned:  ["completed", "working"],
  completed: [],
} as const;

/*
  Transition notes:
  ─ selected  → working    = Employer "Mark as Joined" (with date picker)
  ─ working   → notice     = Employee resigns (noticePeriodDays > 0)
  ─ working   → resigned   = Employee resigns (noticePeriodDays = 0)
  ─ working   → completed  = Employer terminates (exitType = "terminated")
  ─ notice    → completed  = Employer confirms resignation
  ─ notice    → working    = Employee withdraws resignation
  ─ resigned  → completed  = Employer confirms resignation
  ─ resigned  → working    = Employee withdraws resignation
  ─ completed → (terminal) = Rating trigger, Work Vault update
*/