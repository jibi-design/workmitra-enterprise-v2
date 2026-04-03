// src/features/employer/hrManagement/types/exitProcessing.types.ts
//
// Types for exit/resignation processing (Phase 3).
// Covers: notice period, clearance checklist, final settlement, experience letter.

// ─────────────────────────────────────────────────────────────────────────────
// Exit Trigger
// ─────────────────────────────────────────────────────────────────────────────

export type ExitTrigger =
  | "employee_resigned"
  | "employer_terminated"
  | "contract_ended"
  | "mutual_agreement";

export const EXIT_TRIGGER_LABELS: Record<ExitTrigger, string> = {
  employee_resigned: "Employee Resigned",
  employer_terminated: "Terminated by Employer",
  contract_ended: "Contract Ended",
  mutual_agreement: "Mutual Agreement",
};

// ─────────────────────────────────────────────────────────────────────────────
// Notice Period
// ─────────────────────────────────────────────────────────────────────────────

export type NoticePeriodInfo = {
  totalDays: number;
  startDate: number;
  endDate: number;
  waived: boolean;
  waivedReason?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Clearance Item
// ─────────────────────────────────────────────────────────────────────────────

export type ClearanceItem = {
  id: string;
  label: string;
  isDefault: boolean;
  completedAt?: number;
  completedBy?: "employer";
};

// ─────────────────────────────────────────────────────────────────────────────
// Default Clearance Items
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_CLEARANCE_ITEMS: readonly { label: string }[] = [
  { label: "Company equipment returned" },
  { label: "ID card returned" },
  { label: "Pending work handed over" },
  { label: "Company documents returned" },
  { label: "Access / credentials deactivated" },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Exit Processing Data (stored in HRCandidateRecord)
// ─────────────────────────────────────────────────────────────────────────────

export type ExitProcessingData = {
  trigger: ExitTrigger;
  triggerNote: string;
  initiatedAt: number;
  /** Notice period */
  noticePeriod: NoticePeriodInfo;
  /** Clearance */
  clearanceItems: ClearanceItem[];
  clearanceCompletedAt?: number;
  /** Final settlement */
  settlementNote?: string;
  /** Experience letter sent */
  experienceLetterSent: boolean;
  /** Exit finalized */
  exitCompletedAt?: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Notice Period Defaults (days)
// ─────────────────────────────────────────────────────────────────────────────

export const NOTICE_PERIOD_DEFAULTS = {
  probation: 7,
  confirmed: 30,
  fixed_term: 30,
} as const;