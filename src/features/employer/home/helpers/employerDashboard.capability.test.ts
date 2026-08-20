/** Job Mitra | employerDashboard.capability.test.ts */

import { describe, expect, it } from "vitest";
import { buildCapabilityTiles, CAPABILITY_HINTS } from "./employerDashboard.capability";
import type { EmployerOsDomainSnapshot } from "./employerDashboard.osTypes";

const emptyShift: EmployerOsDomainSnapshot = {
  domain: "shift",
  title: "Shift Jobs",
  openLabel: "Open posts",
  openCount: 0,
  pendingLabel: "Waiting review",
  pendingCount: 0,
  confirmedLabel: "Confirmed",
  confirmedCount: 0,
};

const emptyCareer: EmployerOsDomainSnapshot = {
  ...emptyShift,
  domain: "career",
  title: "Career Jobs",
};

const emptyPlanner: EmployerOsDomainSnapshot = {
  ...emptyShift,
  domain: "planner",
  title: "Planner",
};

const emptyWs = {
  shiftCount: 0,
  careerCount: 0,
  shiftHref: "/s",
  careerHref: "/c",
};

describe("buildCapabilityTiles", () => {
  it("shows capability hints when every lane is empty — never Ready or 0", () => {
    const tiles = buildCapabilityTiles({
      shift: emptyShift,
      career: emptyCareer,
      planner: emptyPlanner,
      workspaces: emptyWs,
      shiftStartingSoon: 0,
      shiftUpcoming: 0,
    });
    expect(tiles[0]?.empty).toBe(true);
    expect(tiles[0]?.hint).toBe(CAPABILITY_HINTS.shift);
    expect(tiles[0]?.alert).toBeNull();
    expect(tiles[0]?.badges).toEqual([]);
    expect(tiles[1]?.hint).toBe(CAPABILITY_HINTS.career);
    expect(tiles[2]?.hint).toBe(CAPABILITY_HINTS.planner);
    expect(tiles[3]?.hint).toBe(CAPABILITY_HINTS.workspaces);
    expect(tiles[4]?.hint).toBe(CAPABILITY_HINTS.gate);
    expect(tiles[5]?.hint).toBe(CAPABILITY_HINTS.trust);
    const blob = JSON.stringify(tiles);
    expect(blob.includes("Ready")).toBe(false);
    expect(blob.includes('"0 ')).toBe(false);
  });

  it("puts shift-starting-soon ahead of applicant volume", () => {
    const [shift] = buildCapabilityTiles({
      shift: { ...emptyShift, openCount: 15, pendingCount: 40 },
      career: emptyCareer,
      planner: emptyPlanner,
      workspaces: emptyWs,
      shiftStartingSoon: 1,
      shiftUpcoming: 4,
    });
    expect(shift?.empty).toBe(false);
    expect(shift?.alert).toBe("1 Shift Starting Soon");
    expect(shift?.badges[0]?.text).toBe("15 Active Posts");
    expect(shift?.badges[1]?.text).toBe("40 Applicants");
    expect(shift?.badges).toHaveLength(2);
  });

  it("prioritizes career interviews over pipeline volume", () => {
    const tiles = buildCapabilityTiles({
      shift: emptyShift,
      career: { ...emptyCareer, openCount: 8, pendingCount: 20, confirmedCount: 3 },
      planner: emptyPlanner,
      workspaces: { ...emptyWs, shiftCount: 2, careerCount: 1 },
      shiftStartingSoon: 0,
      shiftUpcoming: 0,
    });
    expect(tiles[1]?.alert).toBe("3 Interviews scheduled");
    expect(tiles[1]?.badges.map((b) => b.text)).toEqual(["8 Active Roles", "3 Interviews"]);
    expect(tiles[3]?.empty).toBe(false);
    expect(tiles[3]?.badges.map((b) => b.text)).toEqual(["2 Shift rooms", "1 Career room"]);
  });

  it("keeps high-volume mock to two badges and a single priority alert per tile", () => {
    const tiles = buildCapabilityTiles({
      shift: { ...emptyShift, openCount: 30, pendingCount: 10 },
      career: { ...emptyCareer, openCount: 12, pendingCount: 9, confirmedCount: 8 },
      planner: { ...emptyPlanner, openCount: 7, pendingCount: 5 },
      workspaces: { ...emptyWs, shiftCount: 18, careerCount: 9 },
      shiftStartingSoon: 6,
      shiftUpcoming: 22,
      workspaceClockedIn: 142,
      gatePending: 15,
      gateFlags: 2,
      vaultExpiring: 12,
    });
    expect(tiles).toHaveLength(6);
    for (const tile of tiles) {
      expect(tile.empty).toBe(false);
      expect(tile.alert).toBeTruthy();
      expect(tile.badges.length).toBeLessThanOrEqual(2);
    }
    expect(tiles[0]?.alert).toBe("6 Shifts Starting Soon");
    expect(tiles[1]?.alert).toBe("8 Interviews scheduled");
    expect(tiles[4]?.alert).toBe("2 Gate Flag Alerts");
    expect(tiles[5]?.alert).toBe("12 Expiring vault docs");
  });
});
