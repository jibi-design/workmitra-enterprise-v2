import "./employmentActions.test.helpers";
import { describe, it, expect } from "vitest";
import { employmentActions } from "../employmentActions";
import {
  notifyBothPleaseRate,
  notifyEmployeeResignConfirmed,
  notifyEmployerResignation,
  notifyEmployerWithdrawal,
  registerEmploymentActionsTestSetup,
  seedRecord,
  type EmploymentRecord,
  type NoticePeriodDays,
} from "./employmentActions.test.helpers";

registerEmploymentActionsTestSetup();

describe("resign", () => {
  async function makeWorking(postId = "post_001"): Promise<EmploymentRecord> {
    seedRecord({ careerPostId: postId });
    return (await employmentActions.markAsJoined(postId, Date.now()))!;
  }

  it("transitions working → notice (with notice period)", async () => {
    await makeWorking();
    const result = await employmentActions.resign(
      "post_001",
      "better_opportunity",
      "Found better job",
    );

    expect(result).not.toBeNull();
    expect(result!.status).toBe("notice");
    expect(result!.exitType).toBe("resigned");
    expect(result!.exitReason).toBe("better_opportunity");
    expect(result!.resignedAt).toBeTypeOf("number");
    expect(result!.lastWorkingDay).toBeTypeOf("number");
  });

  it("transitions working → resigned (no notice period)", async () => {
    seedRecord({ careerPostId: "p_no_notice", noticePeriodDays: 0 as NoticePeriodDays });
    await employmentActions.markAsJoined("p_no_notice", Date.now());
    const result = await employmentActions.resign("p_no_notice", "personal_reasons", "");

    expect(result!.status).toBe("resigned");
    expect(result!.lastWorkingDay).toBeNull();
  });

  it("calculates lastWorkingDay correctly (7 days)", async () => {
    await makeWorking();
    const result = await employmentActions.resign("post_001", "relocation", "Moving");
    const expectedLwd = result!.resignedAt! + 7 * 86_400_000;

    expect(result!.lastWorkingDay).toBe(expectedLwd);
  });

  it("fires employer notification", async () => {
    await makeWorking();
    await employmentActions.resign("post_001", "health_issues", "");
    expect(notifyEmployerResignation).toHaveBeenCalledWith("Rahul", "Site Engineer");
  });

  it("rejects resign from selected status", async () => {
    seedRecord();
    const result = await employmentActions.resign("post_001", "other", "");
    expect(result).toBeNull();
  });

  it("rejects resign from completed status", async () => {
    await makeWorking();
    await employmentActions.resign("post_001", "other", "");
    await employmentActions.confirmResignation("post_001");
    const result = await employmentActions.resign("post_001", "other", "Again");
    expect(result).toBeNull();
  });
});

describe("withdrawResignation", () => {
  async function makeNotice(): Promise<void> {
    seedRecord();
    await employmentActions.markAsJoined("post_001", Date.now());
    await employmentActions.resign("post_001", "personal_reasons", "Changed mind");
  }

  it("transitions notice → working", async () => {
    await makeNotice();
    const result = await employmentActions.withdrawResignation("post_001");

    expect(result).not.toBeNull();
    expect(result!.status).toBe("working");
    expect(result!.wasWithdrawn).toBe(true);
    expect(result!.withdrawnAt).toBeTypeOf("number");
  });

  it("clears exit fields on withdrawal", async () => {
    await makeNotice();
    const result = await employmentActions.withdrawResignation("post_001");

    expect(result!.resignedAt).toBeNull();
    expect(result!.exitType).toBeNull();
    expect(result!.exitReason).toBeNull();
    expect(result!.exitNotes).toBe("");
    expect(result!.lastWorkingDay).toBeNull();
  });

  it("adds withdrawn timeline entry", async () => {
    await makeNotice();
    const result = await employmentActions.withdrawResignation("post_001");
    const entry = result!.timeline.find((t) => t.status === "withdrawn");

    expect(entry).toBeDefined();
    expect(entry!.actor).toBe("employee");
  });

  it("fires employer notification", async () => {
    await makeNotice();
    await employmentActions.withdrawResignation("post_001");
    expect(notifyEmployerWithdrawal).toHaveBeenCalledWith("Rahul", "Site Engineer");
  });

  it("rejects withdrawal from working status", async () => {
    seedRecord();
    await employmentActions.markAsJoined("post_001", Date.now());
    expect(await employmentActions.withdrawResignation("post_001")).toBeNull();
  });

  it("rejects withdrawal from completed status", async () => {
    await makeNotice();
    await employmentActions.confirmResignation("post_001");
    expect(await employmentActions.withdrawResignation("post_001")).toBeNull();
  });
});

describe("confirmResignation", () => {
  async function makeResigned(): Promise<void> {
    seedRecord({ noticePeriodDays: 0 as NoticePeriodDays });
    await employmentActions.markAsJoined("post_001", Date.now());
    await employmentActions.resign("post_001", "other", "");
  }

  it("transitions resigned → completed", async () => {
    await makeResigned();
    const result = await employmentActions.confirmResignation("post_001");

    expect(result).not.toBeNull();
    expect(result!.status).toBe("completed");
    expect(result!.completedAt).toBeTypeOf("number");
  });

  it("calculates work duration", async () => {
    seedRecord({ noticePeriodDays: 0 as NoticePeriodDays });
    const joinDate = Date.now() - 45 * 86_400_000;
    await employmentActions.markAsJoined("post_001", joinDate);
    await employmentActions.resign("post_001", "other", "");
    const result = await employmentActions.confirmResignation("post_001");

    expect(result!.workDurationDays).toBeTypeOf("number");
    expect(result!.workDurationDays!).toBeGreaterThan(0);
    expect(result!.workDurationDisplay).toBeTruthy();
  });

  it("fires both notifications (confirmed + please rate)", async () => {
    await makeResigned();
    await employmentActions.confirmResignation("post_001");

    expect(notifyEmployeeResignConfirmed).toHaveBeenCalledWith("Site Engineer", "TechCorp");
    expect(notifyBothPleaseRate).toHaveBeenCalledWith(
      "Rahul",
      "TechCorp",
      "Site Engineer",
      "post_001",
    );
  });

  it("rejects confirm from selected status", async () => {
    seedRecord();
    expect(await employmentActions.confirmResignation("post_001")).toBeNull();
  });
});
