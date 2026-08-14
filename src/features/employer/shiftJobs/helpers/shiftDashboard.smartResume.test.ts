import { describe, expect, it } from "vitest";
import {
  resolveShiftDashboardLandingTab,
  shiftConfirmBannerCopy,
  shiftPipelineHasLaterWork,
} from "./shiftDashboard.smartResume";

describe("resolveShiftDashboardLandingTab", () => {
  it("lands shortlisted when vacancy remains and shortlist has people", () => {
    expect(
      resolveShiftDashboardLandingTab({ applied: 0, shortlisted: 1, backup: 0, selected: 0 }, 3),
    ).toBe("shortlisted");
  });

  it("keeps applied when new applicants are waiting and nobody is shortlisted", () => {
    expect(
      resolveShiftDashboardLandingTab({ applied: 2, shortlisted: 0, backup: 0, selected: 0 }, 3),
    ).toBe("applied");
  });

  it("does not send a full roster back to shortlist", () => {
    expect(
      resolveShiftDashboardLandingTab({ applied: 0, shortlisted: 1, backup: 0, selected: 3 }, 3),
    ).toBe("selected");
  });
});

describe("shift pipeline empty-copy guard", () => {
  it("treats shortlist-only as later pipeline work", () => {
    expect(shiftPipelineHasLaterWork({ applied: 0, shortlisted: 1, backup: 0, selected: 0 })).toBe(
      true,
    );
  });
});

describe("shiftConfirmBannerCopy", () => {
  it("matches the day-2 resume sentence", () => {
    const copy = shiftConfirmBannerCopy(1, 3);
    expect(copy.title).toContain("1 shortlisted worker waiting");
    expect(copy.title).toContain("Tap Confirm");
  });
});
