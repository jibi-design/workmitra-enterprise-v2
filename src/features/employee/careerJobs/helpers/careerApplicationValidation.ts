// App name: Job Mitra
// File name: careerApplicationValidation.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\helpers\careerApplicationValidation.ts

const MIN_COVER_NOTE_LENGTH = 10;
const MAX_COVER_NOTE_LENGTH = 600;
const MAX_EXPECTED_SALARY = 999_999_999;

type CareerSubmitBlockInput = {
  isApplied: boolean;
  isExpired: boolean;
  hasCoverNote: boolean;
  coverNoteValid: boolean;
  allScreeningAnswered: boolean;
  screeningQuestionCount: number;
  phoneValid: boolean;
  emailValid: boolean;
  expectedSalaryValid: boolean;
  hasContactDetails: boolean;
  contactConfirmed: boolean;
};

export function isValidCoverNote(value: string): boolean {
  const trimmed = value.trim();

  return trimmed.length >= MIN_COVER_NOTE_LENGTH && trimmed.length <= MAX_COVER_NOTE_LENGTH;
}

export function isValidOptionalEmail(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed) return true;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function isValidOptionalPhone(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed) return true;

  const digitsOnly = trimmed.replace(/[^\d]/g, "");

  return digitsOnly.length >= 6 && digitsOnly.length <= 15;
}

export function isValidOptionalExpectedSalary(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed) return true;

  const salary = Number(trimmed);

  return (
    Number.isFinite(salary) &&
    Number.isInteger(salary) &&
    salary >= 0 &&
    salary <= MAX_EXPECTED_SALARY
  );
}

export function getSubmitBlockReason({
  isApplied,
  isExpired,
  hasCoverNote,
  coverNoteValid,
  allScreeningAnswered,
  screeningQuestionCount,
  phoneValid,
  emailValid,
  expectedSalaryValid,
  hasContactDetails,
  contactConfirmed,
}: CareerSubmitBlockInput): string {
  if (isExpired) return "This career post is closed. Applications are no longer available.";
  if (isApplied) return "You have already applied to this position.";
  if (!hasCoverNote) return "Add a short cover note before submitting your application.";
  if (!coverNoteValid) return "Cover note must be between 10 and 600 characters.";
  if (!expectedSalaryValid)
    return "Expected salary must be a valid whole number between 0 and 999,999,999.";
  if (!phoneValid) return "Enter a valid phone number or leave the phone field empty.";
  if (!emailValid) return "Enter a valid email address or leave the email field empty.";
  if (hasContactDetails && !contactConfirmed)
    return "Confirm that the contact details are yours before submitting.";
  if (!allScreeningAnswered && screeningQuestionCount > 0)
    return "Answer all screening questions before submitting.";

  return "";
}
