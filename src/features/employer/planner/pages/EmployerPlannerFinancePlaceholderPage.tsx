// Job Mitra | EmployerPlannerFinancePlaceholderPage.tsx

import { useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { demandPlannerStorage } from "../storage/demandPlannerStorage";
import { formatPlannerPayTotal } from "../helpers/plannerPayDisplay.helpers";

export function EmployerPlannerFinancePlaceholderPage() {
  const { planId = "" } = useParams();
  const nav = useNavigate();

  const plan = useSyncExternalStore(
    demandPlannerStorage.subscribe,
    () => demandPlannerStorage.getById(planId),
    () => demandPlannerStorage.getById(planId),
  );

  const estBudget = plan?.slots.reduce((sum, slot) => sum + slot.workers * slot.payPerDay, 0) ?? 0;
  const workerDays = plan?.slots.reduce((sum, slot) => sum + slot.workers, 0) ?? 0;

  return (
    <div className="wm-er-vPlanner wm-planner-page">
      <div className="wm-planner-card">
        <div className="wm-planner-heroTitle">Finance &amp; Budget</div>
        <p style={{ marginTop: 8, fontSize: 13, color: "var(--wm-neutral-500)", lineHeight: 1.5 }}>
          Track planned vs committed costs for this project. Full ledger arrives in the next Planner
          update (P3).
        </p>

        {plan ? (
          <div className="wm-planner-card" style={{ marginTop: 12, marginBottom: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8 }}>
              Visible budget snapshot (P1)
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-neutral-500)", display: "grid", gap: 6 }}>
              <div>
                Plan: <strong>{plan.name}</strong>
              </div>
              <div>
                Worker-days: <strong>{workerDays}</strong>
              </div>
              <div>
                Estimated budget:{" "}
                <strong style={{ color: "var(--wm-planner-accent-strong)" }}>
                  {formatPlannerPayTotal(estBudget)}
                </strong>
              </div>
            </div>
          </div>
        ) : null}

        <p style={{ marginTop: 12, fontSize: 12, color: "var(--wm-neutral-500)" }}>
          Payment tracking is shown here for planning. Payment processing will connect in a future
          release.
        </p>
        <button
          type="button"
          className="wm-planner-btnPrimary"
          style={{ marginTop: 14 }}
          onClick={() => nav(ROUTE_PATHS.employerPlannerDetail.replace(":planId", planId))}
        >
          Back to Plan
        </button>
      </div>
    </div>
  );
}
