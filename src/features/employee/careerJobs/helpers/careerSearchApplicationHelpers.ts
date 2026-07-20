// App name: Job Mitra
// File name: careerSearchApplicationHelpers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\helpers\careerSearchApplicationHelpers.ts

import { CAREER_APPS_KEY, safeRead } from "../../../employer/careerJobs/helpers/careerStorageUtils";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { cleanText, clampNumber, isRec, num, str } from "./careerSearchSanitizers";
import type { CareerApplicationStageLite, CareerSearchApplicationState } from "./careerSearchTypes";

export function getCareerApplicationsRawSnapshot(): string {
  return safeRead(CAREER_APPS_KEY) ?? "";
}

function clampCareerApplicationStageLite(x: unknown): CareerApplicationStageLite | null {
  if (
    x === "applied" ||
    x === "shortlisted" ||
    x === "interview" ||
    x === "offered" ||
    x === "offer_accepted" ||
    x === "hired" ||
    x === "rejected" ||
    x === "withdrawn"
  ) {
    return x;
  }

  return null;
}

function isSearchBlockingCareerStage(stage: CareerApplicationStageLite): boolean {
  return (
    stage === "applied" ||
    stage === "shortlisted" ||
    stage === "interview" ||
    stage === "offered" ||
    stage === "offer_accepted" ||
    stage === "hired"
  );
}

function getCurrentEmployeeId(): string {
  return employeeProfileStorage.get().uniqueId ?? "employee_demo";
}

export function getBlockedCareerPostIds(): Set<string> {
  const map = getMyCareerApplicationStatusMap();
  return new Set(Object.keys(map));
}

export function getMyCareerApplicationStatusMap(): Record<string, CareerSearchApplicationState> {
  try {
    const currentEmployeeId = getCurrentEmployeeId();
    const raw = safeRead(CAREER_APPS_KEY);

    if (!raw || !currentEmployeeId) return {};

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return {};

    const latestByJob: Record<string, CareerSearchApplicationState> = {};

    for (const item of parsed) {
      if (!isRec(item)) continue;

      const id = cleanText(str(item, "id"), 120);
      const jobId = cleanText(str(item, "jobId"), 120);
      const employeeId = cleanText(str(item, "employeeId"), 120);
      const stage = clampCareerApplicationStageLite(item["stage"]);
      const appliedAt = clampNumber(num(item, "appliedAt"), 0, Number.MAX_SAFE_INTEGER, 0);
      const updatedAt = clampNumber(num(item, "updatedAt"), 0, Number.MAX_SAFE_INTEGER, appliedAt);

      if (!id || !jobId || !employeeId || !stage) continue;
      if (employeeId !== currentEmployeeId) continue;
      if (!isSearchBlockingCareerStage(stage)) continue;

      const current = latestByJob[jobId];

      if (!current || updatedAt > current.updatedAt) {
        latestByJob[jobId] = {
          id,
          jobId,
          stage,
          appliedAt,
          updatedAt,
        };
      }
    }

    return latestByJob;
  } catch {
    return {};
  }
}
