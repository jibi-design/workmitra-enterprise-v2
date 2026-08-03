// App name: Job Mitra
// File name: careerSearchApplicationHelpers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\helpers\careerSearchApplicationHelpers.ts

import { resolveActorStorageId } from "../../../../app/identity/identity.adapter";
import { hydrateCareerApplicationsFromServer } from "../../../career/services/careerDbTruth.service";
import { isCareerApiSyncEnabled } from "../../../career/services/careerGateApi.service";
import { CAREER_APPS_KEY, safeRead } from "../../../career/helpers/careerStoragePublic";
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
    x === "offer_declined" ||
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
  return resolveActorStorageId("employee", "employee_demo");
}

export function getBlockedCareerPostIds(): Set<string> {
  const map = getMyCareerApplicationStatusMap();
  return new Set(Object.keys(map));
}

/**
 * Phase 12 read pattern:
 * - Auth on: kick off DB hydrate (DB→LS merge, DB wins); sync readers use LS cache.
 * - Auth off: LS only (demo/E2E).
 * Use loadMyCareerApplicationStatusMap() when the caller can await DB-first.
 */
export function getMyCareerApplicationStatusMap(): Record<string, CareerSearchApplicationState> {
  if (isCareerApiSyncEnabled()) {
    void hydrateCareerApplicationsFromServer();
  }

  return buildStatusMapFromLsCache();
}

/** DB-first then LS cache merge (authoritative when auth on). */
export async function loadMyCareerApplicationStatusMap(): Promise<
  Record<string, CareerSearchApplicationState>
> {
  if (isCareerApiSyncEnabled()) {
    await hydrateCareerApplicationsFromServer();
  }
  return buildStatusMapFromLsCache();
}

function buildStatusMapFromLsCache(): Record<string, CareerSearchApplicationState> {
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
