// src/shared/employment/__tests__/employmentActions.test.ts
// Phase A — Employment Actions: status transitions, edge cases, notification triggers.

import { describe, it, expect, beforeEach, vi } from "vitest";
import { employmentActions } from "../employmentActions";
import { employmentStorage } from "../employmentStorage";

import type { NoticePeriodDays, EmploymentRecord } from "../employmentTypes";

/* ── Mock Notifications ── */
vi.mock("../employmentNotifications", () => ({
  notifyEmployeeJoined: vi.fn(),
  notifyEmployerResignation: vi.fn(),
  notifyEmployerWithdrawal: vi.fn(),
  notifyEmployeeResignConfirmed: vi.fn(),
  notifyEmployeeTerminated: vi.fn(),
  notifyBothPleaseRate: vi.fn(),
}));

import {
  notifyEmployeeJoined,
  notifyEmployerResignation,
  notifyEmployerWithdrawal,
  notifyEmployeeResignConfirmed,
  notifyEmployeeTerminated,
  notifyBothPleaseRate,
} from "../employmentNotifications";

/* ── Factory ── */
function seedRecord(overrides?: Partial<Parameters<typeof employmentStorage.create>[0]>) {
  return employmentStorage.create({
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
  });
}

/* ── Setup ── */
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

/* ── Mark as Joined ── */
describe("markAsJoined", () => {
  it("transitions selected → working", () => {
    seedRecord();
    const joinDate = Date.now();
    const result = employmentActions.markAsJoined("post_001", joinDate);

    expect(result).not.toBeNull();
    expect(result!.status).toBe("working");
    expect(result!.joinedAt).toBe(joinDate);
  });

  it("adds timeline entry", () => {
    seedRecord();
    const result = employmentActions.markAsJoined("post_001", Date.now());
    const entry = result!.timeline.find((t) => t.status === "working");

    expect(entry).toBeDefined();
    expect(entry!.actor).toBe("employer");
  });

  it("fires employee notification", () => {
    seedRecord();
    employmentActions.markAsJoined("post_001", Date.now());
    expect(notifyEmployeeJoined).toHaveBeenCalledWith("Site Engineer", "TechCorp");
  });

  it("returns null for unknown post", () => {
    expect(employmentActions.markAsJoined("unknown", Date.now())).toBeNull();
  });

  it("rejects invalid transition (working → working)", () => {
    seedRecord();
    employmentActions.markAsJoined("post_001", Date.now());
    const again = employmentActions.markAsJoined("post_001", Date.now());
    expect(again).toBeNull();
  });

  it("persists to storage", () => {
    seedRecord();
    employmentActions.markAsJoined("post_001", Date.now());
    const stored = employmentStorage.getByPostId("post_001");
    expect(stored!.status).toBe("working");
  });
});

/* ── Resign ── */
describe("resign", () => {
  function makeWorking(postId = "post_001"): EmploymentRecord {
    seedRecord({ careerPostId: postId });
    return employmentActions.markAsJoined(postId, Date.now())!;
  }

  it("transitions working → notice (with notice period)", () => {
    makeWorking();
    const result = employmentActions.resign("post_001", "better_opportunity", "Found better job");

    expect(result).not.toBeNull();
    expect(result!.status).toBe("notice");
    expect(result!.exitType).toBe("resigned");
    expect(result!.exitReason).toBe("better_opportunity");
    expect(result!.resignedAt).toBeTypeOf("number");
    expect(result!.lastWorkingDay).toBeTypeOf("number");
  });

  it("transitions working → resigned (no notice period)", () => {
    seedRecord({ careerPostId: "p_no_notice", noticePeriodDays: 0 as NoticePeriodDays });
    employmentActions.markAsJoined("p_no_notice", Date.now());
    const result = employmentActions.resign("p_no_notice", "personal_reasons", "");

    expect(result!.status).toBe("resigned");
    expect(result!.lastWorkingDay).toBeNull();
  });

  it("calculates lastWorkingDay correctly (7 days)", () => {
    makeWorking();
    const result = employmentActions.resign("post_001", "relocation", "Moving");
    const expectedLwd = result!.resignedAt! + 7 * 86_400_000;

    expect(result!.lastWorkingDay).toBe(expectedLwd);
  });

  it("fires employer notification", () => {
    makeWorking();
    employmentActions.resign("post_001", "health_issues", "");
    expect(notifyEmployerResignation).toHaveBeenCalledWith("Rahul", "Site Engineer");
  });

  it("rejects resign from selected status", () => {
    seedRecord();
    const result = employmentActions.resign("post_001", "other", "");
    expect(result).toBeNull();
  });

  it("rejects resign from completed status", () => {
    makeWorking();
    employmentActions.resign("post_001", "other", "");
    employmentActions.confirmResignation("post_001");
    const result = employmentActions.resign("post_001", "other", "Again");
    expect(result).toBeNull();
  });
});

/* ── Withdraw Resignation ── */
describe("withdrawResignation", () => {
  function makeNotice(): void {
    seedRecord();
    employmentActions.markAsJoined("post_001", Date.now());
    employmentActions.resign("post_001", "personal_reasons", "Changed mind");
  }

  it("transitions notice → working", () => {
    makeNotice();
    const result = employmentActions.withdrawResignation("post_001");

    expect(result).not.toBeNull();
    expect(result!.status).toBe("working");
    expect(result!.wasWithdrawn).toBe(true);
    expect(result!.withdrawnAt).toBeTypeOf("number");
  });

  it("clears exit fields on withdrawal", () => {
    makeNotice();
    const result = employmentActions.withdrawResignation("post_001");

    expect(result!.resignedAt).toBeNull();
    expect(result!.exitType).toBeNull();
    expect(result!.exitReason).toBeNull();
    expect(result!.exitNotes).toBe("");
    expect(result!.lastWorkingDay).toBeNull();
  });

  it("adds withdrawn timeline entry", () => {
    makeNotice();
    const result = employmentActions.withdrawResignation("post_001");
    const entry = result!.timeline.find((t) => t.status === "withdrawn");

    expect(entry).toBeDefined();
    expect(entry!.actor).toBe("employee");
  });

  it("fires employer notification", () => {
    makeNotice();
    employmentActions.withdrawResignation("post_001");
    expect(notifyEmployerWithdrawal).toHaveBeenCalledWith("Rahul", "Site Engineer");
  });

  it("rejects withdrawal from working status", () => {
    seedRecord();
    employmentActions.markAsJoined("post_001", Date.now());
    expect(employmentActions.withdrawResignation("post_001")).toBeNull();
  });

  it("rejects withdrawal from completed status", () => {
    makeNotice();
    employmentActions.confirmResignation("post_001");
    expect(employmentActions.withdrawResignation("post_001")).toBeNull();
  });
});

/* ── Confirm Resignation ── */
describe("confirmResignation", () => {
  function makeResigned(): void {
    seedRecord({ noticePeriodDays: 0 as NoticePeriodDays });
    employmentActions.markAsJoined("post_001", Date.now());
    employmentActions.resign("post_001", "other", "");
  }

  it("transitions resigned → completed", () => {
    makeResigned();
    const result = employmentActions.confirmResignation("post_001");

    expect(result).not.toBeNull();
    expect(result!.status).toBe("completed");
    expect(result!.completedAt).toBeTypeOf("number");
  });

  it("calculates work duration", () => {
    seedRecord({ noticePeriodDays: 0 as NoticePeriodDays });
    const joinDate = Date.now() - 45 * 86_400_000; // 45 days ago
    employmentActions.markAsJoined("post_001", joinDate);
    employmentActions.resign("post_001", "other", "");
    const result = employmentActions.confirmResignation("post_001");

    expect(result!.workDurationDays).toBeTypeOf("number");
    expect(result!.workDurationDays!).toBeGreaterThan(0);
    expect(result!.workDurationDisplay).toBeTruthy();
  });

  it("fires both notifications (confirmed + please rate)", () => {
    makeResigned();
    employmentActions.confirmResignation("post_001");

    expect(notifyEmployeeResignConfirmed).toHaveBeenCalledWith("Site Engineer", "TechCorp");
    expect(notifyBothPleaseRate).toHaveBeenCalledWith("Rahul", "TechCorp", "Site Engineer");
  });

  it("rejects confirm from selected status", () => {
    seedRecord();
    expect(employmentActions.confirmResignation("post_001")).toBeNull();
  });
});

/* ── Terminate ── */
describe("terminate", () => {
  function makeWorking(): void {
    seedRecord();
    employmentActions.markAsJoined("post_001", Date.now());
  }

  it("transitions working → completed with terminated exitType", () => {
    makeWorking();
    const result = employmentActions.terminate("post_001", "misconduct", "Repeated violations");

    expect(result).not.toBeNull();
    expect(result!.status).toBe("completed");
    expect(result!.exitType).toBe("terminated");
    expect(result!.exitReason).toBe("misconduct");
    expect(result!.exitNotes).toBe("Repeated violations");
  });

  it("fires terminated + please rate notifications", () => {
    makeWorking();
    employmentActions.terminate("post_001", "performance_issues", "");

    expect(notifyEmployeeTerminated).toHaveBeenCalledWith("Site Engineer", "TechCorp");
    expect(notifyBothPleaseRate).toHaveBeenCalled();
  });

  it("rejects terminate from selected status", () => {
    seedRecord();
    expect(employmentActions.terminate("post_001", "misconduct", "")).toBeNull();
  });

  it("rejects terminate from completed status", () => {
    makeWorking();
    employmentActions.terminate("post_001", "misconduct", "");
    const again = employmentActions.terminate("post_001", "misconduct", "");
    expect(again).toBeNull();
  });
});

/* ── Full Lifecycle: Selected → Working → Notice → Completed ── */
describe("full lifecycle", () => {
  it("completes resign flow with correct timeline", () => {
    seedRecord();
    employmentActions.markAsJoined("post_001", Date.now());
    employmentActions.resign("post_001", "relocation", "Moving");
    const result = employmentActions.confirmResignation("post_001");

    expect(result!.status).toBe("completed");
    expect(result!.timeline).toHaveLength(4); // selected, working, notice, completed
    expect(result!.timeline.map((t) => t.status)).toEqual([
      "selected", "working", "notice", "completed",
    ]);
  });

  it("completes withdraw + re-resign flow", () => {
    seedRecord();
    employmentActions.markAsJoined("post_001", Date.now());
    employmentActions.resign("post_001", "personal_reasons", "");
    employmentActions.withdrawResignation("post_001");
    employmentActions.resign("post_001", "better_opportunity", "New offer");
    const result = employmentActions.confirmResignation("post_001");

    expect(result!.status).toBe("completed");
    expect(result!.wasWithdrawn).toBe(true);
    expect(result!.timeline.length).toBeGreaterThanOrEqual(6);
  });
});