// src/shared/rating/__tests__/ratingStorage.test.ts
// Phase A — Rating Storage: save, edit, 48hr lock, summaries, dedup, subscribe.

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ratingStorage } from "../ratingStorage";
import type { EmployerWorkerTag, WorkerEmployerTag } from "../ratingTypes";

/* ── Constants ── */
const ER_KEY = ratingStorage._erKey;
const WR_KEY = ratingStorage._wrKey;
const FORTY_EIGHT_HRS_MS = 48 * 60 * 60 * 1000;

/* ── Factories ── */
function erData(overrides?: Record<string, unknown>) {
  return {
    domain: "shift" as const,
    employerWmId: "WM-ER01-TEC-AB12",
    workerWmId: "WM-EE01-RAH-CD34",
    jobId: "job_001",
    stars: 4 as const,
    tags: ["Reliable", "On time"] as EmployerWorkerTag[],
    comment: "Good worker",
    hireAgain: true,
    ...overrides,
  };
}

function wrData(overrides?: Record<string, unknown>) {
  return {
    domain: "career" as const,
    workerWmId: "WM-EE01-RAH-CD34",
    employerWmId: "WM-ER01-TEC-AB12",
    jobId: "job_001",
    stars: 5 as const,
    tags: ["Paid on time", "Respectful"] as WorkerEmployerTag[],
    comment: "Great employer",
    workAgain: true,
    ...overrides,
  };
}

/* ── Setup ── */
beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

/* ── Save Employer Rating ── */
describe("saveEmployerRating", () => {
  it("saves and persists to localStorage", () => {
    const rating = ratingStorage.saveEmployerRating(erData());

    expect(rating.id).toMatch(/^er_/);
    expect(rating.stars).toBe(4);
    expect(rating.editCount).toBe(0);
    expect(rating.editedAt).toBeNull();
    expect(localStorage.getItem(ER_KEY)).not.toBeNull();
  });

  it("returns saved rating in getAllERRatings", () => {
    ratingStorage.saveEmployerRating(erData());
    expect(ratingStorage.getAllERRatings()).toHaveLength(1);
  });

  it("newest rating appears first (sorted desc)", () => {
    ratingStorage.saveEmployerRating(erData({ jobId: "j1" }));
    ratingStorage.saveEmployerRating(erData({ jobId: "j2" }));
    const all = ratingStorage.getAllERRatings();
    expect(all[0].jobId).toBe("j2");
  });
});

/* ── Save Worker Rating ── */
describe("saveWorkerRating", () => {
  it("saves and persists to localStorage", () => {
    const rating = ratingStorage.saveWorkerRating(wrData());

    expect(rating.id).toMatch(/^wr_/);
    expect(rating.stars).toBe(5);
    expect(rating.editCount).toBe(0);
    expect(localStorage.getItem(WR_KEY)).not.toBeNull();
  });
});

/* ── Duplicate Checks ── */
describe("duplicate checks", () => {
  it("hasEmployerRatedWorker returns true when rated", () => {
    ratingStorage.saveEmployerRating(erData());
    expect(
      ratingStorage.hasEmployerRatedWorker("WM-ER01-TEC-AB12", "job_001", "WM-EE01-RAH-CD34"),
    ).toBe(true);
  });

  it("hasEmployerRatedWorker returns false for different job", () => {
    ratingStorage.saveEmployerRating(erData());
    expect(
      ratingStorage.hasEmployerRatedWorker("WM-ER01-TEC-AB12", "job_999", "WM-EE01-RAH-CD34"),
    ).toBe(false);
  });

  it("hasWorkerRatedEmployer returns true when rated", () => {
    ratingStorage.saveWorkerRating(wrData());
    expect(
      ratingStorage.hasWorkerRatedEmployer("WM-EE01-RAH-CD34", "job_001", "WM-ER01-TEC-AB12"),
    ).toBe(true);
  });
});

/* ── Get Specific Rating ── */
describe("get specific rating", () => {
  it("getEmployerRatingForJob returns correct rating", () => {
    ratingStorage.saveEmployerRating(erData());
    const r = ratingStorage.getEmployerRatingForJob("WM-ER01-TEC-AB12", "job_001", "WM-EE01-RAH-CD34");
    expect(r).not.toBeNull();
    expect(r!.stars).toBe(4);
  });

  it("getWorkerRatingForJob returns null when not found", () => {
    expect(ratingStorage.getWorkerRatingForJob("X", "Y", "Z")).toBeNull();
  });
});

/* ── Edit — Within 48 Hours ── */
describe("edit within 48hr window", () => {
  it("editEmployerRating succeeds within window", () => {
    ratingStorage.saveEmployerRating(erData());
    const result = ratingStorage.editEmployerRating(
      "WM-ER01-TEC-AB12", "job_001", "WM-EE01-RAH-CD34",
      { stars: 5, tags: ["Skilled"] as EmployerWorkerTag[], comment: "Updated", hireAgain: true },
    );

    expect(result.success).toBe(true);
    const updated = ratingStorage.getEmployerRatingForJob("WM-ER01-TEC-AB12", "job_001", "WM-EE01-RAH-CD34");
    expect(updated!.stars).toBe(5);
    expect(updated!.editCount).toBe(1);
    expect(updated!.editedAt).toBeTypeOf("number");
  });

  it("editWorkerRating succeeds within window", () => {
    ratingStorage.saveWorkerRating(wrData());
    const result = ratingStorage.editWorkerRating(
      "WM-EE01-RAH-CD34", "job_001", "WM-ER01-TEC-AB12",
      { stars: 3, tags: ["Safe workplace"] as WorkerEmployerTag[], workAgain: false },
    );

    expect(result.success).toBe(true);
  });
});

/* ── Edit — Second Edit Blocked ── */
describe("edit blocked after first edit", () => {
  it("employer second edit fails", () => {
    ratingStorage.saveEmployerRating(erData());
    ratingStorage.editEmployerRating(
      "WM-ER01-TEC-AB12", "job_001", "WM-EE01-RAH-CD34",
      { stars: 5, tags: [], hireAgain: true },
    );
    const second = ratingStorage.editEmployerRating(
      "WM-ER01-TEC-AB12", "job_001", "WM-EE01-RAH-CD34",
      { stars: 1, tags: [], hireAgain: false },
    );

    expect(second.success).toBe(false);
    if (!second.success) {
      expect(second.reason).toContain("Already edited");
    }
  });

  it("worker second edit fails", () => {
    ratingStorage.saveWorkerRating(wrData());
    ratingStorage.editWorkerRating(
      "WM-EE01-RAH-CD34", "job_001", "WM-ER01-TEC-AB12",
      { stars: 4, tags: [], workAgain: true },
    );
    const second = ratingStorage.editWorkerRating(
      "WM-EE01-RAH-CD34", "job_001", "WM-ER01-TEC-AB12",
      { stars: 1, tags: [], workAgain: false },
    );

    expect(second.success).toBe(false);
  });
});

/* ── Edit — 48 Hour Window Expired ── */
describe("edit blocked after 48 hours", () => {
  it("employer edit fails after window", () => {
    vi.useFakeTimers();
    const baseTime = new Date("2026-03-01T10:00:00Z").getTime();
    vi.setSystemTime(baseTime);

    ratingStorage.saveEmployerRating(erData());

    // Advance past 48 hours
    vi.setSystemTime(baseTime + FORTY_EIGHT_HRS_MS + 1000);

    const result = ratingStorage.editEmployerRating(
      "WM-ER01-TEC-AB12", "job_001", "WM-EE01-RAH-CD34",
      { stars: 1, tags: [], hireAgain: false },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toContain("expired");
    }
  });

  it("canEditEmployerRating returns false after window", () => {
    vi.useFakeTimers();
    const baseTime = new Date("2026-03-01T10:00:00Z").getTime();
    vi.setSystemTime(baseTime);

    ratingStorage.saveEmployerRating(erData());
    expect(ratingStorage.canEditEmployerRating("WM-ER01-TEC-AB12", "job_001", "WM-EE01-RAH-CD34")).toBe(true);

    vi.setSystemTime(baseTime + FORTY_EIGHT_HRS_MS + 1000);
    expect(ratingStorage.canEditEmployerRating("WM-ER01-TEC-AB12", "job_001", "WM-EE01-RAH-CD34")).toBe(false);
  });
});

/* ── Edit — Rating Not Found ── */
describe("edit non-existent rating", () => {
  it("editEmployerRating returns not found", () => {
    const result = ratingStorage.editEmployerRating(
      "FAKE", "FAKE", "FAKE",
      { stars: 3, tags: [], hireAgain: true },
    );
    expect(result.success).toBe(false);
    if (!result.success) expect(result.reason).toContain("not found");
  });
});

/* ── Worker Summary ── */
describe("getWorkerSummary", () => {
  it("returns correct summary with multiple ratings", () => {
    ratingStorage.saveEmployerRating(erData({ stars: 5, tags: ["Reliable", "Skilled"] }));
    ratingStorage.saveEmployerRating(erData({ jobId: "j2", stars: 3, tags: ["Reliable"] }));

    const summary = ratingStorage.getWorkerSummary("WM-EE01-RAH-CD34");

    expect(summary.totalRatings).toBe(2);
    expect(summary.averageStars).toBe(4); // (5+3)/2
    expect(summary.hireAgainCount).toBe(2);
    expect(summary.tagCounts["Reliable"]).toBe(2);
    expect(summary.tagCounts["Skilled"]).toBe(1);
  });

  it("returns zero summary for unknown worker", () => {
    const summary = ratingStorage.getWorkerSummary("UNKNOWN");
    expect(summary.totalRatings).toBe(0);
    expect(summary.averageStars).toBe(0);
  });
});

/* ── Employer Summary ── */
describe("getEmployerSummary", () => {
  it("returns correct summary", () => {
    ratingStorage.saveWorkerRating(wrData({ stars: 4 }));
    ratingStorage.saveWorkerRating(wrData({ jobId: "j2", stars: 5, workAgain: false }));

    const summary = ratingStorage.getEmployerSummary("WM-ER01-TEC-AB12");

    expect(summary.totalRatings).toBe(2);
    expect(summary.averageStars).toBe(4.5);
    expect(summary.workAgainCount).toBe(1); // only first one
  });
});

/* ── Corrupted Storage Resilience ── */
describe("corrupted storage", () => {
  it("returns empty array for invalid JSON in ER key", () => {
    localStorage.setItem(ER_KEY, "BROKEN");
    expect(ratingStorage.getAllERRatings()).toEqual([]);
  });

  it("returns empty array for non-array JSON in WR key", () => {
    localStorage.setItem(WR_KEY, '{"not":"array"}');
    expect(ratingStorage.getAllWRRatings()).toEqual([]);
  });

  it("skips malformed entries during parse", () => {
    localStorage.setItem(ER_KEY, JSON.stringify([
      { id: "good", domain: "shift", employerWmId: "E", workerWmId: "W", jobId: "J", stars: 4, createdAt: 1000, hireAgain: true },
      { broken: true },
      "not_an_object",
    ]));
    expect(ratingStorage.getAllERRatings()).toHaveLength(1);
  });

  it("rejects stars out of 1-5 range", () => {
    localStorage.setItem(ER_KEY, JSON.stringify([
      { id: "x", domain: "shift", employerWmId: "E", workerWmId: "W", jobId: "J", stars: 0, createdAt: 1000, hireAgain: true },
      { id: "y", domain: "shift", employerWmId: "E", workerWmId: "W", jobId: "J", stars: 6, createdAt: 1000, hireAgain: true },
    ]));
    expect(ratingStorage.getAllERRatings()).toHaveLength(0);
  });
});

/* ── Subscribe ── */
describe("subscribe", () => {
  it("calls listener on rating change", () => {
    const spy = vi.fn();
    const unsub = ratingStorage.subscribe(spy);
    ratingStorage.saveEmployerRating(erData());
    expect(spy).toHaveBeenCalled();
    unsub();
  });

  it("unsubscribe stops calls", () => {
    const spy = vi.fn();
    const unsub = ratingStorage.subscribe(spy);
    unsub();
    ratingStorage.saveEmployerRating(erData());
    expect(spy).not.toHaveBeenCalled();
  });
});