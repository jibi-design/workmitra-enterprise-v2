// src/shared/employment/__tests__/forceComplete.test.ts
// Session 19: Force Complete feature — employee auto-close after employer unresponsive.

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { employmentActions } from "../employmentActions";
import { employmentStorage } from "../employmentStorage";
import {
  canForceComplete,
  getDaysUntilForceComplete,
  getStatusBadge,
  getStatusLabel,
  getEmployeeActions,
} from "../employmentDisplayHelpers";
import type { NoticePeriodDays, EmploymentRecord } from "../employmentTypes";
import { FORCE_COMPLETE_GRACE_DAYS } from "../employmentTypes";

/* ── Mock Notifications ── */
vi.mock("../employmentNotifications", () => ({
  notifyEmployeeJoined: vi.fn(),
  notifyEmployerResignation: vi.fn(),
  notifyEmployerWithdrawal: vi.fn(),
  notifyEmployeeResignConfirmed: vi.fn(),
  notifyEmployeeTerminated: vi.fn(),
  notifyBothPleaseRate: vi.fn(),
  notifyEmployerForceCompleted: vi.fn(),
}));

import { notifyEmployerForceCompleted, notifyBothPleaseRate } from "../employmentNotifications";

/* ── Constants ── */
const GRACE_MS = FORCE_COMPLETE_GRACE_DAYS * 86_400_000;

/* ── Factory ── */
function seedWorking(postId = "post_fc", noticeDays: NoticePeriodDays = 7): void {
  employmentStorage.create({
    careerPostId: postId,
    employeeId: "ee_fc",
    employeeName: "Rahul",
    employeeWmId: "WM-FC01-RAH-1234",
    employerId: "er_fc",
    companyName: "TechCorp",
    employerWmId: "WM-FC02-TEC-5678",
    jobTitle: "Engineer",
    department: "IT",
    salaryMin: 25000,
    salaryMax: 35000,
    salaryPeriod: "monthly",
    noticePeriodDays: noticeDays,
  });
  employmentActions.markAsJoined(postId, Date.now() - 90 * 86_400_000);
}

function getRecord(postId = "post_fc"): EmploymentRecord {
  return employmentStorage.getByPostId(postId)!;
}

/* ── Setup ── */
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  vi.useRealTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

/* ═══ canForceComplete() — Eligibility ═══ */
describe("canForceComplete", () => {
  it("returns false for working status", () => {
    seedWorking();
    expect(canForceComplete(getRecord())).toBe(false);
  });

  it("returns false immediately after resign (within grace period)", () => {
    seedWorking();
    employmentActions.resign("post_fc", "personal_reasons", "");
    expect(canForceComplete(getRecord())).toBe(false);
  });

  it("returns false at exactly 6 days after notice expires", () => {
    vi.useFakeTimers();
    const baseTime = new Date("2026-04-01T00:00:00Z").getTime();
    vi.setSystemTime(baseTime);

    seedWorking();
    employmentActions.resign("post_fc", "other", "");

    const rec = getRecord();
    // Advance to lastWorkingDay + 6 days (not yet 7)
    const lwdPlus6 = rec.lastWorkingDay! + 6 * 86_400_000;
    vi.setSystemTime(lwdPlus6);

    expect(canForceComplete(getRecord())).toBe(false);
  });

  it("returns true after notice expires + 7 days", () => {
    vi.useFakeTimers();
    const baseTime = new Date("2026-04-01T00:00:00Z").getTime();
    vi.setSystemTime(baseTime);

    seedWorking();
    employmentActions.resign("post_fc", "other", "");

    const rec = getRecord();
    // Advance past lastWorkingDay + 7 days
    vi.setSystemTime(rec.lastWorkingDay! + GRACE_MS + 1000);

    expect(canForceComplete(getRecord())).toBe(true);
  });

  it("returns true for resigned status (no notice) after 7 days", () => {
    vi.useFakeTimers();
    const baseTime = new Date("2026-04-01T00:00:00Z").getTime();
    vi.setSystemTime(baseTime);

    seedWorking("post_no_notice", 0);
    employmentActions.resign("post_no_notice", "other", "");

    const rec = employmentStorage.getByPostId("post_no_notice")!;
    vi.setSystemTime(rec.resignedAt! + GRACE_MS + 1000);

    expect(canForceComplete(employmentStorage.getByPostId("post_no_notice")!)).toBe(true);
  });

  it("returns false for selected status", () => {
    employmentStorage.create({
      careerPostId: "post_sel", employeeId: "ee", employeeName: "X",
      employeeWmId: "WM-X", employerId: "er", companyName: "C",
      employerWmId: "WM-C", jobTitle: "J", department: "D",
      salaryMin: 0, salaryMax: 0, salaryPeriod: "monthly", noticePeriodDays: 0,
    });
    expect(canForceComplete(employmentStorage.getByPostId("post_sel")!)).toBe(false);
  });

  it("returns false for completed status", () => {
    seedWorking("post_done", 0);
    employmentActions.resign("post_done", "other", "");
    employmentActions.confirmResignation("post_done");
    expect(canForceComplete(employmentStorage.getByPostId("post_done")!)).toBe(false);
  });
});

/* ═══ getDaysUntilForceComplete() — Countdown ═══ */
describe("getDaysUntilForceComplete", () => {
  it("returns -1 for working status", () => {
    seedWorking();
    expect(getDaysUntilForceComplete(getRecord())).toBe(-1);
  });

  it("returns correct countdown after resign", () => {
    vi.useFakeTimers();
    const baseTime = new Date("2026-04-01T00:00:00Z").getTime();
    vi.setSystemTime(baseTime);

    seedWorking();
    employmentActions.resign("post_fc", "other", "");

    const rec = getRecord();
    // Move to 2 days after lastWorkingDay — should have 5 days remaining
    vi.setSystemTime(rec.lastWorkingDay! + 2 * 86_400_000);
    expect(getDaysUntilForceComplete(getRecord())).toBe(5);
  });

  it("returns 0 when eligible", () => {
    vi.useFakeTimers();
    const baseTime = new Date("2026-04-01T00:00:00Z").getTime();
    vi.setSystemTime(baseTime);

    seedWorking();
    employmentActions.resign("post_fc", "other", "");

    const rec = getRecord();
    vi.setSystemTime(rec.lastWorkingDay! + GRACE_MS + 86_400_000);
    expect(getDaysUntilForceComplete(getRecord())).toBe(0);
  });
});

/* ═══ employmentActions.forceComplete() — Action ═══ */
describe("forceComplete action", () => {
  it("completes employment with forceCompleted flag", () => {
    vi.useFakeTimers();
    const baseTime = new Date("2026-04-01T00:00:00Z").getTime();
    vi.setSystemTime(baseTime);

    seedWorking();
    employmentActions.resign("post_fc", "other", "");

    const rec = getRecord();
    vi.setSystemTime(rec.lastWorkingDay! + GRACE_MS + 1000);

    const result = employmentActions.forceComplete("post_fc");

    expect(result).not.toBeNull();
    expect(result!.status).toBe("completed");
    expect(result!.forceCompleted).toBe(true);
    expect(result!.completedAt).toBeTypeOf("number");
  });

  it("calculates work duration", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));

    seedWorking();
    employmentActions.resign("post_fc", "other", "");

    const rec = getRecord();
    vi.setSystemTime(rec.lastWorkingDay! + GRACE_MS + 1000);

    const result = employmentActions.forceComplete("post_fc");
    expect(result!.workDurationDays).toBeTypeOf("number");
    expect(result!.workDurationDays!).toBeGreaterThan(0);
    expect(result!.workDurationDisplay).toBeTruthy();
  });

  it("adds timeline entry", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));

    seedWorking();
    employmentActions.resign("post_fc", "other", "");

    const rec = getRecord();
    vi.setSystemTime(rec.lastWorkingDay! + GRACE_MS + 1000);

    const result = employmentActions.forceComplete("post_fc");
    const fcEntry = result!.timeline.find((t) => t.note.includes("Force completed"));

    expect(fcEntry).toBeDefined();
    expect(fcEntry!.actor).toBe("employee");
    expect(fcEntry!.status).toBe("completed");
  });

  it("fires employer + rate notifications", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));

    seedWorking();
    employmentActions.resign("post_fc", "other", "");

    const rec = getRecord();
    vi.setSystemTime(rec.lastWorkingDay! + GRACE_MS + 1000);

    employmentActions.forceComplete("post_fc");

    expect(notifyEmployerForceCompleted).toHaveBeenCalledWith("Rahul", "Engineer");
    expect(notifyBothPleaseRate).toHaveBeenCalled();
  });

  it("rejects before grace period", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));

    seedWorking();
    employmentActions.resign("post_fc", "other", "");

    const rec = getRecord();
    vi.setSystemTime(rec.lastWorkingDay! + 3 * 86_400_000); // Only 3 days

    expect(employmentActions.forceComplete("post_fc")).toBeNull();
  });

  it("rejects from working status", () => {
    seedWorking();
    expect(employmentActions.forceComplete("post_fc")).toBeNull();
  });

  it("rejects unknown post", () => {
    expect(employmentActions.forceComplete("unknown")).toBeNull();
  });
});

/* ═══ Badge Display ═══ */
describe("force complete badge", () => {
  it("shows 'Completed (unconfirmed)' badge", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));

    seedWorking();
    employmentActions.resign("post_fc", "other", "");

    const rec = getRecord();
    vi.setSystemTime(rec.lastWorkingDay! + GRACE_MS + 1000);
    employmentActions.forceComplete("post_fc");

    const updated = getRecord();
    expect(getStatusBadge(updated).label).toBe("Completed (unconfirmed)");
    expect(getStatusBadge(updated).color).toBe("#b45309");
    expect(getStatusLabel(updated)).toBe("Completed (unconfirmed)");
  });

  it("terminated badge takes priority over force complete", () => {
    seedWorking("post_term");
    employmentActions.terminate("post_term", "misconduct", "");
    const terminated = employmentStorage.getByPostId("post_term")!;

    expect(getStatusBadge(terminated).label).toBe("Terminated");
  });
});

/* ═══ getEmployeeActions includes canForceComplete ═══ */
describe("getEmployeeActions with forceComplete", () => {
  it("includes canForceComplete = false for working", () => {
    seedWorking();
    expect(getEmployeeActions(getRecord()).canForceComplete).toBe(false);
  });

  it("includes canForceComplete = true when eligible", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));

    seedWorking();
    employmentActions.resign("post_fc", "other", "");

    const rec = getRecord();
    vi.setSystemTime(rec.lastWorkingDay! + GRACE_MS + 1000);

    expect(getEmployeeActions(getRecord()).canForceComplete).toBe(true);
  });
});