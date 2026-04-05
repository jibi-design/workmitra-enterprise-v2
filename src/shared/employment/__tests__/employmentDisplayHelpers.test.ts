// src/shared/employment/__tests__/employmentDisplayHelpers.test.ts
// Phase B — Display Helpers: date formatting, badges, actions, notice countdown.

import { describe, it, expect, vi, afterEach } from "vitest";
import {
  formatDate,
  formatDateTime,
  toInputDate,
  fromInputDate,
  getStatusBadge,
  getStatusLabel,
  getNoticeDaysRemaining,
  getNoticeCountdownText,
  isNoticeExpired,
  getExitReasonLabel,
  formatTimelineEntry,
  getDuplicateWarning,
  getEmployerActions,
  getEmployeeActions,
} from "../employmentDisplayHelpers";
import type { EmploymentRecord, TimelineEntry } from "../employmentTypes";

/* ── Record Factory ── */
function makeRecord(overrides?: Partial<EmploymentRecord>): EmploymentRecord {
  return {
    id: "emp_001", careerPostId: "post_001",
    employeeId: "ee_001", employeeName: "Rahul",
    employeeWmId: "WM-AB12-RAH-CD34",
    employerId: "er_001", companyName: "TechCorp",
    employerWmId: "WM-XY56-TEC-ZW78",
    jobTitle: "Engineer", department: "IT",
    salaryMin: 25000, salaryMax: 35000, salaryPeriod: "monthly",
    status: "working", offeredAt: 1000, acceptedAt: 2000,
    joinedAt: 3000, resignedAt: null, completedAt: null,
    noticePeriodDays: 7, lastWorkingDay: null,
    exitType: null, exitReason: null, exitNotes: "",
    wasWithdrawn: false, withdrawnAt: null,
    forceCompleted: false,
    workDurationDays: null, workDurationDisplay: "",
    timeline: [], employeeRated: false, employerRated: false,
    ...overrides,
  };
}

afterEach(() => { vi.useRealTimers(); });

/* ── Date Formatters ── */
describe("formatDate", () => {
  it("formats epoch to readable date", () => {
    const epoch = new Date("2026-03-15T10:00:00Z").getTime();
    expect(formatDate(epoch)).toMatch(/Mar/);
    expect(formatDate(epoch)).toMatch(/15/);
    expect(formatDate(epoch)).toMatch(/2026/);
  });

  it("returns dash for null", () => { expect(formatDate(null)).toBe("—"); });
  it("returns dash for 0", () => { expect(formatDate(0)).toBe("—"); });
});

describe("formatDateTime", () => {
  it("includes time component", () => {
    const epoch = new Date("2026-03-15T14:30:00Z").getTime();
    const result = formatDateTime(epoch);
    expect(result).toMatch(/Mar/);
    expect(result).toContain("at");
  });

  it("returns dash for null", () => { expect(formatDateTime(null)).toBe("—"); });
});

describe("toInputDate / fromInputDate", () => {
  it("round-trips correctly", () => {
    const original = new Date(2026, 3, 15).getTime(); // Apr 15, 2026
    const str = toInputDate(original);
    expect(str).toBe("2026-04-15");
    expect(fromInputDate(str)).toBe(original);
  });

  it("pads single digit month and day", () => {
    const epoch = new Date(2026, 0, 5).getTime(); // Jan 5
    expect(toInputDate(epoch)).toBe("2026-01-05");
  });
});

/* ── Status Badge ── */
describe("getStatusBadge", () => {
  it("returns working badge for working status", () => {
    const badge = getStatusBadge(makeRecord({ status: "working" }));
    expect(badge.label).toBe("Currently Working");
    expect(badge.color).toBe("#16a34a");
  });

  it("returns terminated badge for completed + terminated", () => {
    const badge = getStatusBadge(makeRecord({ status: "completed", exitType: "terminated" }));
    expect(badge.label).toBe("Terminated");
    expect(badge.color).toBe("#dc2626");
  });

  it("returns completed badge for completed + resigned", () => {
    const badge = getStatusBadge(makeRecord({ status: "completed", exitType: "resigned" }));
    expect(badge.label).toBe("Completed");
  });
});

describe("getStatusLabel", () => {
  it("returns Terminated for terminated exit", () => {
    expect(getStatusLabel(makeRecord({ status: "completed", exitType: "terminated" }))).toBe("Terminated");
  });

  it("returns normal label for non-terminated", () => {
    expect(getStatusLabel(makeRecord({ status: "notice" }))).toBe("Notice Period");
  });
});

/* ── Notice Period ── */
describe("getNoticeDaysRemaining", () => {
  it("returns correct days for active notice", () => {
    vi.useFakeTimers();
    const now = new Date("2026-04-01T00:00:00Z").getTime();
    vi.setSystemTime(now);
    const lwd = now + 10 * 86_400_000;
    const result = getNoticeDaysRemaining(makeRecord({ status: "notice", lastWorkingDay: lwd }));
    expect(result).toBe(10);
  });

  it("returns 0 when notice expired", () => {
    vi.useFakeTimers();
    const now = new Date("2026-04-10T00:00:00Z").getTime();
    vi.setSystemTime(now);
    const lwd = now - 86_400_000;
    expect(getNoticeDaysRemaining(makeRecord({ status: "notice", lastWorkingDay: lwd }))).toBe(0);
  });

  it("returns 0 for non-notice status", () => {
    expect(getNoticeDaysRemaining(makeRecord({ status: "working" }))).toBe(0);
  });
});

describe("getNoticeCountdownText", () => {
  it("shows days remaining", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));
    const lwd = Date.now() + 14 * 86_400_000;
    expect(getNoticeCountdownText(makeRecord({ status: "notice", lastWorkingDay: lwd }))).toBe("14 days remaining");
  });

  it("singular day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));
    const lwd = Date.now() + 1 * 86_400_000;
    expect(getNoticeCountdownText(makeRecord({ status: "notice", lastWorkingDay: lwd }))).toBe("1 day remaining");
  });

  it("shows ended when expired", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-10T00:00:00Z"));
    const lwd = Date.now() - 86_400_000;
    expect(getNoticeCountdownText(makeRecord({ status: "notice", lastWorkingDay: lwd }))).toBe("Notice period ended");
  });

  it("returns empty for non-notice", () => {
    expect(getNoticeCountdownText(makeRecord({ status: "working" }))).toBe("");
  });
});

describe("isNoticeExpired", () => {
  it("true when past lastWorkingDay", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-10T00:00:00Z"));
    expect(isNoticeExpired(makeRecord({ status: "notice", lastWorkingDay: Date.now() - 1000 }))).toBe(true);
  });

  it("false when before lastWorkingDay", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));
    expect(isNoticeExpired(makeRecord({ status: "notice", lastWorkingDay: Date.now() + 86_400_000 }))).toBe(false);
  });
});

/* ── Exit Reason Label ── */
describe("getExitReasonLabel", () => {
  it("maps employee resign reason", () => {
    expect(getExitReasonLabel(makeRecord({
      exitType: "resigned", exitReason: "better_opportunity",
    }))).toBe("Found better opportunity");
  });

  it("maps employer terminate reason", () => {
    expect(getExitReasonLabel(makeRecord({
      exitType: "terminated", exitReason: "misconduct",
    }))).toBe("Misconduct");
  });

  it("returns empty when no exit reason", () => {
    expect(getExitReasonLabel(makeRecord())).toBe("");
  });

  it("falls back to raw value for unknown code", () => {
    expect(getExitReasonLabel(makeRecord({
      exitType: "resigned", exitReason: "unknown_code" as never,
    }))).toBe("unknown_code");
  });
});

/* ── Timeline Display ── */
describe("formatTimelineEntry", () => {
  it("formats working entry", () => {
    const entry: TimelineEntry = { status: "working", timestamp: Date.now(), actor: "employer", note: "Joined" };
    const result = formatTimelineEntry(entry);
    expect(result.label).toBe("Currently Working");
    expect(result.actor).toBe("Employer");
  });

  it("formats withdrawn entry", () => {
    const entry: TimelineEntry = { status: "withdrawn", timestamp: Date.now(), actor: "employee", note: "Changed mind" };
    expect(formatTimelineEntry(entry).label).toBe("Withdrawal");
  });
});

/* ── Action Availability ── */
describe("getEmployerActions", () => {
  it("selected → canMarkJoined only", () => {
    const a = getEmployerActions(makeRecord({ status: "selected" }));
    expect(a.canMarkJoined).toBe(true);
    expect(a.canConfirmResign).toBe(false);
    expect(a.canTerminate).toBe(false);
  });

  it("working → canTerminate only", () => {
    const a = getEmployerActions(makeRecord({ status: "working" }));
    expect(a.canTerminate).toBe(true);
    expect(a.canMarkJoined).toBe(false);
  });

  it("notice → canConfirmResign", () => {
    const a = getEmployerActions(makeRecord({ status: "notice" }));
    expect(a.canConfirmResign).toBe(true);
  });
});

describe("getEmployeeActions", () => {
  it("working → canResign", () => {
    const a = getEmployeeActions(makeRecord({ status: "working" }));
    expect(a.canResign).toBe(true);
    expect(a.canWithdraw).toBe(false);
  });

  it("notice → canWithdraw", () => {
    const a = getEmployeeActions(makeRecord({ status: "notice" }));
    expect(a.canWithdraw).toBe(true);
    expect(a.canResign).toBe(false);
  });

  it("completed → no actions", () => {
    const a = getEmployeeActions(makeRecord({ status: "completed" }));
    expect(a.canResign).toBe(false);
    expect(a.canWithdraw).toBe(false);
  });
});

/* ── Duplicate Warning ── */
describe("getDuplicateWarning", () => {
  it("includes company name", () => {
    expect(getDuplicateWarning("TechCorp")).toContain("TechCorp");
  });
});