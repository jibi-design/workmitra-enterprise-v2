import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { buildShiftConfirmIdempotencyKey } from "../../features/employer/shiftJobs/services/shiftConfirmApi.service";

describe("shift network + confirm idempotency", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.doUnmock("../native/networkStatus");
  });

  it("uses the same confirm idempotency key on retry", () => {
    const first = buildShiftConfirmIdempotencyKey("post-a", "app-b");
    const retry = buildShiftConfirmIdempotencyKey("post-a", "app-b");
    expect(first).toBe("shift-confirm:post-a:app-b");
    expect(retry).toBe(first);
  });

  it("returns network retry copy when offline", async () => {
    vi.doMock("../native/networkStatus", () => ({
      getNetworkOnline: () => false,
    }));
    const { applyPersistFailureCopy, confirmSyncFailureCopy, SHIFT_NETWORK_APPLY_RETRY } =
      await import("./shiftNetworkUi");
    expect(applyPersistFailureCopy("storage_error")).toBe(SHIFT_NETWORK_APPLY_RETRY);
    expect(confirmSyncFailureCopy()).toContain("Network error");
  });
});
