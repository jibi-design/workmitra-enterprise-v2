/** Employer OS ops strip — workspace counts stay domain-separated. */

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { CareerWorkspace } from "../../careerJobs/types/careerTypes";
import type { ShiftWorkspace } from "../../shiftJobs/types/shiftWorkspaceTypes";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type EmployerOsWorkspaceStrip = {
  readonly shiftCount: number;
  readonly careerCount: number;
  readonly shiftHref: string;
  readonly careerHref: string;
};

export function isCreatedThisWeek(createdAt: number, now = Date.now()): boolean {
  return createdAt >= now - WEEK_MS;
}

export function countLiveShiftWorkspaces(list: readonly ShiftWorkspace[]): number {
  return list.filter((item) => item.status === "active" || item.status === "upcoming").length;
}

export function countLiveCareerWorkspaces(list: readonly CareerWorkspace[]): number {
  return list.filter((item) => item.status === "active" || item.status === "onboarding").length;
}

export function buildWorkspaceStrip(
  shift: readonly ShiftWorkspace[],
  career: readonly CareerWorkspace[],
): EmployerOsWorkspaceStrip {
  return {
    shiftCount: countLiveShiftWorkspaces(shift),
    careerCount: countLiveCareerWorkspaces(career),
    shiftHref: ROUTE_PATHS.employerShiftWorkspaces,
    careerHref: ROUTE_PATHS.employerMyStaff,
  };
}
