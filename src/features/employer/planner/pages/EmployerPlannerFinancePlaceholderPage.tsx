// Job Mitra | EmployerPlannerFinancePlaceholderPage.tsx
// Track T1-1 — honest P3 gate + budget snapshot (no full ledger yet).

import { Link, useNavigate, useParams } from "react-router-dom";
import { useSyncExternalStore } from "react";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { formatPlannerPayTotal } from "../helpers/plannerPayDisplay.helpers";
import { demandPlannerStorage } from "../storage/demandPlannerStorage";

export function EmployerPlannerFinancePlaceholderPage() {
  const { planId = "" } = useParams();
  const nav = useNavigate();

  const plan = useSyncExternalStore(
    demandPlannerStorage.subscribe,
    () => (planId ? demandPlannerStorage.getById(planId) : null),
    () => (planId ? demandPlannerStorage.getById(planId) : null),
  );

  const estBudget = plan?.slots.reduce((sum, slot) => sum + slot.workers * slot.payPerDay, 0) ?? 0;
  const workerDays = plan?.slots.reduce((sum, slot) => sum + slot.workers, 0) ?? 0;
  const detailPath = ROUTE_PATHS.employerPlannerDetail.replace(":planId", planId || "_");

  return (
    <div
      className="wm-er-vPlanner wm-planner-page"
      data-testid="planner-employer-finance"
      data-plan-id={planId || undefined}
      data-plan-found={plan ? "1" : "0"}
    >
      <section className="wm-planner-card" data-testid="planner-employer-finance-hero">
        <div className="wm-planner-sectionLabel">Finance</div>
        <h1 className="wm-pageTitle" style={{ margin: "var(--wm-space-6) 0 0" }}>
          Finance &amp; Budget
        </h1>
        <p className="wm-pageSub" style={{ marginTop: "var(--wm-space-8)" }}>
          Planned cost snapshot for this project. Full ledger and payment processing will appear
          here after finance rollout.
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--wm-space-10)",
            marginTop: "var(--wm-space-14)",
          }}
        >
          <button
            type="button"
            className="wm-planner-btnPrimary"
            data-testid="planner-employer-finance-back"
            onClick={() => {
              if (planId) nav(detailPath);
              else nav(ROUTE_PATHS.employerPlannerPlans);
            }}
          >
            {planId ? "Back to Plan" : "Back to Plans"}
          </button>
          <Link
            to={ROUTE_PATHS.employerPlannerPlans}
            className="wm-outlineBtn"
            data-testid="planner-employer-finance-plans"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "var(--wm-space-10) var(--wm-space-14)",
              borderRadius: "var(--wm-radius-10)",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            All plans
          </Link>
        </div>
      </section>

      {!planId || !plan ? (
        <section
          className="wm-planner-card wm-planner-empty"
          data-testid="planner-employer-finance-missing"
          style={{ marginTop: "var(--wm-space-12)" }}
        >
          <div className="wm-planner-empty__icon" aria-hidden="true">
            —
          </div>
          <div className="wm-planner-empty__copy">
            <div className="wm-planner-empty__title">Plan not found</div>
            <div className="wm-planner-empty__sub">
              Open finance from an existing plan detail page. No budget snapshot is shown without a
              valid plan.
            </div>
          </div>
          <Link
            to={ROUTE_PATHS.employerPlannerPlans}
            className="wm-planner-btnPrimary"
            data-testid="planner-employer-finance-missing-cta"
            style={{
              display: "inline-flex",
              textDecoration: "none",
              marginTop: "var(--wm-space-12)",
            }}
          >
            Go to Plans
          </Link>
        </section>
      ) : (
        <section
          className="wm-planner-card"
          data-testid="planner-employer-finance-snapshot"
          style={{ marginTop: "var(--wm-space-12)" }}
        >
          <div className="wm-planner-sectionLabel">Budget snapshot</div>
          <div className="wm-planner-sectionTitle" style={{ marginTop: "var(--wm-space-4)" }}>
            {plan.name}
          </div>
          <dl
            className="wm-planner-kpiStrip wm-planner-kpiStrip--agency wm-planner-kpiStrip--counts"
            data-testid="planner-employer-finance-kpis"
            style={{ marginTop: "var(--wm-space-12)" }}
          >
            <div className="wm-planner-kpiTile">
              <div className="wm-planner-kpiLabel">Worker-days</div>
              <div
                className="wm-planner-kpiValue"
                data-testid="planner-employer-finance-worker-days"
              >
                {workerDays}
              </div>
            </div>
            <div className="wm-planner-kpiTile">
              <div className="wm-planner-kpiLabel">Estimated budget</div>
              <div
                className="wm-planner-kpiValue"
                data-testid="planner-employer-finance-est-budget"
              >
                {formatPlannerPayTotal(estBudget)}
              </div>
            </div>
            <div className="wm-planner-kpiTile">
              <div className="wm-planner-kpiLabel">Ledger status</div>
              <div
                className="wm-planner-kpiValue"
                data-testid="planner-employer-finance-ledger-gate"
              >
                Not available yet
              </div>
            </div>
          </dl>
          <p
            className="wm-pageSub"
            style={{ marginTop: "var(--wm-space-12)" }}
            data-testid="planner-employer-finance-gate-copy"
          >
            Payment tracking is shown here for planning only. No charges, payouts, or CSV ledger on
            this screen yet.
          </p>
        </section>
      )}
    </div>
  );
}
