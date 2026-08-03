/** Job Mitra | EmployeeJobCards.tsx | Glass domain tiles for employee home */

import { useCallback, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { IconCalendar, IconBriefcase } from "./employeeHomeIcons";
import { DESIGN_TOKENS } from "../../../../app/theme/designTokens";
import { plannerPublicIndex } from "../../../shared/planner/plannerPublic";
import { PulseNode } from "../../../pulse/PulseNode";
import { HomeGlassCardShell } from "../../../../shared/components/layout/HomeGlassCardShell";

const TRAIL = (
  <span className="wm-homeGlassCard__chevron" aria-hidden="true">
    →
  </span>
);

export function ShiftJobsCard() {
  const nav = useNavigate();
  const handleOpen = useCallback(() => {
    nav(ROUTE_PATHS.employeeShiftCenter);
  }, [nav]);

  return (
    <PulseNode
      id="employee-home-shift-card"
      style={{ "--wm-pulse-node-radius": DESIGN_TOKENS.geometry.radiusCard, width: "100%" }}
    >
      <HomeGlassCardShell
        title="Shift Jobs"
        subtitle="Browse & apply for shifts"
        ariaLabel="Open Shift Jobs"
        onClick={handleOpen}
        icon={<IconCalendar />}
        iconStyle={{
          background: "rgba(39, 174, 96, 0.08)",
          color: "var(--wm-shift-accent, #27AE60)",
        }}
        trailing={TRAIL}
      />
    </PulseNode>
  );
}

function IconGigProjects() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm0 16H5V8h14v11ZM7 10h5v5H7z"
      />
    </svg>
  );
}

export function GigProjectsCard() {
  const nav = useNavigate();

  const openProjectCount = useSyncExternalStore(
    plannerPublicIndex.subscribe,
    () => plannerPublicIndex.getActiveEntries().length,
    () => plannerPublicIndex.getActiveEntries().length,
  );

  const handleOpen = useCallback(() => {
    nav(ROUTE_PATHS.employeePlannerHome);
  }, [nav]);

  const subtitle =
    openProjectCount > 0
      ? `${openProjectCount} multi-day project${openProjectCount !== 1 ? "s" : ""} open`
      : "Browse agency project plans";

  return (
    <PulseNode
      id="employee-home-gig-projects-card"
      style={{ "--wm-pulse-node-radius": DESIGN_TOKENS.geometry.radiusCard, width: "100%" }}
    >
      <HomeGlassCardShell
        title="Gig Projects"
        subtitle={subtitle}
        ariaLabel={`Open Gig Projects. ${subtitle}.`}
        onClick={handleOpen}
        icon={<IconGigProjects />}
        iconStyle={{
          background: "rgba(8, 145, 178, 0.08)",
          color: "#0891B2",
        }}
        trailing={TRAIL}
      />
    </PulseNode>
  );
}

export function CareerJobsCard() {
  const nav = useNavigate();
  const handleOpen = useCallback(() => {
    nav(ROUTE_PATHS.employeeCareerHome);
  }, [nav]);

  return (
    <PulseNode
      id="employee-home-career-card"
      style={{ "--wm-pulse-node-radius": DESIGN_TOKENS.geometry.radiusCard, width: "100%" }}
    >
      <HomeGlassCardShell
        title="Career Jobs"
        subtitle="Find permanent roles"
        ariaLabel="Open Career Jobs"
        onClick={handleOpen}
        icon={<IconBriefcase />}
        iconStyle={{
          background: "var(--wm-career-accent-soft, rgba(29, 78, 216, 0.1))",
          color: "var(--wm-career-accent, #2563eb)",
        }}
        trailing={TRAIL}
      />
    </PulseNode>
  );
}
