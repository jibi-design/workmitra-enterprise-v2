import { describe, it, expect, vi } from "vitest";
import { employmentActions } from "../employmentActions";
import { employmentStorage } from "../employmentStorage";
import { getEmployeeActions, getStatusBadge, getStatusLabel } from "../employmentDisplayHelpers";
import {
  GRACE_MS,
  getRecord,
  notifyBothPleaseRate,
  notifyEmployerForceCompleted,
  seedWorking,
} from "./forceComplete.test.helpers";

describe("forceComplete action", () => {
  it("completes employment with forceCompleted flag", async () => {
    vi.useFakeTimers();
    const baseTime = new Date("2026-04-01T00:00:00Z").getTime();
    vi.setSystemTime(baseTime);

    await seedWorking();
    await employmentActions.resign("post_fc", "other", "");

    const rec = getRecord();
    vi.setSystemTime(rec.lastWorkingDay! + GRACE_MS + 1000);

    const result = await employmentActions.forceComplete("post_fc");

    expect(result).not.toBeNull();
    expect(result!.status).toBe("completed");
    expect(result!.forceCompleted).toBe(true);
    expect(result!.completedAt).toBeTypeOf("number");
  });

  it("calculates work duration", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));

    await seedWorking();
    await employmentActions.resign("post_fc", "other", "");

    const rec = getRecord();
    vi.setSystemTime(rec.lastWorkingDay! + GRACE_MS + 1000);

    const result = await employmentActions.forceComplete("post_fc");
    expect(result!.workDurationDays).toBeTypeOf("number");
    expect(result!.workDurationDays!).toBeGreaterThan(0);
    expect(result!.workDurationDisplay).toBeTruthy();
  });

  it("adds timeline entry", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));

    await seedWorking();
    await employmentActions.resign("post_fc", "other", "");

    const rec = getRecord();
    vi.setSystemTime(rec.lastWorkingDay! + GRACE_MS + 1000);

    const result = await employmentActions.forceComplete("post_fc");
    const fcEntry = result!.timeline.find((t) => t.note.includes("Force completed"));

    expect(fcEntry).toBeDefined();
    expect(fcEntry!.actor).toBe("employee");
    expect(fcEntry!.status).toBe("completed");
  });

  it("fires employer + rate notifications", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));

    await seedWorking();
    await employmentActions.resign("post_fc", "other", "");

    const rec = getRecord();
    vi.setSystemTime(rec.lastWorkingDay! + GRACE_MS + 1000);

    await employmentActions.forceComplete("post_fc");

    expect(notifyEmployerForceCompleted).toHaveBeenCalledWith("Rahul", "Engineer");
    expect(notifyBothPleaseRate).toHaveBeenCalled();
  });

  it("rejects before grace period", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));

    await seedWorking();
    await employmentActions.resign("post_fc", "other", "");

    const rec = getRecord();
    vi.setSystemTime(rec.lastWorkingDay! + 3 * 86_400_000);

    expect(await employmentActions.forceComplete("post_fc")).toBeNull();
  });

  it("rejects from working status", async () => {
    await seedWorking();
    expect(await employmentActions.forceComplete("post_fc")).toBeNull();
  });

  it("rejects unknown post", async () => {
    expect(await employmentActions.forceComplete("unknown")).toBeNull();
  });
});

describe("force complete badge", () => {
  it("shows 'Completed (unconfirmed)' badge", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));

    await seedWorking();
    await employmentActions.resign("post_fc", "other", "");

    const rec = getRecord();
    vi.setSystemTime(rec.lastWorkingDay! + GRACE_MS + 1000);
    await employmentActions.forceComplete("post_fc");

    const updated = getRecord();
    expect(getStatusBadge(updated).label).toBe("Completed (unconfirmed)");
    expect(getStatusBadge(updated).color).toBe("#b45309");
    expect(getStatusLabel(updated)).toBe("Completed (unconfirmed)");
  });

  it("terminated badge takes priority over force complete", async () => {
    await seedWorking("post_term");
    await employmentActions.terminate("post_term", "misconduct", "");
    const terminated = employmentStorage.getByPostId("post_term")!;

    expect(getStatusBadge(terminated).label).toBe("Terminated");
  });
});

describe("getEmployeeActions with forceComplete", () => {
  it("includes canForceComplete = false for working", async () => {
    await seedWorking();
    expect(getEmployeeActions(getRecord()).canForceComplete).toBe(false);
  });

  it("includes canForceComplete = true when eligible", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));

    await seedWorking();
    await employmentActions.resign("post_fc", "other", "");

    const rec = getRecord();
    vi.setSystemTime(rec.lastWorkingDay! + GRACE_MS + 1000);

    expect(getEmployeeActions(getRecord()).canForceComplete).toBe(true);
  });
});
