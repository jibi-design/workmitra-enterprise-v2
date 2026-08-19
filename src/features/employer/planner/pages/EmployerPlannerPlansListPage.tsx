// Job Mitra | EmployerPlannerPlansListPage.tsx
// All-plans index — same agency polish as Planner Home (no legacy hero / duplicate empty).

import { useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { EnterpriseSkeleton } from "../../../../shared/components/enterprise";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { PlannerShell } from "../../../../app/shells/PlannerShell";
import {
  demandPlannerStorage,
  type DemandPlan,
  type DemandPlanStatus,
} from "../storage/demandPlannerStorage";
import { PlannerEmployerPlanStatusSection } from "../components/PlannerEmployerPlanStatusSection";
import { usePlannerPlansHydrate } from "../hooks/usePlannerPlansHydrate";

const TABS: DemandPlanStatus[] = ["draft", "active", "completed", "cancelled"];

function getPlansSnapshot() {
  return demandPlannerStorage.getAll();
}

export function EmployerPlannerPlansListPage() {
  usePlannerPlansHydrate();
  const nav = useNavigate();
  const plans = useSyncExternalStore(
    demandPlannerStorage.subscribe,
    getPlansSnapshot,
    getPlansSnapshot,
  );
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const counts = useMemo(
    () => ({
      draft: plans.filter((p) => p.status === "draft").length,
      active: plans.filter((p) => p.status === "active").length,
      completed: plans.filter((p) => p.status === "completed").length,
      cancelled: plans.filter((p) => p.status === "cancelled").length,
    }),
    [plans],
  );

  function openPlan(plan: DemandPlan) {
    if (plan.status === "draft") {
      nav(`${ROUTE_PATHS.employerPlannerNew}?planId=${plan.id}&step=${plan.draftStep ?? 1}`);
      return;
    }
    nav(ROUTE_PATHS.employerPlannerDetail.replace(":planId", plan.id));
  }

  if (!hydrated) {
    return (
      <PlannerShell audience="employer">
        <EnterpriseSkeleton domain="planner" count={3} testId="planner-plans-skeleton" />
      </PlannerShell>
    );
  }

  return (
    <PlannerShell audience="employer">
      <DomainHero
        variant="planner"
        audience="employer"
        eyebrow="All plans"
        title="Demand Planner"
        subtitle="Drafts, live crews, completed & cancelled"
        className="wm-domainHero--agencyDense"
      >
        <div
          className="wm-planner-kpiStrip wm-planner-kpiStrip--agency wm-planner-kpiStrip--counts"
          data-testid="planner-plans-counts"
        >
          <div className="wm-planner-kpiTile">
            <div className="wm-planner-kpiLabel">Draft</div>
            <div className="wm-planner-kpiValue">{counts.draft}</div>
          </div>
          <div className="wm-planner-kpiTile">
            <div className="wm-planner-kpiLabel">Active</div>
            <div className="wm-planner-kpiValue">{counts.active}</div>
          </div>
          <div className="wm-planner-kpiTile">
            <div className="wm-planner-kpiLabel">Done</div>
            <div className="wm-planner-kpiValue">{counts.completed}</div>
          </div>
          <div className="wm-planner-kpiTile">
            <div className="wm-planner-kpiLabel">Cancelled</div>
            <div className="wm-planner-kpiValue">{counts.cancelled}</div>
          </div>
        </div>
      </DomainHero>

      {TABS.map((status) => (
        <PlannerEmployerPlanStatusSection
          key={status}
          status={status}
          plans={plans.filter((p) => p.status === status)}
          onOpenPlan={openPlan}
          onCreate={() => nav(ROUTE_PATHS.employerPlannerNew)}
        />
      ))}

      <button
        type="button"
        className="wm-planner-fab"
        aria-label="Create new plan"
        onClick={() => nav(ROUTE_PATHS.employerPlannerNew)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </PlannerShell>
  );
}
