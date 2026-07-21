import { describe, it, expect } from "vitest";
import { ratingStorage } from "../ratingStorage";
import { ER_KEY, WR_KEY, erData, wrData } from "./ratingStorage.test.helpers";

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

describe("saveWorkerRating", () => {
  it("saves and persists to localStorage", () => {
    const rating = ratingStorage.saveWorkerRating(wrData());

    expect(rating.id).toMatch(/^wr_/);
    expect(rating.stars).toBe(5);
    expect(rating.editCount).toBe(0);
    expect(localStorage.getItem(WR_KEY)).not.toBeNull();
  });
});

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

describe("get specific rating", () => {
  it("getEmployerRatingForJob returns correct rating", () => {
    ratingStorage.saveEmployerRating(erData());
    const r = ratingStorage.getEmployerRatingForJob(
      "WM-ER01-TEC-AB12",
      "job_001",
      "WM-EE01-RAH-CD34",
    );
    expect(r).not.toBeNull();
    expect(r!.stars).toBe(4);
  });

  it("getWorkerRatingForJob returns null when not found", () => {
    expect(ratingStorage.getWorkerRatingForJob("X", "Y", "Z")).toBeNull();
  });
});

describe("getWorkerSummary", () => {
  it("returns correct summary with multiple ratings", () => {
    ratingStorage.saveEmployerRating(erData({ stars: 5, tags: ["Reliable", "Skilled"] }));
    ratingStorage.saveEmployerRating(erData({ jobId: "j2", stars: 3, tags: ["Reliable"] }));

    const summary = ratingStorage.getWorkerSummary("WM-EE01-RAH-CD34");

    expect(summary.totalRatings).toBe(2);
    expect(summary.averageStars).toBe(4);
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

describe("getEmployerSummary", () => {
  it("returns correct summary", () => {
    ratingStorage.saveWorkerRating(wrData({ stars: 4 }));
    ratingStorage.saveWorkerRating(wrData({ jobId: "j2", stars: 5, workAgain: false }));

    const summary = ratingStorage.getEmployerSummary("WM-ER01-TEC-AB12");

    expect(summary.totalRatings).toBe(2);
    expect(summary.averageStars).toBe(4.5);
    expect(summary.workAgainCount).toBe(1);
  });
});
