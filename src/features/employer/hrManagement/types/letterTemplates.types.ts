// src/features/employer/hrManagement/types/letterTemplates.types.ts
//
// Types for all HR letters/documents.
// Covers: Appointment, Experience, Warning, Appreciation, Salary Slip,
//         Promotion, Transfer.
// All template-based, in-app generation.

// ─────────────────────────────────────────────────────────────────────────────
// Letter Kind
// ─────────────────────────────────────────────────────────────────────────────

export type LetterKind =
  | "appointment"
  | "experience"
  | "warning"
  | "appreciation"
  | "salary_slip"
  | "promotion"
  | "transfer";

export const LETTER_KIND_LABELS: Record<LetterKind, string> = {
  appointment: "Appointment Letter",
  experience: "Experience Letter",
  warning: "Warning Letter",
  appreciation: "Appreciation Letter",
  salary_slip: "Salary Slip",
  promotion: "Promotion Letter",
  transfer: "Transfer Letter",
};

// ─────────────────────────────────────────────────────────────────────────────
// Letter Status
// ─────────────────────────────────────────────────────────────────────────────

export type LetterStatus =
  | "draft"
  | "sent"
  | "acknowledged"
  | "disputed";

// ─────────────────────────────────────────────────────────────────────────────
// Appointment Letter Fields
// ─────────────────────────────────────────────────────────────────────────────

export type AppointmentLetterData = {
  employeeName: string;
  jobTitle: string;
  department: string;
  location: string;
  joiningDate: number;
  salary: string;
  salaryFrequency: string;
  workSchedule: string;
  reportingTo: string;
  additionalTerms: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Warning Letter Fields
// ─────────────────────────────────────────────────────────────────────────────

export type WarningLetterData = {
  employeeName: string;
  jobTitle: string;
  warningType: "verbal" | "written" | "final";
  reason: string;
  incidentDate: number;
  expectedImprovement: string;
  consequenceIfRepeated: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Appreciation Letter Fields
// ─────────────────────────────────────────────────────────────────────────────

export type AppreciationLetterData = {
  employeeName: string;
  jobTitle: string;
  reason: string;
  achievement: string;
  additionalNote: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Salary Slip Fields
// ─────────────────────────────────────────────────────────────────────────────

export type SalarySlipData = {
  employeeName: string;
  jobTitle: string;
  month: string;
  year: number;
  baseSalary: string;
  allowances: string;
  deductions: string;
  netPay: string;
  paymentDate: number;
  paymentMethod: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Promotion Letter Fields
// ─────────────────────────────────────────────────────────────────────────────

export type PromotionLetterData = {
  employeeName: string;
  previousTitle: string;
  newTitle: string;
  previousDepartment: string;
  newDepartment: string;
  effectiveDate: number;
  newSalary: string;
  reason: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Transfer Letter Fields
// ─────────────────────────────────────────────────────────────────────────────

export type TransferLetterData = {
  employeeName: string;
  jobTitle: string;
  fromLocation: string;
  toLocation: string;
  fromDepartment: string;
  toDepartment: string;
  effectiveDate: number;
  reason: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Experience Letter Fields
// ─────────────────────────────────────────────────────────────────────────────

export type ExperienceLetterData = {
  employeeName: string;
  jobTitle: string;
  department: string;
  joiningDate: number;
  exitDate: number;
  duties: string;
  performance: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Union of all letter data
// ─────────────────────────────────────────────────────────────────────────────

export type LetterData =
  | { kind: "appointment"; data: AppointmentLetterData }
  | { kind: "experience"; data: ExperienceLetterData }
  | { kind: "warning"; data: WarningLetterData }
  | { kind: "appreciation"; data: AppreciationLetterData }
  | { kind: "salary_slip"; data: SalarySlipData }
  | { kind: "promotion"; data: PromotionLetterData }
  | { kind: "transfer"; data: TransferLetterData };

// ─────────────────────────────────────────────────────────────────────────────
// Letter Record (stored entity)
// ─────────────────────────────────────────────────────────────────────────────

export type LetterRecord = {
  id: string;
  /** Link to HR candidate */
  hrCandidateId: string;
  employeeUniqueId: string;
  employeeName: string;
  /** Letter details */
  kind: LetterKind;
  letterData: LetterData;
  /** Status */
  status: LetterStatus;
  /** Tracking */
  createdAt: number;
  sentAt?: number;
  acknowledgedAt?: number;
  disputedAt?: number;
  disputeReason?: string;
};