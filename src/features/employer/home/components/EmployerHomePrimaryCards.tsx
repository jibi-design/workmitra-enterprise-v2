/** Job Mitra | EmployerHomePrimaryCards.tsx | Executive primary recruitment tiles */

import { useCallback, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { DashboardData } from "../helpers/employerHomeDashboard";
import { IconCareer, IconPlanner, IconShift } from "./employerHomeIcons";
import { DESIGN_TOKENS } from "../../../../app/theme/designTokens";
import { PulseNode } from "../../../pulse/PulseNode";
import { demandPlannerStorage } from "../../planner/storage/demandPlannerStorage";
import { ActionPill, DomainCard } from "../../../../shared/components/layout/designDna";
import {
  DOMAIN_BY_KEY,
  domainAccentCssVar,
  getDomainCopy,
} from "../../../../shared/config/domainRegistry";

function CreatePostButton({
  ariaLabel,
  label,
  domain,
  onCreate,
}: {
  readonly ariaLabel: string;
  readonly label: "Post" | "Create";
  readonly domain: "shift" | "career" | "planner";
  readonly onCreate: () => void;
}) {
  return (
    <ActionPill
      bare
      domain={domain}
      aria-label={ariaLabel}
      className="wm-erCreateCta"
      onClick={(event) => {
        event.stopPropagation();
        onCreate();
      }}
    >
      {`+ ${label}`}
    </ActionPill>
  );
}

function DomainStatusBadge({ label }: { readonly label: string }) {
  return (
    <span className="wm-erDomainBadge" aria-hidden="true">
      <span className="wm-erDomainBadge__dot" />
      {label}
    </span>
  );
}

export function CareerJobsCard({ data }: { data: DashboardData }) {
  const nav = useNavigate();
  const domain = DOMAIN_BY_KEY.career;
  const handleOpen = useCallback(() => nav(ROUTE_PATHS.employerCareerHome), [nav]);
  const handleCreate = useCallback(() => nav(ROUTE_PATHS.employerCareerCreate), [nav]);
  const badgeLabel =
    data.careerApplications > 0
      ? `${data.careerApplications} apps · ${data.careerInterviews} interviews`
      : data.careerActive > 0
        ? `${data.careerActive} live posts`
        : "Ready to post";

  return (
    <PulseNode
      id="home-career-card"
      className="w-full"
      style={{
        "--wm-pulse-node-radius": DESIGN_TOKENS.geometry.radiusCardEmployer,
        width: "100%",
      }}
    >
      <DomainCard
        domain="career"
        audience="employer"
        asDiv
        stack
        className="wm-erExecCard"
        title={domain.title}
        subtitle={getDomainCopy("career", "employer")}
        ariaLabel={`Open ${domain.title}. ${data.careerApplications} career applications and ${data.careerInterviews} interviews need review.`}
        onClick={handleOpen}
        icon={<IconCareer />}
        iconStyle={{
          background: `color-mix(in srgb, ${domainAccentCssVar("career")} 10%, transparent)`,
          color: domainAccentCssVar("career"),
        }}
        trailing={
          <CreatePostButton
            ariaLabel="Create Career Job"
            label="Post"
            domain="career"
            onCreate={handleCreate}
          />
        }
      >
        <DomainStatusBadge label={badgeLabel} />
      </DomainCard>
    </PulseNode>
  );
}

export function ShiftJobsCard({ data }: { data: DashboardData }) {
  const nav = useNavigate();
  const domain = DOMAIN_BY_KEY.shift;
  const handleOpen = useCallback(() => nav(ROUTE_PATHS.employerShiftHome), [nav]);
  const handleCreate = useCallback(() => nav(ROUTE_PATHS.employerShiftCreate), [nav]);
  const badgeLabel =
    data.shiftApplications > 0
      ? `${data.shiftApplications} apps pending`
      : data.shiftActive > 0
        ? `${data.shiftActive} live shifts`
        : "Ready to post";

  return (
    <PulseNode
      id="home-shift-card"
      className="w-full"
      style={{
        "--wm-pulse-node-radius": DESIGN_TOKENS.geometry.radiusCardEmployer,
        width: "100%",
      }}
    >
      <DomainCard
        domain="shift"
        audience="employer"
        asDiv
        stack
        className="wm-erExecCard"
        title={domain.title}
        subtitle={getDomainCopy("shift", "employer")}
        ariaLabel={`Open ${domain.title}. ${data.shiftApplications} shift applications need review.`}
        onClick={handleOpen}
        icon={<IconShift />}
        iconStyle={{
          background: `color-mix(in srgb, ${domainAccentCssVar("shift")} 10%, transparent)`,
          color: domainAccentCssVar("shift"),
        }}
        trailing={
          <CreatePostButton
            ariaLabel="Create Shift"
            label="Post"
            domain="shift"
            onCreate={handleCreate}
          />
        }
      >
        <DomainStatusBadge label={badgeLabel} />
      </DomainCard>
    </PulseNode>
  );
}

export function DemandPlannerCard() {
  const nav = useNavigate();
  const domain = DOMAIN_BY_KEY.planner;

  const activePlanCount = useSyncExternalStore(
    demandPlannerStorage.subscribe,
    () => demandPlannerStorage.getAll().filter((p) => p.status === "active").length,
    () => demandPlannerStorage.getAll().filter((p) => p.status === "active").length,
  );

  const handleOpen = useCallback(() => nav(ROUTE_PATHS.employerPlannerHome), [nav]);
  const handleCreate = useCallback(() => nav(ROUTE_PATHS.employerPlannerNew), [nav]);

  const subtitle =
    activePlanCount > 0
      ? `${activePlanCount} active project${activePlanCount !== 1 ? "s" : ""}`
      : getDomainCopy("planner", "employer");

  const badgeLabel = activePlanCount > 0 ? `${activePlanCount} live plans` : "Ready to create";

  return (
    <PulseNode
      id="home-planner-card"
      className="w-full"
      style={{
        "--wm-pulse-node-radius": DESIGN_TOKENS.geometry.radiusCardEmployer,
        width: "100%",
      }}
    >
      <DomainCard
        domain="planner"
        audience="employer"
        asDiv
        stack
        className="wm-erExecCard"
        title={domain.title}
        subtitle={subtitle}
        ariaLabel={`Open ${domain.title}. ${subtitle}.`}
        onClick={handleOpen}
        icon={<IconPlanner />}
        iconStyle={{
          background: `color-mix(in srgb, ${domainAccentCssVar("planner")} 10%, transparent)`,
          color: domainAccentCssVar("planner"),
        }}
        trailing={
          <CreatePostButton
            ariaLabel="Create new demand plan"
            label="Create"
            domain="planner"
            onCreate={handleCreate}
          />
        }
      >
        <DomainStatusBadge label={badgeLabel} />
      </DomainCard>
    </PulseNode>
  );
}
