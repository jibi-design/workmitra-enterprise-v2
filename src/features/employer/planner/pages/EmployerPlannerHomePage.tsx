// Job Mitra | EmployerPlannerHomePage.tsx

import { useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { demandPlannerStorage } from "../storage/demandPlannerStorage";
import { employerShiftStorage } from "../../shiftJobs/storage/employerShift.storage";
import { formatPlannerPayTotal } from "../helpers/plannerPayDisplay.helpers";
import { PlannerEmployerCommandGrid } from "../components/PlannerEmployerCommandGrid";
import { PlannerEmployerPlanStatusSection } from "../components/PlannerEmployerPlanStatusSection";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { PlannerShell } from "../../../../app/shells/PlannerShell";

function getPlansSnapshot() {
  return demandPlannerStorage.getAll();
}

export function EmployerPlannerHomePage() {
  const nav = useNavigate();
  const plans = useSyncExternalStore(
    demandPlannerStorage.subscribe,
    getPlansSnapshot,
    getPlansSnapshot,
  );

  const metrics = useMemo(() => {
    const active = plans.filter((p) => p.status === "active");
    let plannedDays = 0;
    let workersNeeded = 0;
    let estBudget = 0;
    let confirmed = 0;
    let needed = 0;

    for (const plan of active) {
      plannedDays += plan.slots.length;
      for (const slot of plan.slots) {
        workersNeeded += slot.workers;
        estBudget += slot.workers * slot.payPerDay;
        if (!slot.postId) continue;
        const post = employerShiftStorage.getPosts().find((p) => p.id === slot.postId);
        if (!post) continue;
        needed += post.vacancies;
        confirmed += post.confirmedIds.length;
      }
    }

    const fillPct = needed > 0 ? Math.round((confirmed / needed) * 100) : 0;

    return {
      activeCount: active.length,
      plannedDays,
      workersNeeded,
      estBudget,
      fillPct,
      drafts: plans.filter((p) => p.status === "draft"),
      active,
      completed: plans.filter((p) => p.status === "completed"),
      cancelled: plans.filter((p) => p.status === "cancelled"),
    };
  }, [plans]);

  function openPlan(plan: (typeof plans)[number]) {
    if (plan.status === "draft") {
      nav(`${ROUTE_PATHS.employerPlannerNew}?planId=${plan.id}&step=${plan.draftStep ?? 1}`);
      return;
    }
    nav(ROUTE_PATHS.employerPlannerDetail.replace(":planId", plan.id));
  }

  return (
    <PlannerShell audience="employer">
      <DomainHero
        variant="planner"
        audience="employer"
        title="Gig Projects"
        subtitle="Agency command home — plan, publish, and fill multi-day crews"
      >
        <div className="wm-planner-kpiStrip" style={{ marginTop: 0 }}>
          <div className="wm-planner-kpiTile">
            <div className="wm-planner-kpiLabel">Active plans</div>
            <div className="wm-planner-kpiValue">{metrics.activeCount}</div>
          </div>
          <div className="wm-planner-kpiTile">
            <div className="wm-planner-kpiLabel">Planned days</div>
            <div className="wm-planner-kpiValue">{metrics.plannedDays}</div>
          </div>
          <div className="wm-planner-kpiTile">
            <div className="wm-planner-kpiLabel">Workers needed</div>
            <div className="wm-planner-kpiValue">{metrics.workersNeeded}</div>
          </div>
          <div className="wm-planner-kpiTile">
            <div className="wm-planner-kpiLabel">Est. budget</div>
            <div className="wm-planner-kpiValue">{formatPlannerPayTotal(metrics.estBudget)}</div>
          </div>
          <div className="wm-planner-kpiTile">
            <div className="wm-planner-kpiLabel">Fill %</div>
            <div className="wm-planner-kpiValue">{metrics.fillPct}%</div>
          </div>
        </div>
      </DomainHero>

      <PlannerEmployerCommandGrid />

      <PlannerEmployerPlanStatusSection
        status="draft"
        plans={metrics.drafts}
        onOpenPlan={openPlan}
      />
      <PlannerEmployerPlanStatusSection
        status="active"
        plans={metrics.active}
        onOpenPlan={openPlan}
      />
      <PlannerEmployerPlanStatusSection
        status="completed"
        plans={metrics.completed}
        onOpenPlan={openPlan}
      />
      <PlannerEmployerPlanStatusSection
        status="cancelled"
        plans={metrics.cancelled}
        onOpenPlan={openPlan}
      />
    </PlannerShell>
  );
}
