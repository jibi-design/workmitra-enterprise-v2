// Job Mitra | EmployerPlannerPlansListPage.tsx
// Ultra-Enterprise U2/U4 — skeleton + EnterpriseEmpty buckets

import { useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { EnterpriseEmpty, EnterpriseSkeleton } from "../../../../shared/components/enterprise";
import {
  demandPlannerStorage,
  type DemandPlan,
  type DemandPlanStatus,
} from "../storage/demandPlannerStorage";
import { PlannerEmployerCommandGrid } from "../components/PlannerEmployerCommandGrid";
import { PlannerEmployerPlanStatusSection } from "../components/PlannerEmployerPlanStatusSection";

const TABS: DemandPlanStatus[] = ["active", "draft", "completed", "cancelled"];

function getPlansSnapshot() {
  return demandPlannerStorage.getAll();
}

export function EmployerPlannerPlansListPage() {
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

  function openPlan(plan: DemandPlan) {
    if (plan.status === "draft") {
      nav(`${ROUTE_PATHS.employerPlannerNew}?planId=${plan.id}&step=${plan.draftStep ?? 1}`);
      return;
    }
    nav(ROUTE_PATHS.employerPlannerDetail.replace(":planId", plan.id));
  }

  if (!hydrated) {
    return (
      <div className="wm-er-vPlanner wm-planner-page">
        <EnterpriseSkeleton domain="planner" count={3} testId="planner-plans-skeleton" />
      </div>
    );
  }

  const hasAnyPlan = plans.length > 0;

  return (
    <div className="wm-er-vPlanner wm-planner-page">
      <section className="wm-planner-hero">
        <div className="wm-planner-heroTitle">Demand Planner</div>
        <div className="wm-planner-heroSub">
          Every plan status is shown — empty buckets stay visible
        </div>
      </section>

      <PlannerEmployerCommandGrid />

      {!hasAnyPlan ? (
        <EnterpriseEmpty
          domain="planner"
          title="No demand plans yet"
          subtitle="Create a multi-day demand plan to publish day slots into Shift hiring."
          primaryLabel="Create demand plan"
          onPrimary={() => nav(ROUTE_PATHS.employerPlannerNew)}
          testId="planner-plans-empty"
        />
      ) : null}

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
    </div>
  );
}
