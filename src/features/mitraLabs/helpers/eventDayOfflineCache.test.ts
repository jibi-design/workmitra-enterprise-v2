import { describe, expect, it, beforeEach } from "vitest";
import { ApiRequestError } from "../../../shared/services/apiService";
import {
  EVENT_DAY_CHECKIN_QUEUE_KEY,
  dequeueOfflineCheckIn,
  enqueueOfflineCheckIn,
  hasOfflineCheckInQueued,
  isEventDayCloudUnavailable,
} from "./eventDayOfflineCache";

describe("eventDayOfflineCache", () => {
  beforeEach(() => {
    localStorage.removeItem(EVENT_DAY_CHECKIN_QUEUE_KEY);
  });

  it("treats network and 503 as cloud-unavailable, not denied PIN", () => {
    expect(isEventDayCloudUnavailable(new TypeError("Failed to fetch"))).toBe(true);
    expect(isEventDayCloudUnavailable(new ApiRequestError("down", 503, "EVENT_DAY_STORE_NOT_READY"))).toBe(
      true,
    );
    expect(isEventDayCloudUnavailable(new ApiRequestError("no", 401, "CHECK_IN_DENIED"))).toBe(false);
  });

  it("queues check-in tokens without storing a PIN", () => {
    enqueueOfflineCheckIn("tok_offline_cache_01");
    expect(hasOfflineCheckInQueued("tok_offline_cache_01")).toBe(true);
    const raw = localStorage.getItem(EVENT_DAY_CHECKIN_QUEUE_KEY) ?? "";
    expect(raw).toContain("tok_offline_cache_01");
    expect(raw.toLowerCase()).not.toContain("pin");
    dequeueOfflineCheckIn("tok_offline_cache_01");
    expect(hasOfflineCheckInQueued("tok_offline_cache_01")).toBe(false);
  });
});
