// Career apply — input validation helpers.

import type { CareerApplication, CareerJobPost } from "../../../../career/types/careerDomainTypes";
import type { CareerApplyInput } from "./careerApply.types";

export const MIN_COVER_NOTE_LENGTH = 10;
export const MAX_COVER_NOTE_LENGTH = 600;
export const MAX_EXPECTED_SALARY = 999_999_999;
export const MAX_RESUME_SUMMARY_LENGTH = 1000;
export const ALLOWED_NOTICE_PERIODS = new Set(["Immediate", "15 days", "30 days", "60 days"]);

const WITHDRAWABLE_APPLICATION_STAGES = new Set<CareerApplication["stage"]>([
  "applied",
  "shortlisted",
  "interview",
]);

export function canWithdrawApplicationStage(stage: CareerApplication["stage"]): boolean {
  return WITHDRAWABLE_APPLICATION_STAGES.has(stage);
}

export function canDeclineOfferStage(stage: CareerApplication["stage"]): boolean {
  return stage === "offered";
}

function isValidOptionalEmailValue(value: string | undefined): boolean {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function isValidOptionalPhoneValue(value: string | undefined): boolean {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return true;
  const digitsOnly = trimmed.replace(/[^\d]/g, "");
  return digitsOnly.length >= 6 && digitsOnly.length <= 15;
}

function isCareerPostOpenForApply(post: CareerJobPost, now: number): boolean {
  if (post.status !== "active") return false;
  if (post.closingDate > 0 && post.closingDate <= now) return false;
  return true;
}

function hasCompletedRequiredScreening(
  post: CareerJobPost,
  answers: CareerApplyInput["screeningAnswers"],
): boolean {
  const questions = post.screeningQuestions ?? [];
  if (questions.length === 0) return true;
  if (!answers) return false;
  return questions.every(
    (question: { id: string }) => answers[question.id] === "yes" || answers[question.id] === "no",
  );
}

export function isValidApplyInput(
  input: CareerApplyInput,
  post: CareerJobPost,
  now: number,
): boolean {
  const coverNote = input.coverNote.trim();
  if (!isCareerPostOpenForApply(post, now)) return false;
  if (coverNote.length < MIN_COVER_NOTE_LENGTH || coverNote.length > MAX_COVER_NOTE_LENGTH)
    return false;
  if (!Number.isFinite(input.expectedSalary)) return false;
  if (!Number.isInteger(input.expectedSalary)) return false;
  if (input.expectedSalary < 0 || input.expectedSalary > MAX_EXPECTED_SALARY) return false;
  if (!ALLOWED_NOTICE_PERIODS.has(input.noticePeriod.trim() || "Immediate")) return false;
  if (!isValidOptionalPhoneValue(input.employeePhone)) return false;
  if (!isValidOptionalEmailValue(input.employeeEmail)) return false;
  if ((input.resumeSummary?.trim().length ?? 0) > MAX_RESUME_SUMMARY_LENGTH) return false;
  if (!hasCompletedRequiredScreening(post, input.screeningAnswers)) return false;
  return true;
}

export function normalizeExpectedSalary(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(Math.floor(value), MAX_EXPECTED_SALARY);
}

export function normalizeNoticePeriod(value: string): string {
  const trimmed = value.trim();
  return ALLOWED_NOTICE_PERIODS.has(trimmed) ? trimmed : "Immediate";
}
