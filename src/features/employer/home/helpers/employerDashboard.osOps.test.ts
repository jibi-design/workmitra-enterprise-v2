/** Job Mitra | employerDashboard.osOps.test.ts */

import { describe, expect, it } from "vitest";
import {
  countLiveCareerWorkspaces,
  countLiveShiftWorkspaces,
  isCreatedThisWeek,
} from "./employerDashboard.osOps";
import type { CareerWorkspace } from "../../careerJobs/types/careerTypes";
import type { ShiftWorkspace } from "../../shiftJobs/types/shiftWorkspaceTypes";

describe("employerDashboard.osOps", () => {
  it("counts only live shift workspaces", () => {
    const rows = [
      { status: "active" },
      { status: "upcoming" },
      { status: "completed" },
      { status: "left" },
    ] as ShiftWorkspace[];
    expect(countLiveShiftWorkspaces(rows)).toBe(2);
  });

  it("counts only live career workspaces", () => {
    const rows = [
      { status: "active" },
      { status: "onboarding" },
      { status: "completed" },
      { status: "terminated" },
    ] as CareerWorkspace[];
    expect(countLiveCareerWorkspaces(rows)).toBe(2);
  });

  it("marks created-this-week timestamps", () => {
    const now = 1_700_000_000_000;
    expect(isCreatedThisWeek(now - 2 * 24 * 60 * 60 * 1000, now)).toBe(true);
    expect(isCreatedThisWeek(now - 8 * 24 * 60 * 60 * 1000, now)).toBe(false);
  });
});
