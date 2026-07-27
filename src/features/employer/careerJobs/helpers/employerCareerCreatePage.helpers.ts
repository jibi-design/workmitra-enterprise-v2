// App name: Job Mitra
// File name: employerCareerCreatePage.helpers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\helpers\employerCareerCreatePage.helpers.ts

import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";
import type { StepBasicData } from "../components/CareerCreateStepBasic";
import type { StepRequirementsData } from "../components/CareerCreateStepRequirements";
import { clampInt } from "./careerCreateFormHelpers";

export const CREATE_PAGE_VALIDATION_STARTED_AT = Date.now();

export function getEmployerProfileDefaults(): Pick<StepBasicData, "companyName" | "location"> {
  const profile = employerSettingsStorage.get();

  const companyName = profile.companyName.trim();
  const location = [profile.locationCity.trim(), profile.locationState.trim()]
    .filter(Boolean)
    .join(", ");

  return { companyName, location };
}

export function formatNoticePeriodForConfirm(req: StepRequirementsData): string {
  const days =
    req.noticePeriodDays === "custom"
      ? clampInt(Number(req.noticePeriodCustomDays) || 0, 0, 365)
      : clampInt(Number(req.noticePeriodDays) || 0, 0, 365);

  if (days <= 0) return "No notice period";
  return `${days} day${days === 1 ? "" : "s"}`;
}

export function normalizeStep(value: number): number {
  if (value < 1) return 1;
  if (value > 4) return 4;
  return value;
}
