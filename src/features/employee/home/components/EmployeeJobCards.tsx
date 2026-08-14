/** Job Mitra | EmployeeJobCards.tsx | Glass domain tiles for employee home */

import { useCallback, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { IconCalendar, IconBriefcase } from "./employeeHomeIcons";
import { DESIGN_TOKENS } from "../../../../app/theme/designTokens";
import { plannerPublicIndex } from "../../../shared/planner/plannerPublic";
import { PulseNode } from "../../../pulse/PulseNode";
import { DomainCard } from "../../../../shared/components/layout/designDna";
import {
  DOMAIN_BY_KEY,
  domainAccentCssVar,
  getDomainCopy,
} from "../../../../shared/config/domainRegistry";

export function ShiftJobsCard() {
  const nav = useNavigate();
  const domain = DOMAIN_BY_KEY.shift;
  const handleOpen = useCallback(() => {
    nav(ROUTE_PATHS.employeeShiftCenter);
  }, [nav]);

  return (
    <PulseNode
      id="employee-home-shift-card"
      style={{ "--wm-pulse-node-radius": DESIGN_TOKENS.geometry.radiusCard, width: "100%" }}
    >
      <DomainCard
        domain="shift"
        title={domain.title}
        subtitle={getDomainCopy("shift", "employee")}
        ariaLabel={`Open ${domain.title}`}
        onClick={handleOpen}
        icon={<IconCalendar />}
        iconStyle={{
          background: `color-mix(in srgb, ${domainAccentCssVar("shift")} 12%, transparent)`,
          color: domainAccentCssVar("shift"),
        }}
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
  const domain = DOMAIN_BY_KEY.planner;

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
      : getDomainCopy("planner", "employee");

  return (
    <PulseNode
      id="employee-home-gig-projects-card"
      style={{ "--wm-pulse-node-radius": DESIGN_TOKENS.geometry.radiusCard, width: "100%" }}
    >
      <DomainCard
        domain="planner"
        title={domain.title}
        subtitle={subtitle}
        ariaLabel={`Open ${domain.title}. ${subtitle}.`}
        onClick={handleOpen}
        icon={<IconGigProjects />}
        iconStyle={{
          background:
            "color-mix(in srgb, color-mix(in srgb, var(--wm-planner-accent) 72%, var(--wm-indigo-500) 28%) 12%, transparent)",
          color: "color-mix(in srgb, var(--wm-planner-accent) 72%, var(--wm-indigo-500) 28%)",
        }}
      />
    </PulseNode>
  );
}

export function CareerJobsCard() {
  const nav = useNavigate();
  const domain = DOMAIN_BY_KEY.career;
  const handleOpen = useCallback(() => {
    nav(ROUTE_PATHS.employeeCareerHome);
  }, [nav]);

  return (
    <PulseNode
      id="employee-home-career-card"
      style={{ "--wm-pulse-node-radius": DESIGN_TOKENS.geometry.radiusCard, width: "100%" }}
    >
      <DomainCard
        domain="career"
        title={domain.title}
        subtitle={getDomainCopy("career", "employee")}
        ariaLabel={`Open ${domain.title}`}
        onClick={handleOpen}
        icon={<IconBriefcase />}
        iconStyle={{
          background: `color-mix(in srgb, ${domainAccentCssVar("career")} 12%, transparent)`,
          color: domainAccentCssVar("career"),
        }}
      />
    </PulseNode>
  );
}
