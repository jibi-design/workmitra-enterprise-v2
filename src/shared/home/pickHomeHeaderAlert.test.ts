import { describe, expect, it } from "vitest";
import { pickHomeHeaderAlert } from "./pickHomeHeaderAlert";

describe("pickHomeHeaderAlert", () => {
  it("keeps a single actionable row with join first", () => {
    expect(
      pickHomeHeaderAlert({
        hasJoin: true,
        pendingCount: 2,
        hasUpcoming: true,
        hasInbox: true,
      }),
    ).toBe("join");
  });

  it("prefers pending action over upcoming and inbox", () => {
    expect(
      pickHomeHeaderAlert({
        hasJoin: false,
        pendingCount: 1,
        hasUpcoming: true,
        hasInbox: true,
      }),
    ).toBe("pending");
  });

  it("uses upcoming only when nothing is pending", () => {
    expect(
      pickHomeHeaderAlert({
        hasJoin: false,
        pendingCount: 0,
        hasUpcoming: true,
        hasInbox: true,
      }),
    ).toBe("upcoming");
  });

  it("uses inbox only when it is the last remaining alert", () => {
    expect(
      pickHomeHeaderAlert({
        hasJoin: false,
        pendingCount: 0,
        hasUpcoming: false,
        hasInbox: true,
      }),
    ).toBe("inbox");
  });
});
