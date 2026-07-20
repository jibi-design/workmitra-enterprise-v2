// App name: Job Mitra
// File name: shiftPostApply.types.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\hooks\shiftPostApply\shiftPostApply.types.ts

import type { AnswerState } from "../../helpers/shiftApplyHelpers";
import type { ShiftApplicationRecord } from "../../types/shiftPostApply.types";

export type ShiftAnswerMap = Record<string, AnswerState>;

export type ShiftNoteMap = Record<string, string>;

export type ShiftQuickAnswerMap = Record<string, "yes" | "no">;

export type ShiftDetailWithdrawableStatus = Extract<
  ShiftApplicationRecord["status"],
  "applied" | "shortlisted" | "waiting"
>;

export type EmployeeProfileSnapshotSource = {
  readonly uniqueId?: string;
  readonly fullName: string;
  readonly city: string;
  readonly experience?: string;
  readonly skills: readonly string[];
  readonly languages: readonly string[];
};
