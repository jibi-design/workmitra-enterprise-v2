// src/shared/employment/__tests__/employmentStorage.test.ts
// Phase A — Employment Storage: create, queries, rating flags, subscribe.

import { describe, it, expect, beforeEach, vi } from "vitest";
import { employmentStorage } from "../employmentStorage";
import { EMPLOYMENT_KEY, CHANGE_EVENT } from "../employmentStorageHelpers";
import type { NoticePeriodDays } from "../employmentTypes";

/* ── Test Data Factory ── */
function makeParams(overrides?: Partial<Parameters<typeof employmentStorage.create>[0]>) {
  return {
    careerPostId: "post_001",
    employeeId: "ee_001",
    employeeName: "Rahul",
    employeeWmId: "WM-AB12-RAH-CD34",
    employerId: "er_001",
    companyName: "TechCorp",
    employerWmId: "WM-XY56-TEC-ZW78",
    jobTitle: "Site Engineer",
    department: "Construction",
    salaryMin: 25000,
    salaryMax: 35000,
    salaryPeriod: "monthly",
    noticePeriodDays: 7 as NoticePeriodDays,
    ...overrides,
  };
}

/* ── Setup ── */
beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

/* ── Create ── */
describe("employmentStorage.create", () => {
  it("creates a record with correct initial state", () => {
    const rec = employmentStorage.create(makeParams());

    expect(rec.id).toMatch(/^emp_post_001_/);
    expect(rec.status).toBe("selected");
    expect(rec.careerPostId).toBe("post_001");
    expect(rec.employeeName).toBe("Rahul");
    expect(rec.joinedAt).toBeNull();
    expect(rec.resignedAt).toBeNull();
    expect(rec.completedAt).toBeNull();
    expect(rec.exitType).toBeNull();
    expect(rec.exitReason).toBeNull();
    expect(rec.exitNotes).toBe("");
    expect(rec.wasWithdrawn).toBe(false);
    expect(rec.employeeRated).toBe(false);
    expect(rec.employerRated).toBe(false);
    expect(rec.timeline).toHaveLength(1);
    expect(rec.timeline[0].status).toBe("selected");
    expect(rec.timeline[0].actor).toBe("system");
  });

  it("persists to localStorage", () => {
    employmentStorage.create(makeParams());
    const raw = localStorage.getItem(EMPLOYMENT_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!) as unknown[];
    expect(parsed).toHaveLength(1);
  });

  it("appends multiple records without overwriting", () => {
    employmentStorage.create(makeParams({ careerPostId: "post_001" }));
    employmentStorage.create(makeParams({ careerPostId: "post_002" }));
    expect(employmentStorage.getAll()).toHaveLength(2);
  });

  it("generates unique IDs for different posts", () => {
    const r1 = employmentStorage.create(makeParams({ careerPostId: "post_a" }));
    const r2 = employmentStorage.create(makeParams({ careerPostId: "post_b" }));
    expect(r1.id).not.toBe(r2.id);
  });

  it("dispatches change event", () => {
    const spy = vi.fn();
    window.addEventListener(CHANGE_EVENT, spy);
    employmentStorage.create(makeParams());
    window.removeEventListener(CHANGE_EVENT, spy);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

/* ── Queries ── */
describe("employmentStorage queries", () => {
  beforeEach(() => {
    employmentStorage.create(makeParams({ careerPostId: "p1", employeeId: "ee_A" }));
    employmentStorage.create(makeParams({ careerPostId: "p2", employeeId: "ee_A" }));
    employmentStorage.create(makeParams({ careerPostId: "p3", employeeId: "ee_B" }));
  });

  it("getAll returns all records", () => {
    expect(employmentStorage.getAll()).toHaveLength(3);
  });

  it("getByPostId finds correct record", () => {
    const rec = employmentStorage.getByPostId("p2");
    expect(rec).not.toBeNull();
    expect(rec!.careerPostId).toBe("p2");
  });

  it("getByPostId returns null for unknown post", () => {
    expect(employmentStorage.getByPostId("unknown")).toBeNull();
  });

  it("getByEmployee filters by employeeId", () => {
    expect(employmentStorage.getByEmployee("ee_A")).toHaveLength(2);
    expect(employmentStorage.getByEmployee("ee_B")).toHaveLength(1);
    expect(employmentStorage.getByEmployee("ee_Z")).toHaveLength(0);
  });

  it("getActiveByEmployee returns only active statuses", () => {
    // All are "selected" status — which is active
    expect(employmentStorage.getActiveByEmployee("ee_A")).toHaveLength(2);
  });

  it("hasActiveEmployment returns false for selected-only (not working/notice)", () => {
    // "selected" is NOT in ["working", "notice"] so should be false
    expect(employmentStorage.hasActiveEmployment("ee_A")).toBe(false);
  });
});

/* ── Corrupted Storage ── */
describe("corrupted localStorage", () => {
  it("returns empty array for invalid JSON", () => {
    localStorage.setItem(EMPLOYMENT_KEY, "NOT_VALID_JSON");
    expect(employmentStorage.getAll()).toEqual([]);
  });

  it("returns empty array for non-array JSON", () => {
    localStorage.setItem(EMPLOYMENT_KEY, '{"not":"array"}');
    expect(employmentStorage.getAll()).toEqual([]);
  });

  it("returns empty array for null value", () => {
    expect(employmentStorage.getAll()).toEqual([]);
  });
});

/* ── Rating Flags ── */
describe("rating flags", () => {
  it("markEmployeeRated sets flag to true", () => {
    employmentStorage.create(makeParams({ careerPostId: "p1" }));
    employmentStorage.markEmployeeRated("p1");
    expect(employmentStorage.getByPostId("p1")!.employeeRated).toBe(true);
  });

  it("markEmployerRated sets flag to true", () => {
    employmentStorage.create(makeParams({ careerPostId: "p1" }));
    employmentStorage.markEmployerRated("p1");
    expect(employmentStorage.getByPostId("p1")!.employerRated).toBe(true);
  });

  it("ignores unknown careerPostId silently", () => {
    employmentStorage.create(makeParams({ careerPostId: "p1" }));
    employmentStorage.markEmployeeRated("unknown");
    expect(employmentStorage.getByPostId("p1")!.employeeRated).toBe(false);
  });
});

/* ── Subscribe ── */
describe("subscribe", () => {
  it("calls listener on change event", () => {
    const spy = vi.fn();
    const unsub = employmentStorage.subscribe(spy);
    window.dispatchEvent(new Event(CHANGE_EVENT));
    expect(spy).toHaveBeenCalledTimes(1);
    unsub();
  });

  it("unsubscribe stops further calls", () => {
    const spy = vi.fn();
    const unsub = employmentStorage.subscribe(spy);
    unsub();
    window.dispatchEvent(new Event(CHANGE_EVENT));
    expect(spy).not.toHaveBeenCalled();
  });
});