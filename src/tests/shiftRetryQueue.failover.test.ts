/**
 * Client failover audit — wm_retry_queue_v1 capture + auto-drain (zero loss).
 * Vitest (jsdom) — run: npm test -- src/tests/shiftRetryQueue.failover.test.ts
 */

import { describe, expect, it, beforeEach } from "vitest";
import {
  clearShiftRetryQueue,
  drainShiftRetryQueue,
  enqueueShiftRetry,
  peekShiftRetryQueue,
} from "../shared/shift/shiftRetryQueue";

describe("MNC failover — shiftRetryQueue", () => {
  beforeEach(() => {
    clearShiftRetryQueue();
  });

  it("captures failed availability/favorites payloads client-side", () => {
    enqueueShiftRetry("availability_sync", { workerMlId: "WMID_1", dates: "2026-07-21" }, "503");
    enqueueShiftRetry("favorites_sync", { workerMlId: "WMID_2", action: "add" }, "network");
    enqueueShiftRetry("notify_cross_role", { postId: "p1", appId: "a1" }, "502");

    const queued = peekShiftRetryQueue();
    expect(queued).toHaveLength(3);
    expect(queued.map((q) => q.op)).toEqual([
      "notify_cross_role",
      "favorites_sync",
      "availability_sync",
    ]);
  });

  it("auto-drains with zero data loss when connectivity heals", async () => {
    for (let i = 0; i < 25; i += 1) {
      enqueueShiftRetry("availability_sync", { i: String(i) }, "injected_chaos");
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
    enqueueShiftRetry("favorites_sync", { workerMlId: "WMID_X" }, "502");

    const first = await drainShiftRetryQueue(async () => ({ ok: false, error: "still_down" }));
    expect(first.drained).toBe(0);
    expect(first.remaining).toBe(1);
    expect(peekShiftRetryQueue()[0]?.attempts).toBe(1);

    const healed = await drainShiftRetryQueue(async () => ({ ok: true }));
    expect(healed.drained).toBe(1);
    expect(healed.remaining).toBe(0);
    expect(healed.lost).toBe(0);
  });
});
