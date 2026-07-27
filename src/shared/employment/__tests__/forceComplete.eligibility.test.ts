import { describe, it, expect, vi } from "vitest";
import { employmentActions } from "../employmentActions";
import { employmentStorage } from "../employmentStorage";
import { canForceComplete, getDaysUntilForceComplete } from "../employmentDisplayHelpers";
import { GRACE_MS, getRecord, seedWorking } from "./forceComplete.test.helpers";

describe("canForceComplete", () => {
  it("returns false for working status", async () => {
    await seedWorking();
    expect(canForceComplete(getRecord())).toBe(false);
  });

  it("returns false immediately after resign (within grace period)", async () => {
    await seedWorking();
    await employmentActions.resign("post_fc", "personal_reasons", "");
    expect(canForceComplete(getRecord())).toBe(false);
  });

  it("returns false at exactly 6 days after notice expires", async () => {
    vi.useFakeTimers();
    const baseTime = new Date("2026-04-01T00:00:00Z").getTime();
    vi.setSystemTime(baseTime);

    await seedWorking();
    await employmentActions.resign("post_fc", "other", "");

    const rec = getRecord();
    const lwdPlus6 = rec.lastWorkingDay! + 6 * 86_400_000;
    vi.setSystemTime(lwdPlus6);

    expect(canForceComplete(getRecord())).toBe(false);
  });

  it("returns true after notice expires + 7 days", async () => {
    vi.useFakeTimers();
    const baseTime = new Date("2026-04-01T00:00:00Z").getTime();
    vi.setSystemTime(baseTime);

    await seedWorking();
    await employmentActions.resign("post_fc", "other", "");

    const rec = getRecord();
    vi.setSystemTime(rec.lastWorkingDay! + GRACE_MS + 1000);

    expect(canForceComplete(getRecord())).toBe(true);
  });

  it("returns true for resigned status (no notice) after 7 days", async () => {
    vi.useFakeTimers();
    const baseTime = new Date("2026-04-01T00:00:00Z").getTime();
    vi.setSystemTime(baseTime);

    await seedWorking("post_no_notice", 0);
    await employmentActions.resign("post_no_notice", "other", "");

    const rec = employmentStorage.getByPostId("post_no_notice")!;
    vi.setSystemTime(rec.resignedAt! + GRACE_MS + 1000);

    expect(canForceComplete(employmentStorage.getByPostId("post_no_notice")!)).toBe(true);
  });

  it("returns false for selected status", async () => {
    employmentStorage.create({
      careerPostId: "post_sel",
      employeeId: "ee",
      employeeName: "X",
      employeeMlId: "WM-X",
      employerId: "er",
      companyName: "C",
      employerMlId: "WM-C",
      jobTitle: "J",
      department: "D",
      salaryMin: 0,
      salaryMax: 0,
      salaryPeriod: "monthly",
      noticePeriodDays: 0,
    });
    expect(canForceComplete(employmentStorage.getByPostId("post_sel")!)).toBe(false);
  });

  it("returns false for completed status", async () => {
    await seedWorking("post_done", 0);
    await employmentActions.resign("post_done", "other", "");
    await employmentActions.confirmResignation("post_done");
    expect(canForceComplete(employmentStorage.getByPostId("post_done")!)).toBe(false);
  });
});

describe("getDaysUntilForceComplete", () => {
  it("returns -1 for working status", async () => {
    await seedWorking();
    expect(getDaysUntilForceComplete(getRecord())).toBe(-1);
  });

  it("returns correct countdown after resign", async () => {
    vi.useFakeTimers();
    const baseTime = new Date("2026-04-01T00:00:00Z").getTime();
    vi.setSystemTime(baseTime);

    await seedWorking();
    await employmentActions.resign("post_fc", "other", "");

    const rec = getRecord();
    vi.setSystemTime(rec.lastWorkingDay! + 2 * 86_400_000);
    expect(getDaysUntilForceComplete(getRecord())).toBe(5);
  });

  it("returns 0 when eligible", async () => {
    vi.useFakeTimers();
    const baseTime = new Date("2026-04-01T00:00:00Z").getTime();
    vi.setSystemTime(baseTime);

    await seedWorking();
    await employmentActions.resign("post_fc", "other", "");

    const rec = getRecord();
    vi.setSystemTime(rec.lastWorkingDay! + GRACE_MS + 86_400_000);
    expect(getDaysUntilForceComplete(getRecord())).toBe(0);
  });
});
