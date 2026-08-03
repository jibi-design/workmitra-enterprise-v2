/** Job Mitra | EmployerHomePrimaryCards.tsx | Glass primary recruitment tiles */

import { useCallback, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { DashboardData } from "../helpers/employerHomeDashboard";
import { IconCareer, IconPlanner, IconPlus, IconShift } from "./employerHomeIcons";
import { DESIGN_TOKENS } from "../../../../app/theme/designTokens";
import { PulseNode } from "../../../pulse/PulseNode";
import { demandPlannerStorage } from "../../planner/storage/demandPlannerStorage";
import { HomeGlassCardShell } from "../../../../shared/components/layout/HomeGlassCardShell";

function CreateActionButton({
  ariaLabel,
  onCreate,
}: {
  readonly ariaLabel: string;
  readonly onCreate: () => void;
}) {
  return (
    <button
      type="button"
      className="wm-homeGlassCard__action wm-press-btn"
      aria-label={ariaLabel}
      onClick={(event) => {
        event.stopPropagation();
        onCreate();
      }}
    >
      <IconPlus />
    </button>
  );
}

export function CareerJobsCard({ data }: { data: DashboardData }) {
  const nav = useNavigate();
  const handleOpen = useCallback(() => nav(ROUTE_PATHS.employerCareerHome), [nav]);
  const handleCreate = useCallback(() => nav(ROUTE_PATHS.employerCareerCreate), [nav]);

  return (
    <PulseNode
      id="home-career-card"
      className="w-full"
      style={{
        "--wm-pulse-node-radius": DESIGN_TOKENS.geometry.radiusCardEmployer,
        width: "100%",
      }}
    >
      <HomeGlassCardShell
        audience="employer"
        asDiv
        title="Career Jobs"
        subtitle="Manage hiring pipeline"
        ariaLabel={`Open Career Jobs. ${data.careerApplications} career applications and ${data.careerInterviews} interviews need review.`}
        onClick={handleOpen}
        icon={<IconCareer />}
        iconStyle={{
          background: "color-mix(in srgb, var(--wm-career-accent, #2563eb) 10%, transparent)",
          color: "var(--wm-career-accent, #2563eb)",
        }}
        trailing={<CreateActionButton ariaLabel="Create Career Job" onCreate={handleCreate} />}
      />
    </PulseNode>
  );
}

export function ShiftJobsCard({ data }: { data: DashboardData }) {
  const nav = useNavigate();
  const handleOpen = useCallback(() => nav(ROUTE_PATHS.employerShiftHome), [nav]);
  const handleCreate = useCallback(() => nav(ROUTE_PATHS.employerShiftCreate), [nav]);

  return (
    <PulseNode
      id="home-shift-card"
      className="w-full"
      style={{
        "--wm-pulse-node-radius": DESIGN_TOKENS.geometry.radiusCardEmployer,
        width: "100%",
      }}
    >
      <HomeGlassCardShell
        audience="employer"
        asDiv
        title="Shift Jobs"
        subtitle="Daily/weekly quick hiring"
        ariaLabel={`Open Shift Jobs. ${data.shiftApplications} shift applications need review.`}
        onClick={handleOpen}
        icon={<IconShift />}
        iconStyle={{
          background: "rgba(39, 174, 96, 0.08)",
          color: "var(--wm-shift-accent, #27AE60)",
        }}
        trailing={<CreateActionButton ariaLabel="Create Shift" onCreate={handleCreate} />}
      />
    </PulseNode>
  );
}

export function DemandPlannerCard() {
  const nav = useNavigate();

  const activePlanCount = useSyncExternalStore(
    demandPlannerStorage.subscribe,
    () => demandPlannerStorage.getAll().filter((p) => p.status === "active").length,
    () => demandPlannerStorage.getAll().filter((p) => p.status === "active").length,
  );

  const handleOpen = useCallback(() => nav(ROUTE_PATHS.employerPlannerHome), [nav]);
  const handleCreate = useCallback(() => nav(ROUTE_PATHS.employerPlannerNew), [nav]);

  const meta =
    activePlanCount > 0
      ? `${activePlanCount} active project${activePlanCount !== 1 ? "s" : ""}`
      : "Multi-day agency hiring";

  return (
    <PulseNode
      id="home-planner-card"
      className="w-full"
      style={{
        "--wm-pulse-node-radius": DESIGN_TOKENS.geometry.radiusCardEmployer,
        width: "100%",
      }}
    >
      <HomeGlassCardShell
        audience="employer"
        asDiv
        title="Gig Projects"
        subtitle={meta}
        ariaLabel={`Open Gig Projects. ${meta}.`}
        onClick={handleOpen}
        icon={<IconPlanner />}
        iconStyle={{
          background: "rgba(8, 145, 178, 0.08)",
          color: "#0891B2",
        }}
        trailing={<CreateActionButton ariaLabel="Create new demand plan" onCreate={handleCreate} />}
      />
    </PulseNode>
  );
}
