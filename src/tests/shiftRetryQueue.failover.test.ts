/**
 * Client failover audit — wm_retry_queue_v1 capture + drain (Wave-2 replayable / dead-letter).
 * Vitest (jsdom) — run: npm test -- src/tests/shiftRetryQueue.failover.test.ts
 */

import { describe, expect, it, beforeEach } from "vitest";
import {
  clearShiftRetryDeadLetter,
  clearShiftRetryQueue,
  drainShiftRetryQueue,
  enqueueShiftRetry,
  peekShiftRetryDeadLetter,
  peekShiftRetryQueue,
} from "../shared/shift/shiftRetryQueue";

describe("MNC failover — shiftRetryQueue", () => {
  beforeEach(() => {
    clearShiftRetryQueue();
    clearShiftRetryDeadLetter();
  });

  it("routes non-replayable ops to dead letter (not live queue)", () => {
    enqueueShiftRetry("availability_sync", { workerMlId: "WMID_1", dates: "2026-07-21" }, "503");
    enqueueShiftRetry("favorites_sync", { workerMlId: "WMID_2", action: "add" }, "network");
    enqueueShiftRetry("notify_cross_role", { postId: "p1", appId: "a1" }, "502");

    expect(peekShiftRetryQueue()).toHaveLength(0);
    const dead = peekShiftRetryDeadLetter();
    expect(dead).toHaveLength(3);
    expect(dead.map((q) => q.op).sort()).toEqual([
      "availability_sync",
      "favorites_sync",
      "notify_cross_role",
    ]);
  });

  it("keeps replayable ops on the live queue", () => {
    enqueueShiftRetry("rating_points", { workerMlId: "WM-1", jobId: "job_1" }, "storage");
    enqueueShiftRetry("site_membership_provision", { siteId: "s1", workerMlId: "ML-1" }, "rpc");
    expect(peekShiftRetryQueue()).toHaveLength(2);
    expect(peekShiftRetryDeadLetter()).toHaveLength(0);
  });

  it("auto-drains with zero data loss when connectivity heals", async () => {
    for (let i = 0; i < 25; i += 1) {
      enqueueShiftRetry(
        "rating_points",
        { i: String(i), workerMlId: "W", jobId: "J" },
        "injected_chaos",
      );
    }
    expect(peekShiftRetryQueue()).toHaveLength(25);

    const seen = new Set<string>();
    const result = await drainShiftRetryQueue(async (item) => {
      seen.add(item.id);
      return { ok: true };
    });

    expect(result.drained).toBe(25);
    expect(result.remaining).toBe(0);
    expect(result.lost).toBe(0);
    expect(seen.size).toBe(25);
    expect(peekShiftRetryQueue()).toHaveLength(0);
  });

  it("requeues transient failures until heal (no silent drop before max attempts)", async () => {
    enqueueShiftRetry("rating_points", { workerMlId: "WMID_X", jobId: "job_x" }, "502");

    const first = await drainShiftRetryQueue(async () => ({ ok: false, error: "still_down" }));
    expect(first.drained).toBe(0);
    expect(first.remaining).toBe(1);
    expect(peekShiftRetryQueue()[0]?.attempts).toBe(1);

    const healed = await drainShiftRetryQueue(async () => ({ ok: true }));
    expect(healed.drained).toBe(1);
    expect(healed.remaining).toBe(0);
    expect(healed.lost).toBe(0);
  });

  it("moves exhausted failures to dead letter", async () => {
    enqueueShiftRetry("plan_enroll", { postId: "p1", appId: "a1" }, "fail");

    for (let i = 0; i < 8; i += 1) {
      await drainShiftRetryQueue(async () => ({ ok: false, error: "still_down" }));
    }

    expect(peekShiftRetryQueue()).toHaveLength(0);
    expect(peekShiftRetryDeadLetter().length).toBeGreaterThanOrEqual(1);
    expect(peekShiftRetryDeadLetter()[0]?.abandonReason).toBe("max_attempts");
  });
});
