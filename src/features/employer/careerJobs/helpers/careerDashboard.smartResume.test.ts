import { describe, expect, it } from "vitest";
import {
  parseCareerDashboardTab,
  resolveCareerDashboardLandingTab,
} from "./careerDashboard.smartResume";

describe("resolveCareerDashboardLandingTab", () => {
  it("prefers offered over earlier stages", () => {
    expect(
      resolveCareerDashboardLandingTab({
        applied: 4,
        shortlisted: 2,
        interview: 1,
        offered: 1,
        hired: 0,
      }),
    ).toBe("offered");
  });

  it("falls through to shortlisted when that is the next hire step", () => {
    expect(
      resolveCareerDashboardLandingTab({
        applied: 0,
        shortlisted: 3,
        interview: 0,
        offered: 0,
        hired: 0,
      }),
    ).toBe("shortlisted");
  });
});

describe("parseCareerDashboardTab", () => {
  it("keeps an explicit URL tab", () => {
    expect(parseCareerDashboardTab("interview")).toBe("interview");
    expect(parseCareerDashboardTab("nope")).toBeNull();
  });
});
