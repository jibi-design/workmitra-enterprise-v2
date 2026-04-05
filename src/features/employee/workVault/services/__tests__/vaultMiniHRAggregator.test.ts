// src/features/employee/workVault/services/__tests__/vaultMiniHRAggregator.test.ts
// Phase B — Mini-HR Aggregator: completed/active records, stats, employment detection.

import { describe, it, expect, beforeEach } from "vitest";
import {
  aggregateMiniHRCompleted,
  aggregateMiniHRActive,
  getMiniHRStats,
  detectMiniHREmployment,
} from "../vaultMiniHRAggregator";

/* ── Storage Key ── */
const MINI_HR_KEY = "wm_career_employment_v1";

/* ── Factory ── */
function seedRecords(records: Record<string, unknown>[]): void {
  localStorage.setItem(MINI_HR_KEY, JSON.stringify(records));
}

function makeRec(overrides?: Record<string, unknown>) {
  return {
    id: "emp_001",
    careerPostId: "post_001",
    companyName: "TechCorp",
    jobTitle: "Engineer",
    department: "IT",
    status: "completed",
    joinedAt: 1000000,
    acceptedAt: 900000,
    completedAt: 2000000,
    exitType: "resigned",
    ...overrides,
  };
}

/* ── Setup ── */
beforeEach(() => { localStorage.clear(); });

/* ── Completed Records ── */
describe("aggregateMiniHRCompleted", () => {
  it("returns completed records as vault entries", () => {
    seedRecords([makeRec()]);
    const result = aggregateMiniHRCompleted();

    expect(result).toHaveLength(1);
    expect(result[0].jobId).toBe("post_001");
    expect(result[0].companyName).toBe("TechCorp");
    expect(result[0].jobTitle).toBe("Engineer");
    expect(result[0].status).toBe("left"); // resigned → left
  });

  it("maps terminated exitType correctly", () => {
    seedRecords([makeRec({ exitType: "terminated" })]);
    expect(aggregateMiniHRCompleted()[0].status).toBe("terminated");
  });

  it("maps null/unknown exitType to completed", () => {
    seedRecords([makeRec({ exitType: "" })]);
    expect(aggregateMiniHRCompleted()[0].status).toBe("completed");
  });

  it("excludes non-completed records", () => {
    seedRecords([
      makeRec({ status: "working" }),
      makeRec({ careerPostId: "p2", status: "completed" }),
    ]);
    expect(aggregateMiniHRCompleted()).toHaveLength(1);
  });

  it("sorts by endedAt descending (newest first)", () => {
    seedRecords([
      makeRec({ careerPostId: "p1", completedAt: 1000 }),
      makeRec({ careerPostId: "p2", completedAt: 3000 }),
    ]);
    const result = aggregateMiniHRCompleted();
    expect(result[0].jobId).toBe("p2");
  });

  it("falls back to careerPostId then id for jobId", () => {
    seedRecords([makeRec({ careerPostId: "", id: "fallback_id" })]);
    expect(aggregateMiniHRCompleted()[0].jobId).toBe("fallback_id");
  });

  it("uses acceptedAt when joinedAt is missing", () => {
    seedRecords([makeRec({ joinedAt: 0, acceptedAt: 5000 })]);
    expect(aggregateMiniHRCompleted()[0].hiredAt).toBe(5000);
  });

  it("returns empty for empty storage", () => {
    expect(aggregateMiniHRCompleted()).toEqual([]);
  });

  it("handles corrupted storage gracefully", () => {
    localStorage.setItem(MINI_HR_KEY, "NOT_JSON");
    expect(aggregateMiniHRCompleted()).toEqual([]);
  });
});

/* ── Active Records ── */
describe("aggregateMiniHRActive", () => {
  it("returns working records", () => {
    seedRecords([makeRec({ status: "working" })]);
    const result = aggregateMiniHRActive();

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("hired");
    expect(result[0].endedAt).toBeNull();
  });

  it("includes notice status as active", () => {
    seedRecords([makeRec({ status: "notice" })]);
    expect(aggregateMiniHRActive()).toHaveLength(1);
  });

  it("excludes completed and selected", () => {
    seedRecords([
      makeRec({ careerPostId: "p1", status: "completed" }),
      makeRec({ careerPostId: "p2", status: "selected" }),
    ]);
    expect(aggregateMiniHRActive()).toHaveLength(0);
  });
});

/* ── Stats ── */
describe("getMiniHRStats", () => {
  it("counts completed records", () => {
    seedRecords([
      makeRec({ careerPostId: "p1", status: "completed" }),
      makeRec({ careerPostId: "p2", status: "working" }),
      makeRec({ careerPostId: "p3", status: "completed" }),
    ]);
    const stats = getMiniHRStats();

    expect(stats.completedCount).toBe(2);
    expect(stats.coveredPostIds.size).toBe(3);
  });

  it("tracks unique companies (case-insensitive)", () => {
    seedRecords([
      makeRec({ careerPostId: "p1", companyName: "TechCorp" }),
      makeRec({ careerPostId: "p2", companyName: "techcorp" }),
      makeRec({ careerPostId: "p3", companyName: "OtherCo" }),
    ]);
    expect(getMiniHRStats().companies.size).toBe(2);
  });

  it("returns zeros for empty storage", () => {
    const stats = getMiniHRStats();
    expect(stats.completedCount).toBe(0);
    expect(stats.coveredPostIds.size).toBe(0);
  });
});

/* ── Employment Detection ── */
describe("detectMiniHREmployment", () => {
  it("detects working status", () => {
    seedRecords([makeRec({ status: "working", companyName: "Corp", jobTitle: "Dev" })]);
    const result = detectMiniHREmployment();

    expect(result.isEmployed).toBe(true);
    expect(result.currentCompany).toBe("Corp");
    expect(result.currentJobTitle).toBe("Dev");
  });

  it("detects notice status as employed", () => {
    seedRecords([makeRec({ status: "notice" })]);
    expect(detectMiniHREmployment().isEmployed).toBe(true);
  });

  it("returns not employed for completed-only", () => {
    seedRecords([makeRec({ status: "completed" })]);
    const result = detectMiniHREmployment();

    expect(result.isEmployed).toBe(false);
    expect(result.currentCompany).toBe("");
  });

  it("returns not employed for empty storage", () => {
    expect(detectMiniHREmployment().isEmployed).toBe(false);
  });
});