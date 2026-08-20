/** Job Mitra | employerDashboard.osExtras.test.ts */

import { describe, expect, it } from "vitest";
import { computeOsRibbonExtras, countHrClockedInToday } from "./employerDashboard.osExtras";

describe("countHrClockedInToday", () => {
  it("counts present logs for the local calendar day", () => {
    const now = new Date(2026, 7, 20, 12, 0, 0);
    const today = "2026-08-20";
    expect(
      countHrClockedInToday(
        [
          { status: "present", work_date: today },
          { status: "absent", work_date: today },
          { status: "clocked_in", work_date: "2026-08-19" },
        ],
        now,
      ),
    ).toBe(1);
  });
});

describe("computeOsRibbonExtras", () => {
  it("falls back to zero extras so tiles can show Tracks hints", () => {
    const extras = computeOsRibbonExtras({
      workspaces: [],
      apps: [],
      documents: [],
    });
    expect(extras).toEqual({
      workspaceClockedIn: 0,
      gatePending: 0,
      gateFlags: 0,
      vaultExpiring: 0,
    });
  });

  it("uses active rooms and HR clock-ins, upcoming as pending, left/no-show as flags", () => {
    const extras = computeOsRibbonExtras({
      workspaces: [
        { id: "a", postId: "p1", status: "active", lastActivityAt: 1, startAt: 1 },
        { id: "b", postId: "p2", status: "upcoming", lastActivityAt: 1, startAt: 1 },
        { id: "c", postId: "p3", status: "replaced", lastActivityAt: 1, startAt: 1 },
      ],
      apps: [
        {
          id: "x",
          postId: "p3",
          createdAt: 1,
          status: "replaced",
          mustHaveAnswers: {},
          goodToHaveAnswers: {},
          notes: {},
          replacedReason: "no_show",
        },
      ],
      documents: [],
      hrClockedIn: 4,
    });
    expect(extras.workspaceClockedIn).toBe(4);
    expect(extras.gatePending).toBe(1);
    expect(extras.gateFlags).toBe(2);
  });
});
