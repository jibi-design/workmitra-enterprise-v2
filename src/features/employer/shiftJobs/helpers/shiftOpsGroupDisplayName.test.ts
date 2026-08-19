import { describe, expect, it } from "vitest";
import { buildShiftOpsGroupDisplayName } from "./shiftOpsGroupDisplayName";

describe("buildShiftOpsGroupDisplayName", () => {
  it("joins employer, job title, date, and timing", () => {
    const name = buildShiftOpsGroupDisplayName({
      companyName: "Harbour Civic Hall",
      jobName: "Banquet Floor Host",
      startAt: Date.UTC(2026, 7, 21, 9, 0),
      shiftTiming: "09:00–17:00",
    });
    expect(name).toContain("Harbour Civic Hall");
    expect(name).toContain("Banquet Floor Host");
    expect(name).toContain("09:00–17:00");
  });

  it("falls back when fields are empty", () => {
    expect(buildShiftOpsGroupDisplayName({})).toBe("Shift Ops group");
  });
});
