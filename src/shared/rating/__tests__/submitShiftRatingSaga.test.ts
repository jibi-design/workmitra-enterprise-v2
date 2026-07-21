// src/shared/rating/__tests__/submitShiftRatingSaga.test.ts

import { describe, it, expect, beforeEach, vi } from "vitest";
import { ratingStorage } from "../ratingStorage";
import { workerPointsStorage, WorkerPointsStorageWriteError } from "../workerPointsStorage";
import { submitShiftRatingSaga } from "../submitShiftRatingSaga";
import type { WorkerEmployerTag } from "../ratingTypes";

function shiftWorkerRatingInput(overrides?: Record<string, unknown>) {
  return {
    domain: "shift" as const,
    workerMlId: "WM-EE01-RAH-CD34",
    employerMlId: "WM-ER01-TEC-AB12",
    jobId: "job_shift_001",
    stars: 4 as const,
    tags: ["Paid on time"] as WorkerEmployerTag[],
    comment: "Good shift",
    workAgain: true,
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("submitShiftRatingSaga", () => {
  it("saves rating and applies shift_complete points", () => {
    const result = submitShiftRatingSaga(shiftWorkerRatingInput());

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.pointsApplied).toBe(true);
    expect(
      ratingStorage.hasWorkerRatedEmployer("WM-EE01-RAH-CD34", "job_shift_001", "WM-ER01-TEC-AB12"),
    ).toBe(true);
    expect(workerPointsStorage.getByMlId("WM-EE01-RAH-CD34").total).toBeGreaterThan(0);
  });

  it("returns already_rated when duplicate submission", () => {
    submitShiftRatingSaga(shiftWorkerRatingInput());

    const second = submitShiftRatingSaga(shiftWorkerRatingInput({ stars: 5 }));

    expect(second).toEqual({ ok: false, reason: "already_rated" });
  });

  it("returns ok with pointsApplied false when points write fails", () => {
    vi.spyOn(workerPointsStorage, "applyEvent").mockImplementation(() => {
      throw new WorkerPointsStorageWriteError();
    });

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = submitShiftRatingSaga(shiftWorkerRatingInput());

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.pointsApplied).toBe(false);
    expect(
      ratingStorage.hasWorkerRatedEmployer("WM-EE01-RAH-CD34", "job_shift_001", "WM-ER01-TEC-AB12"),
    ).toBe(true);
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});
