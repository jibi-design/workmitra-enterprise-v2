import { beforeEach, describe, expect, it } from "vitest";
import {
  buildPendingGroupJoinPath,
  clearPendingGroupJoin,
  parseGroupJoinFromPath,
  peekPendingGroupJoin,
  stashPendingGroupJoin,
  stashPendingGroupJoinFromPath,
} from "../features/shiftOps/storage/pendingGroupJoin.storage";

describe("pendingGroupJoin.storage", () => {
  beforeEach(() => {
    clearPendingGroupJoin();
  });

  it("parses invite path and round-trips stash", () => {
    const path = "/employee/shift-ops/invite?token=abc123&group=site-1";
    expect(parseGroupJoinFromPath(path)?.token).toBe("abc123");
    expect(stashPendingGroupJoinFromPath(path)).toBe(true);
    const pending = peekPendingGroupJoin();
    expect(pending?.token).toBe("abc123");
    expect(pending?.groupId).toBe("site-1");
    expect(buildPendingGroupJoinPath(pending!)).toContain("token=abc123");
  });

  it("stores legacy flag when requested", () => {
    stashPendingGroupJoin({
      token: "tok",
      useDailyOtpGate: false,
      savedAt: Date.now(),
    });
    expect(peekPendingGroupJoin()?.useDailyOtpGate).toBe(false);
    expect(buildPendingGroupJoinPath(peekPendingGroupJoin()!)).toContain("legacy=1");
  });

  it("clears pending join when savedAt is older than 7 days", () => {
    stashPendingGroupJoin({
      token: "stale-tok",
      useDailyOtpGate: true,
      savedAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
    });
    // peek overwrites savedAt on stash — write raw stale payload
    localStorage.setItem(
      "wm_pending_group_join_v1",
      JSON.stringify({
        token: "stale-tok",
        useDailyOtpGate: true,
        savedAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
      }),
    );
    expect(peekPendingGroupJoin()).toBeNull();
  });
});
