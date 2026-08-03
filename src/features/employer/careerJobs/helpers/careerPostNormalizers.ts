// App name: Job Mitra
// File name: careerPostNormalizers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\helpers\careerPostNormalizers.ts

import { AUTH_BACKEND_ENABLED } from "../../../../shared/config/authConfig";
import {
  getCurrentActorId,
  identityBridge,
  resolveActorStorageId,
} from "../../../../app/identity/identity.adapter";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";
import { sanitizeUserText } from "../../../../shared/security/sanitizeUserText";
import type { CareerJobPost, InterviewRoundConfig } from "../types/careerTypes";
import { getNumber, getString, getStringArray, isRecord } from "./careerStorageUtils";
import {
  clampInterviewMode,
  clampJobType,
  clampPostStatus,
  clampSalaryPeriod,
  clampWorkMode,
} from "./careerEnumClamps";

type NormalizedScreeningQuestion = {
  id: string;
  text: string;
};

export function normalizeRoundConfig(raw: unknown): InterviewRoundConfig | null {
  if (!isRecord(raw)) return null;

  const round = getNumber(raw, "round");
  const label = getString(raw, "label");

  if (round === undefined || !label) return null;

  return {
    round,
    label,
    mode: clampInterviewMode(raw["mode"]),
  };
}

function normalizeScreeningQuestion(raw: unknown): NormalizedScreeningQuestion | null {
  if (!isRecord(raw)) return null;

  const id = getString(raw, "id");
  const textRaw = getString(raw, "text")?.trim();

  if (!id || !textRaw) return null;

  const text = sanitizeUserText(textRaw, 500);
  if (!text) return null;

  return {
    id,
    text,
  };
}

function normalizeScreeningQuestions(raw: unknown): NormalizedScreeningQuestion[] | undefined {
  if (!Array.isArray(raw)) return undefined;

  const questions = raw
    .map(normalizeScreeningQuestion)
    .filter((item): item is NormalizedScreeningQuestion => item !== null)
    .slice(0, 7);

  return questions.length > 0 ? questions : undefined;
}

export function normalizeCareerPost(raw: unknown): CareerJobPost | null {
  if (!isRecord(raw)) return null;

  const idVal = getString(raw, "id");
  if (!idVal) return null;

  const salaryMin = getNumber(raw, "salaryMin") ?? 0;
  const salaryMax = getNumber(raw, "salaryMax") ?? 0;
  const vacancies = getNumber(raw, "vacancies") ?? 1;
  const probationPeriod = getString(raw, "probationPeriod") ?? "none";
  const experienceMin = getNumber(raw, "experienceMin") ?? 0;
  const experienceMax = getNumber(raw, "experienceMax") ?? 0;
  const noticePeriodDays = getNumber(raw, "noticePeriodDays");
  const interviewRounds = getNumber(raw, "interviewRounds") ?? 1;

  const rawConfigs = Array.isArray(raw["roundConfigs"]) ? raw["roundConfigs"] : [];
  const roundConfigs = (rawConfigs as unknown[])
    .map(normalizeRoundConfig)
    .filter((item): item is InterviewRoundConfig => item !== null);

  const actor = getCurrentActorId("employer");
  const legacyEmployerId = employerSettingsStorage.get().uniqueId?.trim();
  if (actor.source === "auth" && actor.authUserId && legacyEmployerId) {
    identityBridge.upsert("employer", legacyEmployerId, actor.authUserId);
  }

  let employerId = getString(raw, "employerId") ?? legacyEmployerId ?? undefined;
  if (!employerId) {
    if (AUTH_BACKEND_ENABLED) {
      try {
        employerId = resolveActorStorageId("employer", "employer_demo");
      } catch {
        employerId = "missing_employer";
      }
    } else {
      employerId = "employer_demo";
    }
  }

  return {
    id: idVal,
    employerId,
    companyName: getString(raw, "companyName") ?? "Company",
    jobTitle: getString(raw, "jobTitle") ?? "Untitled Position",
    department: getString(raw, "department") ?? "",
    jobType: clampJobType(raw["jobType"]),
    workMode: clampWorkMode(raw["workMode"]),
    location: getString(raw, "location") ?? "",
    vacancies: Math.max(1, vacancies),
    probationPeriod: probationPeriod as CareerJobPost["probationPeriod"],
    salaryMin: Math.max(0, salaryMin),
    salaryMax: Math.max(salaryMin, salaryMax),
    salaryPeriod: clampSalaryPeriod(raw["salaryPeriod"]),
    experienceMin: Math.max(0, experienceMin),
    experienceMax: Math.max(experienceMin, experienceMax),
    noticePeriodDays: noticePeriodDays === undefined ? undefined : Math.max(0, noticePeriodDays),
    qualifications: getStringArray(raw, "qualifications"),
    skills: getStringArray(raw, "skills"),
    description: sanitizeUserText(getString(raw, "description") ?? "", 8000),
    responsibilities: getStringArray(raw, "responsibilities"),
    interviewRounds: Math.max(1, Math.min(10, interviewRounds)),
    roundConfigs,
    status: clampPostStatus(raw["status"]),
    createdAt: getNumber(raw, "createdAt") ?? Date.now(),
    updatedAt: getNumber(raw, "updatedAt") ?? Date.now(),
    closingDate: getNumber(raw, "closingDate") ?? Date.now() + 30 * 24 * 60 * 60 * 1000,
    screeningQuestions: normalizeScreeningQuestions(raw["screeningQuestions"]),
    isTemplate: !!raw["isTemplate"],
    templateName: getString(raw, "templateName"),
    clonedFrom: getString(raw, "clonedFrom"),
    totalApplications: getNumber(raw, "totalApplications") ?? 0,
    shortlisted: getNumber(raw, "shortlisted") ?? 0,
    inInterview: getNumber(raw, "inInterview") ?? 0,
    offered: getNumber(raw, "offered") ?? 0,
    hired: getNumber(raw, "hired") ?? 0,
    rejected: getNumber(raw, "rejected") ?? 0,
  };
}
