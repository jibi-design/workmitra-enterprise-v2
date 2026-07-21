import { describe, it, expect, vi } from "vitest";
import { ratingStorage } from "../ratingStorage";
import type { EmployerWorkerTag, WorkerEmployerTag } from "../ratingTypes";
import { ER_KEY, FORTY_EIGHT_HRS_MS, WR_KEY, erData, wrData } from "./ratingStorage.test.helpers";

describe("edit within 48hr window", () => {
  it("editEmployerRating succeeds within window", () => {
    ratingStorage.saveEmployerRating(erData());
    const result = ratingStorage.editEmployerRating(
      "WM-ER01-TEC-AB12",
      "job_001",
      "WM-EE01-RAH-CD34",
      { stars: 5, tags: ["Skilled"] as EmployerWorkerTag[], comment: "Updated", hireAgain: true },
    );

    expect(result.success).toBe(true);
    const updated = ratingStorage.getEmployerRatingForJob(
      "WM-ER01-TEC-AB12",
      "job_001",
      "WM-EE01-RAH-CD34",
    );
    expect(updated!.stars).toBe(5);
    expect(updated!.editCount).toBe(1);
    expect(updated!.editedAt).toBeTypeOf("number");
  });

  it("editWorkerRating succeeds within window", () => {
    ratingStorage.saveWorkerRating(wrData());
    const result = ratingStorage.editWorkerRating(
      "WM-EE01-RAH-CD34",
      "job_001",
      "WM-ER01-TEC-AB12",
      { stars: 3, tags: ["Safe workplace"] as WorkerEmployerTag[], workAgain: false },
    );

    expect(result.success).toBe(true);
  });
});

describe("edit blocked after first edit", () => {
  it("employer second edit fails", () => {
    ratingStorage.saveEmployerRating(erData());
    ratingStorage.editEmployerRating("WM-ER01-TEC-AB12", "job_001", "WM-EE01-RAH-CD34", {
      stars: 5,
      tags: [],
      hireAgain: true,
    });
    const second = ratingStorage.editEmployerRating(
      "WM-ER01-TEC-AB12",
      "job_001",
      "WM-EE01-RAH-CD34",
      { stars: 1, tags: [], hireAgain: false },
    );

    expect(second.success).toBe(false);
    if (!second.success) {
      expect(second.reason).toContain("Already edited");
    }
  });

  it("worker second edit fails", () => {
    ratingStorage.saveWorkerRating(wrData());
    ratingStorage.editWorkerRating("WM-EE01-RAH-CD34", "job_001", "WM-ER01-TEC-AB12", {
      stars: 4,
      tags: [],
      workAgain: true,
    });
    const second = ratingStorage.editWorkerRating(
      "WM-EE01-RAH-CD34",
      "job_001",
      "WM-ER01-TEC-AB12",
      { stars: 1, tags: [], workAgain: false },
    );

    expect(second.success).toBe(false);
  });
});

describe("edit blocked after 48 hours", () => {
  it("employer edit fails after window", () => {
    vi.useFakeTimers();
    const baseTime = new Date("2026-03-01T10:00:00Z").getTime();
    vi.setSystemTime(baseTime);

    ratingStorage.saveEmployerRating(erData());

    vi.setSystemTime(baseTime + FORTY_EIGHT_HRS_MS + 1000);

    const result = ratingStorage.editEmployerRating(
      "WM-ER01-TEC-AB12",
      "job_001",
      "WM-EE01-RAH-CD34",
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
    expect(
      ratingStorage.canEditEmployerRating("WM-ER01-TEC-AB12", "job_001", "WM-EE01-RAH-CD34"),
    ).toBe(true);

    vi.setSystemTime(baseTime + FORTY_EIGHT_HRS_MS + 1000);
    expect(
      ratingStorage.canEditEmployerRating("WM-ER01-TEC-AB12", "job_001", "WM-EE01-RAH-CD34"),
    ).toBe(false);
  });
});

describe("edit non-existent rating", () => {
  it("editEmployerRating returns not found", () => {
    const result = ratingStorage.editEmployerRating("FAKE", "FAKE", "FAKE", {
      stars: 3,
      tags: [],
      hireAgain: true,
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.reason).toContain("not found");
  });
});

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
    localStorage.setItem(
      ER_KEY,
      JSON.stringify([
        {
          id: "good",
          domain: "shift",
          employerMlId: "E",
          workerMlId: "W",
          jobId: "J",
          stars: 4,
          createdAt: 1000,
          hireAgain: true,
        },
        { broken: true },
        "not_an_object",
      ]),
    );
    expect(ratingStorage.getAllERRatings()).toHaveLength(1);
  });

  it("rejects stars out of 1-5 range", () => {
    localStorage.setItem(
      ER_KEY,
      JSON.stringify([
        {
          id: "x",
          domain: "shift",
          employerMlId: "E",
          workerMlId: "W",
          jobId: "J",
          stars: 0,
          createdAt: 1000,
          hireAgain: true,
        },
        {
          id: "y",
          domain: "shift",
          employerMlId: "E",
          workerMlId: "W",
          jobId: "J",
          stars: 6,
          createdAt: 1000,
          hireAgain: true,
        },
      ]),
    );
    expect(ratingStorage.getAllERRatings()).toHaveLength(0);
  });
});

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
