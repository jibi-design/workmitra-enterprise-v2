// Job Mitra | PlannerEmployerPlanStatusSection.tsx | Plan list bucket — always visible

import type { DemandPlan, DemandPlanStatus } from "../storage/demandPlannerStorage";

type Props = {
  status: DemandPlanStatus;
  plans: DemandPlan[];
  onOpenPlan: (plan: DemandPlan) => void;
};

const EMPTY_COPY: Record<DemandPlanStatus, string> = {
  draft: "No drafts — start New Plan anytime.",
  active: "No active projects — publish a plan to begin hiring.",
  completed: "No completed plans yet.",
  cancelled: "No cancelled plans.",
};

export function PlannerEmployerPlanStatusSection({ status, plans, onOpenPlan }: Props) {
  return (
    <div className="wm-planner-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 800, textTransform: "capitalize" }}>
          {status} plans
        </div>
        <span className="wm-planner-badge">{plans.length}</span>
      </div>

      {plans.length === 0 ? (
        <div style={{ fontSize: 12, color: "var(--wm-neutral-500)", lineHeight: 1.45 }}>
          {EMPTY_COPY[status]}
        </div>
      ) : (
        plans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            className="wm-planner-btnGhost"
            style={{ width: "100%", marginBottom: 8, justifyContent: "space-between" }}
            onClick={() => onOpenPlan(plan)}
          >
            <span>{plan.name || "Untitled plan"}</span>
            <span className="wm-planner-badge">{plan.slots.length} days</span>
          </button>
        ))
      )}
    </div>
  );
}
