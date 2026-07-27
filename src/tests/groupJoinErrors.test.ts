import { describe, expect, it } from "vitest";
import {
  classifyGroupJoinError,
  mapGroupJoinError,
} from "../features/shiftOps/helpers/groupJoinErrors";

describe("mapGroupJoinError", () => {
  it("maps daily otp and deleted group codes", () => {
    expect(mapGroupJoinError("daily_otp_invalid")).toMatch(/daily code/i);
    expect(mapGroupJoinError("group_deleted")).toMatch(/no longer exists/i);
    expect(mapGroupJoinError("dual_verification_required")).toMatch(/Profile/i);
  });
});

describe("classifyGroupJoinError", () => {
  it("marks deleted/inactive/invalid link as terminal", () => {
    expect(classifyGroupJoinError("group_deleted").terminal).toBe(true);
    expect(classifyGroupJoinError("group_inactive").terminal).toBe(true);
    expect(classifyGroupJoinError("group_link_invalid").terminal).toBe(true);
    expect(classifyGroupJoinError("daily_otp_invalid").terminal).toBe(false);
  });

  it("maps bridge configuration failures as terminal", () => {
    const info = classifyGroupJoinError("BRIDGE_NOT_CONFIGURED");
    expect(info.code).toBe("bridge_not_configured");
    expect(info.title).toMatch(/bridge/i);
    expect(info.terminal).toBe(true);
  });
});
