/** Work-this-lane focus cards — controllers, not the status ribbon. */

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { CAPABILITY_HINTS } from "./employerDashboard.capability";
import type { EmployerOsDomain, EmployerOsDomainSnapshot } from "./employerDashboard.osTypes";

export type LaneFocusCopy = {
  readonly title: string;
  readonly empty: boolean;
  readonly hint: string;
  readonly openLine: string;
  readonly pendingLine: string;
  readonly plusLabel: string;
  readonly plusHref: string;
};

const OPEN_NOUN: Record<EmployerOsDomain, string> = {
  shift: "Open Posts",
  career: "Active Roles",
  planner: "Active Plans",
};

const PENDING_NOUN: Record<EmployerOsDomain, string> = {
  shift: "Waiting review",
  career: "In pipeline",
  planner: "Batches to review",
};

const TITLE: Record<EmployerOsDomain, string> = {
  shift: "Shift Jobs",
  career: "Career Jobs",
  planner: "Demand Planner",
};

const PLUS: Record<EmployerOsDomain, { label: string; href: string }> = {
  shift: { label: "Post Shift", href: ROUTE_PATHS.employerShiftCreate },
  career: { label: "Post Role", href: ROUTE_PATHS.employerCareerCreate },
  planner: { label: "Create Plan", href: ROUTE_PATHS.employerPlannerNew },
};

function laneQuiet(snap: EmployerOsDomainSnapshot): boolean {
  return snap.openCount <= 0 && snap.pendingCount <= 0 && snap.confirmedCount <= 0;
}

export function laneFocusCopy(snap: EmployerOsDomainSnapshot): LaneFocusCopy {
  const plus = PLUS[snap.domain];
  return {
    title: TITLE[snap.domain],
    empty: laneQuiet(snap),
    hint: CAPABILITY_HINTS[snap.domain],
    openLine: `${snap.openCount} ${OPEN_NOUN[snap.domain]}`,
    pendingLine: `${snap.pendingCount} ${PENDING_NOUN[snap.domain]}`,
    plusLabel: plus.label,
    plusHref: plus.href,
  };
}
