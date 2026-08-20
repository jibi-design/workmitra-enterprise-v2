/** Capability ribbon copy — hints vs live alerts. No domain state mix. */

import type { EmployerOsDomain, EmployerOsDomainSnapshot } from "./employerDashboard.osTypes";
import type { EmployerOsWorkspaceStrip } from "./employerDashboard.osOps";

export type EmployerWorkflowStep = {
  readonly n: string;
  readonly label: string;
};

export const EMPLOYER_DOMAIN_WORKFLOW: Record<EmployerOsDomain, readonly EmployerWorkflowStep[]> = {
  shift: [
    { n: "1", label: "Post" },
    { n: "2", label: "Review" },
    { n: "3", label: "Confirm" },
  ],
  career: [
    { n: "1", label: "Post" },
    { n: "2", label: "Pipeline" },
    { n: "3", label: "Hire" },
  ],
  planner: [
    { n: "1", label: "Plan" },
    { n: "2", label: "Review" },
    { n: "3", label: "Confirm" },
  ],
};

export const CAPABILITY_HINTS = {
  shift: "Tracks: Open Shifts • Applicants • Urgent Start Alerts",
  career: "Tracks: Active Roles • Scheduled Interviews • Hire Pipeline",
  planner: "Tracks: Multi-day Plans • Unfilled Gaps • Batch Approvals",
  workspaces: "Tracks: Live Clocked-in Staff • Room Badges (Shift/Career)",
  gate: "Tracks: Real-time Gate Verification • Pending Check-ins • Entry Flags",
  trust: "Tracks: Staff Verification % • Expiry Alerts • Compliance Records",
} as const;

export type CapBadgeTone = "shift" | "career" | "planner" | "alert" | "neutral";

export type CapBadge = {
  readonly text: string;
  readonly tone: CapBadgeTone;
};

export type CapTileModel = {
  readonly domainClass: string;
  readonly title: string;
  readonly testId: string;
  readonly empty: boolean;
  readonly hint: string;
  readonly alert: string | null;
  readonly badges: readonly CapBadge[];
};

export type CapRibbonInput = {
  readonly shift: EmployerOsDomainSnapshot;
  readonly career: EmployerOsDomainSnapshot;
  readonly planner: EmployerOsDomainSnapshot;
  readonly workspaces: EmployerOsWorkspaceStrip;
  readonly shiftStartingSoon: number;
  readonly shiftUpcoming: number;
  readonly workspaceClockedIn?: number;
  readonly gatePending?: number;
  readonly gateFlags?: number;
  readonly vaultExpiring?: number;
};

function qty(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

function n(value: number | undefined): number {
  return value != null && value > 0 ? value : 0;
}

function laneQuiet(snap: EmployerOsDomainSnapshot): boolean {
  return snap.openCount <= 0 && snap.pendingCount <= 0 && snap.confirmedCount <= 0;
}

function pushBadge(list: CapBadge[], n: number, one: string, many: string, tone: CapBadgeTone) {
  if (n > 0 && list.length < 2) list.push({ text: qty(n, one, many), tone });
}

function shiftTile(input: CapRibbonInput): CapTileModel {
  const { shift, shiftStartingSoon, shiftUpcoming } = input;
  const empty = laneQuiet(shift) && shiftStartingSoon <= 0 && shiftUpcoming <= 0;
  let alert: string | null = null;
  if (!empty) {
    if (shiftStartingSoon > 0) {
      alert = qty(shiftStartingSoon, "Shift Starting Soon", "Shifts Starting Soon");
    } else if (shift.pendingCount > 0) {
      alert = qty(shift.pendingCount, "Applicant waiting", "Applicants waiting");
    } else if (shiftUpcoming > 0) {
      alert = qty(shiftUpcoming, "Upcoming shift", "Upcoming shifts");
    }
  }
  const badges: CapBadge[] = [];
  if (!empty) {
    pushBadge(badges, shift.openCount, "Active Post", "Active Posts", "shift");
    pushBadge(badges, shift.pendingCount, "Applicant", "Applicants", "neutral");
    pushBadge(badges, shift.confirmedCount, "Confirmed", "Confirmed", "neutral");
  }
  return {
    domainClass: "shift",
    title: "Shift Jobs",
    testId: "employer-cap-shift",
    empty,
    hint: CAPABILITY_HINTS.shift,
    alert,
    badges,
  };
}

function careerTile(snap: EmployerOsDomainSnapshot): CapTileModel {
  const empty = laneQuiet(snap);
  let alert: string | null = null;
  if (!empty) {
    if (snap.confirmedCount > 0) {
      alert = qty(snap.confirmedCount, "Interview scheduled", "Interviews scheduled");
    } else if (snap.pendingCount > 0) {
      alert = qty(snap.pendingCount, "Hire-pipeline item", "Hire-pipeline items");
    }
  }
  const badges: CapBadge[] = [];
  if (!empty) {
    pushBadge(badges, snap.openCount, "Active Role", "Active Roles", "career");
    pushBadge(badges, snap.confirmedCount, "Interview", "Interviews", "neutral");
    pushBadge(badges, snap.pendingCount, "In pipeline", "In pipeline", "neutral");
  }
  return {
    domainClass: "career",
    title: "Career Jobs",
    testId: "employer-cap-career",
    empty,
    hint: CAPABILITY_HINTS.career,
    alert,
    badges,
  };
}

function plannerTile(snap: EmployerOsDomainSnapshot): CapTileModel {
  const empty = laneQuiet(snap);
  let alert: string | null = null;
  if (!empty) {
    if (snap.pendingCount > 0) {
      alert = qty(snap.pendingCount, "Batch approval waiting", "Batch approvals waiting");
    } else if ((snap.extraCount ?? 0) > 0) {
      alert = qty(snap.extraCount ?? 0, "New plan this week", "New plans this week");
    }
  }
  const badges: CapBadge[] = [];
  if (!empty) {
    pushBadge(badges, snap.openCount, "Open plan", "Open plans", "planner");
    pushBadge(badges, snap.pendingCount, "Batch to review", "Batches to review", "neutral");
    pushBadge(badges, snap.confirmedCount, "Approved", "Approved", "neutral");
  }
  return {
    domainClass: "planner",
    title: "Demand Planner",
    testId: "employer-cap-planner",
    empty,
    hint: CAPABILITY_HINTS.planner,
    alert,
    badges,
  };
}

function workspacesTile(ws: EmployerOsWorkspaceStrip, clockedIn: number): CapTileModel {
  const empty = ws.shiftCount <= 0 && ws.careerCount <= 0 && clockedIn <= 0;
  let alert: string | null = null;
  if (!empty && clockedIn > 0) {
    alert = qty(clockedIn, "Clocked-in staff", "Clocked-in staff");
  }
  const badges: CapBadge[] = [];
  if (!empty) {
    pushBadge(badges, ws.shiftCount, "Shift room", "Shift rooms", "shift");
    pushBadge(badges, ws.careerCount, "Career room", "Career rooms", "career");
  }
  return {
    domainClass: "workspaces",
    title: "Workspaces",
    testId: "employer-cap-workspaces",
    empty,
    hint: CAPABILITY_HINTS.workspaces,
    alert,
    badges,
  };
}

function gateTile(pending: number, flags: number): CapTileModel {
  const empty = pending <= 0 && flags <= 0;
  let alert: string | null = null;
  if (!empty) {
    if (flags > 0) alert = qty(flags, "Gate Flag Alert", "Gate Flag Alerts");
    else alert = qty(pending, "Pending check-in", "Pending check-ins");
  }
  const badges: CapBadge[] = [];
  if (!empty) {
    pushBadge(badges, flags, "Flag", "Flags", "alert");
    pushBadge(badges, pending, "Pending entry", "Pending entries", "neutral");
  }
  return {
    domainClass: "gate",
    title: "Gate Ops",
    testId: "employer-cap-gate",
    empty,
    hint: CAPABILITY_HINTS.gate,
    alert,
    badges,
  };
}

function vaultTile(expiring: number): CapTileModel {
  const empty = expiring <= 0;
  return {
    domainClass: "trust",
    title: "Trust / Vault",
    testId: "employer-cap-trust",
    empty,
    hint: CAPABILITY_HINTS.trust,
    alert: empty ? null : qty(expiring, "Expiring vault doc", "Expiring vault docs"),
    badges: empty ? [] : [{ text: qty(expiring, "Expiry alert", "Expiry alerts"), tone: "alert" }],
  };
}

export function buildCapabilityTiles(input: CapRibbonInput): readonly CapTileModel[] {
  return [
    shiftTile(input),
    careerTile(input.career),
    plannerTile(input.planner),
    workspacesTile(input.workspaces, n(input.workspaceClockedIn)),
    gateTile(n(input.gatePending), n(input.gateFlags)),
    vaultTile(n(input.vaultExpiring)),
  ];
}
