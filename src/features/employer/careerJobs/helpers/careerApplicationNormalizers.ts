// App name: Job Mitra
// File name: careerApplicationNormalizers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\helpers\careerApplicationNormalizers.ts

import type {
  CareerApplication,
  CareerApplicationProfileSnapshot,
  CareerOfferInput,
  RoundResult,
} from "../types/careerTypes";
import { getNumber, getString, getStringArray, isRecord } from "./careerStorageUtils";
import {
  clampApplicationStage,
  clampInterviewMode,
  clampRoundResultStatus,
} from "./careerEnumClamps";

type ScreeningAnswerValue = "yes" | "no";

export function normalizeRoundResult(raw: unknown): RoundResult | null {
  if (!isRecord(raw)) return null;

  const round = getNumber(raw, "round");
  const label = getString(raw, "label");

  if (round === undefined || !label) return null;

  return {
    round,
    label,
    status: clampRoundResultStatus(raw["status"]),
    feedback: getString(raw, "feedback") ?? "",
    interviewMode: clampInterviewMode(raw["interviewMode"]),
    scheduledDate: getString(raw, "scheduledDate"),
    scheduledTime: getString(raw, "scheduledTime"),
    location: getString(raw, "location"),
    meetingLink: getString(raw, "meetingLink"),
    completedAt: getNumber(raw, "completedAt"),
    rsvpStatus: clampInterviewRsvpStatus(raw["rsvpStatus"]),
    rsvpAt: getNumber(raw, "rsvpAt"),
  };
}

function clampInterviewRsvpStatus(value: unknown): RoundResult["rsvpStatus"] | undefined {
  if (value === "pending" || value === "accepted" || value === "declined") return value;
  return undefined;
}

export function normalizeProfileSnapshot(
  raw: unknown,
): CareerApplicationProfileSnapshot | undefined {
  if (!isRecord(raw)) return undefined;

  return {
    uniqueId: getString(raw, "uniqueId"),
    fullName: getString(raw, "fullName"),
    city: getString(raw, "city"),
    experience: getString(raw, "experience"),
    skills: getStringArray(raw, "skills"),
    languages: getStringArray(raw, "languages"),
  };
}

export function normalizeCareerApplication(raw: unknown): CareerApplication | null {
  if (!isRecord(raw)) return null;

  const idVal = getString(raw, "id");
  const jobId = getString(raw, "jobId");

  if (!idVal || !jobId) return null;

  const rawResults = Array.isArray(raw["roundResults"]) ? raw["roundResults"] : [];
  const roundResults = (rawResults as unknown[])
    .map(normalizeRoundResult)
    .filter((item): item is RoundResult => item !== null);

  return {
    id: idVal,
    jobId,
    employeeId: getString(raw, "employeeId") ?? "",
    employeeName: getString(raw, "employeeName") ?? "Applicant",
    employeePhone: getString(raw, "employeePhone") ?? "",
    employeeEmail: getString(raw, "employeeEmail") ?? "",
    resumeSummary: getString(raw, "resumeSummary") ?? "",
    coverNote: getString(raw, "coverNote") ?? "",
    expectedSalary: getNumber(raw, "expectedSalary") ?? 0,
    noticePeriod: getString(raw, "noticePeriod") ?? "Immediate",
    profileSnapshot: normalizeProfileSnapshot(raw["profileSnapshot"]),
    stage: clampApplicationStage(raw["stage"]),
    currentRound: getNumber(raw, "currentRound") ?? 0,
    roundResults,
    appliedAt: getNumber(raw, "appliedAt") ?? Date.now(),
    updatedAt: getNumber(raw, "updatedAt") ?? Date.now(),
    employerNotes: getString(raw, "employerNotes") ?? "",
    rejectionReason: getString(raw, "rejectionReason"),
    rejectedAt: getNumber(raw, "rejectedAt"),
    offeredAt: getNumber(raw, "offeredAt"),
    offerAcceptedAt: getNumber(raw, "offerAcceptedAt"),
    offerDetails: normalizeCareerOfferInput(raw["offerDetails"]),
    hiredAt: getNumber(raw, "hiredAt"),
    withdrawnAt: getNumber(raw, "withdrawnAt"),
    screeningAnswers: normalizeScreeningAnswers(raw["screeningAnswers"]),
    backupReserved: raw["backupReserved"] === true ? true : undefined,
  };
}

function normalizeScreeningAnswers(raw: unknown): Record<string, ScreeningAnswerValue> | undefined {
  if (!isRecord(raw)) return undefined;

  const answers: Record<string, ScreeningAnswerValue> = {};

  Object.entries(raw).forEach(([key, value]) => {
    if (value === "yes" || value === "no") {
      answers[key] = value;
    }
  });

  return Object.keys(answers).length > 0 ? answers : undefined;
}

function normalizeCareerOfferInput(raw: unknown): CareerOfferInput | undefined {
  if (!isRecord(raw)) return undefined;

  const jobTitle = getString(raw, "jobTitle");
  const salary = getNumber(raw, "salary");
  const salaryPeriod = raw["salaryPeriod"];
  const startDate = getString(raw, "startDate");
  const noticePeriodDays = getNumber(raw, "noticePeriodDays");

  if (!jobTitle || salary === undefined || !startDate) return undefined;
  if (salaryPeriod !== "monthly" && salaryPeriod !== "yearly") return undefined;
  if (
    noticePeriodDays !== 0 &&
    noticePeriodDays !== 7 &&
    noticePeriodDays !== 14 &&
    noticePeriodDays !== 30
  ) {
    return undefined;
  }

  return {
    jobTitle,
    salary,
    salaryPeriod,
    startDate,
    noticePeriodDays,
    message: getString(raw, "message"),
  };
}
