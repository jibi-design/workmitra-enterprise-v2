import type { ExperienceLabel, ShiftPayBasis } from "./employerShift.types";

export type EmployerShiftDraftPayBasis = ShiftPayBasis | "";

export type EmployerShiftDraftJobType = "one-time" | "weekly" | "custom";

export type EmployerShiftDraftQuickQuestion = {
  readonly id: string;
  readonly text: string;
};

export type EmployerShiftCreateDraftForm = {
  readonly companyName: string;
  readonly jobName: string;
  readonly category: string;
  readonly description: string;
  readonly experience: ExperienceLabel;
  readonly vacanciesStr: string;
  readonly backupSlotsStr: string;
  readonly payPerDayStr: string;
  readonly payBasis: EmployerShiftDraftPayBasis;
  readonly shiftTiming: string;
  readonly locationName: string;
  readonly locationAddress: string;
  readonly mapsLink: string;
  readonly startAt: number;
  readonly endAt: number;
  readonly mustHave: string;
  readonly goodToHave: string;
  readonly whatWeProvide: readonly string[];
  readonly quickQuestions: readonly EmployerShiftDraftQuickQuestion[];
  readonly dressCode: string;
  readonly jobType: EmployerShiftDraftJobType;
};

export type EmployerShiftPostDraft = {
  readonly id: string;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly titlePreview: string;
  readonly form: EmployerShiftCreateDraftForm;
};

export type EmployerShiftDraftWriteResult =
  | { readonly ok: true; readonly draft: EmployerShiftPostDraft }
  | { readonly ok: false; readonly reason: "storage_error" };
