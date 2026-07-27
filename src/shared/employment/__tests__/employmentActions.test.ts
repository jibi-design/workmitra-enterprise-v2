import "./employmentActions.resign.test";
import { describe, it, expect } from "vitest";
import { employmentActions } from "../employmentActions";
import { employmentStorage } from "../employmentStorage";
import {
  notifyBothPleaseRate,
  notifyEmployeeJoined,
  notifyEmployeeTerminated,
  registerEmploymentActionsTestSetup,
  seedRecord,
} from "./employmentActions.test.helpers";

registerEmploymentActionsTestSetup();

describe("markAsJoined", () => {
  it("transitions selected → working", async () => {
    seedRecord();
    const joinDate = Date.now();
    const result = await employmentActions.markAsJoined("post_001", joinDate);

    expect(result).not.toBeNull();
    expect(result!.status).toBe("working");
    expect(result!.joinedAt).toBe(joinDate);
  });

  it("adds timeline entry", async () => {
    seedRecord();
    const result = await employmentActions.markAsJoined("post_001", Date.now());
    const entry = result!.timeline.find((t) => t.status === "working");

    expect(entry).toBeDefined();
    expect(entry!.actor).toBe("employer");
  });

  it("fires employee notification", async () => {
    seedRecord();
    await employmentActions.markAsJoined("post_001", Date.now());
    expect(notifyEmployeeJoined).toHaveBeenCalledWith("Site Engineer", "TechCorp");
  });

  it("returns null for unknown post", async () => {
    expect(await employmentActions.markAsJoined("unknown", Date.now())).toBeNull();
  });

  it("rejects invalid transition (working → working)", async () => {
    seedRecord();
    await employmentActions.markAsJoined("post_001", Date.now());
    const again = await employmentActions.markAsJoined("post_001", Date.now());
    expect(again).toBeNull();
  });

  it("persists to storage", async () => {
    seedRecord();
    await employmentActions.markAsJoined("post_001", Date.now());
    const stored = employmentStorage.getByPostId("post_001");
    expect(stored!.status).toBe("working");
  });
});

describe("terminate", () => {
  async function makeWorking(): Promise<void> {
    seedRecord();
    await employmentActions.markAsJoined("post_001", Date.now());
  }

  it("transitions working → completed with terminated exitType", async () => {
    await makeWorking();
    const result = await employmentActions.terminate(
      "post_001",
      "misconduct",
      "Repeated violations",
    );

    expect(result).not.toBeNull();
    expect(result!.status).toBe("completed");
    expect(result!.exitType).toBe("terminated");
    expect(result!.exitReason).toBe("misconduct");
    expect(result!.exitNotes).toBe("Repeated violations");
  });

  it("fires terminated + please rate notifications", async () => {
    await makeWorking();
    await employmentActions.terminate("post_001", "performance_issues", "");

    expect(notifyEmployeeTerminated).toHaveBeenCalledWith("Site Engineer", "TechCorp");
    expect(notifyBothPleaseRate).toHaveBeenCalled();
  });

  it("rejects terminate from selected status", async () => {
    seedRecord();
    expect(await employmentActions.terminate("post_001", "misconduct", "")).toBeNull();
  });

  it("rejects terminate from completed status", async () => {
    await makeWorking();
    await employmentActions.terminate("post_001", "misconduct", "");
    const again = await employmentActions.terminate("post_001", "misconduct", "");
    expect(again).toBeNull();
  });
});

describe("full lifecycle", () => {
  it("completes resign flow with correct timeline", async () => {
    seedRecord();
    await employmentActions.markAsJoined("post_001", Date.now());
    await employmentActions.resign("post_001", "relocation", "Moving");
    const result = await employmentActions.confirmResignation("post_001");

    expect(result!.status).toBe("completed");
    expect(result!.timeline).toHaveLength(4);
    expect(result!.timeline.map((t) => t.status)).toEqual([
      "selected",
      "working",
      "notice",
      "completed",
    ]);
  });

  it("completes withdraw + re-resign flow", async () => {
    seedRecord();
    await employmentActions.markAsJoined("post_001", Date.now());
    await employmentActions.resign("post_001", "personal_reasons", "");
    await employmentActions.withdrawResignation("post_001");
    await employmentActions.resign("post_001", "better_opportunity", "New offer");
    const result = await employmentActions.confirmResignation("post_001");

    expect(result!.status).toBe("completed");
    expect(result!.wasWithdrawn).toBe(true);
    expect(result!.timeline.length).toBeGreaterThanOrEqual(6);
  });
});
