/** High-volume capability ribbon mock — tests/DEV harness only. Not live data. */

import type { CapRibbonInput } from "./employerDashboard.capability";
import type { EmployerOsDomainSnapshot } from "./employerDashboard.osTypes";

function snap(
  domain: EmployerOsDomainSnapshot["domain"],
  title: string,
  openCount: number,
  pendingCount: number,
  confirmedCount: number,
): EmployerOsDomainSnapshot {
  return {
    domain,
    title,
    openLabel: "Open",
    openCount,
    pendingLabel: "Pending",
    pendingCount,
    confirmedLabel: "Confirmed",
    confirmedCount,
  };
}

/** ~26 domain signals: 30 shifts, 8 interviews, 15 gate, 12 vault, plus planner/workspace load. */
export const HIGH_VOLUME_CAP_RIBBON_INPUT: CapRibbonInput = {
  shift: snap("shift", "Shift Jobs", 30, 10, 4),
  career: snap("career", "Career Jobs", 12, 9, 8),
  planner: snap("planner", "Planner", 7, 5, 3),
  workspaces: {
    shiftCount: 18,
    careerCount: 9,
    shiftHref: "/employer/shift/workspaces",
    careerHref: "/employer/my-staff",
  },
  shiftStartingSoon: 6,
  shiftUpcoming: 22,
  workspaceClockedIn: 142,
  gatePending: 15,
  gateFlags: 2,
  vaultExpiring: 12,
};

export function countHighVolumeSignals(
  input: CapRibbonInput = HIGH_VOLUME_CAP_RIBBON_INPUT,
): number {
  return (
    input.shift.openCount +
    input.shift.pendingCount +
    input.shiftStartingSoon +
    input.career.confirmedCount +
    input.planner.pendingCount +
    (input.gatePending ?? 0) +
    (input.gateFlags ?? 0) +
    (input.vaultExpiring ?? 0)
  );
}
