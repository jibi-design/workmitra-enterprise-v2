import { afterEach, beforeEach, vi } from "vitest";
import { ratingStorage } from "../ratingStorage";
import type { EmployerWorkerTag, WorkerEmployerTag } from "../ratingTypes";

export const ER_KEY = ratingStorage._erKey;
export const WR_KEY = ratingStorage._wrKey;
export const FORTY_EIGHT_HRS_MS = 48 * 60 * 60 * 1000;

export function erData(overrides?: Record<string, unknown>) {
  return {
    domain: "shift" as const,
    employerMlId: "WM-ER01-TEC-AB12",
    workerMlId: "WM-EE01-RAH-CD34",
    jobId: "job_001",
    stars: 4 as const,
    tags: ["Reliable", "On time"] as EmployerWorkerTag[],
    comment: "Good worker",
    hireAgain: true,
    ...overrides,
  };
}

export function wrData(overrides?: Record<string, unknown>) {
  return {
    domain: "career" as const,
    workerMlId: "WM-EE01-RAH-CD34",
    employerMlId: "WM-ER01-TEC-AB12",
    jobId: "job_001",
    stars: 5 as const,
    tags: ["Paid on time", "Respectful"] as WorkerEmployerTag[],
    comment: "Great employer",
    workAgain: true,
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});
