// src/features/employer/hrManagement/types/hrManagement.types.ts
//
// All types for the HR Management module (HR ON path).
// Covers: Offer flow, Onboarding, Employment phases, Exit processing.
// Phase 2: Employment status + probation tracking + contract management.

// ─────────────────────────────────────────────────────────────────────────────
// HR Candidate Status (full lifecycle)
// ─────────────────────────────────────────────────────────────────────────────

export type HRCandidateStatus =
  | "offer_pending"
  | "offered"
  | "offer_rejected"
  | "hired"
  | "onboarding"
  | "active"
  | "exit_processing";

// ─────────────────────────────────────────────────────────────────────────────
// Employment Phase (sub-status when active)
// ─────────────────────────────────────────────────────────────────────────────

export type EmploymentPhase = "probation" | "confirmed";

// ─────────────────────────────────────────────────────────────────────────────
// Contract Type
// ─────────────────────────────────────────────────────────────────────────────

export type ContractType = "permanent" | "fixed_term";

// ─────────────────────────────────────────────────────────────────────────────
// Contract Renewal Log Entry
// ─────────────────────────────────────────────────────────────────────────────

export type ContractRenewalEntry = {
  id: string;
  previousEndDate: number;
  newEndDate: number;
  renewedAt: number;
  note: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Offer Letter
// ─────────────────────────────────────────────────────────────────────────────

export type OfferLetter = {
  salaryAmount: string;
  salaryFrequency: "monthly" | "weekly" | "hourly" | "annual";
  joiningDate: number;
  workSchedule: string;
  additionalTerms: string;
  sentAt: number;
  respondedAt?: number;
  response?: "accepted" | "rejected";
  rejectionReason?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding Checklist
// ─────────────────────────────────────────────────────────────────────────────

export type OnboardingItem = {
  id: string;
  label: string;
  isDefault: boolean;
  completedAt?: number;
  completedBy?: "employee" | "employer";
};

export type OnboardingChecklist = {
  items: OnboardingItem[];
  startedAt: number;
  completedAt?: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Default Onboarding Items
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_ONBOARDING_ITEMS: readonly { label: string }[] = [
  { label: "Documents submitted" },
  { label: "Company policy acknowledged" },
  { label: "ID card issued" },
  { label: "Bank details submitted" },
  { label: "Equipment received" },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Employment Status Change Log
// ─────────────────────────────────────────────────────────────────────────────

export type StatusChangeEntry = {
  id: string;
  from: string;
  to: string;
  changedAt: number;
  changedBy: "employer" | "system";
  note?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// HR Candidate Record (main entity)
// ─────────────────────────────────────────────────────────────────────────────

export type HRCandidateRecord = {
  id: string;
  /** Link to career post + application */
  careerPostId: string;
  applicationId: string;
  /** Employee identity */
  employeeUniqueId: string;
  employeeName: string;
  /** Job details (copied from career post) */
  jobTitle: string;
  department: string;
  location: string;
  /** Status */
  status: HRCandidateStatus;
  /** Employment phase (only when status = "active") */
  employmentPhase?: EmploymentPhase;
  /** Probation tracking */
  probationEndDate?: number;
  probationDurationDays?: number;
  confirmedAt?: number;
  /** Contract tracking */
  contractType?: ContractType;
  contractEndDate?: number;
  contractRenewals?: ContractRenewalEntry[];
  /** Offer letter */
  offerLetter?: OfferLetter;
  /** Onboarding */
  onboarding?: OnboardingChecklist;
  /** Status change history */
  statusHistory?: StatusChangeEntry[];
  /** Exit processing (Phase 3) */
  exitData?: import("./exitProcessing.types").ExitProcessingData;
  /** Timestamps */
  movedToHRAt: number;
  createdAt: number;
  updatedAt: number;
};