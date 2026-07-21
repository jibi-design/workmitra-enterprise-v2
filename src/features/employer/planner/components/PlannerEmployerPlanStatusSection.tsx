// Job Mitra | PlannerEmployerPlanStatusSection.tsx | Plan list bucket — always visible

import type { DemandPlan, DemandPlanStatus } from "../storage/demandPlannerStorage";

type Props = {
  status: DemandPlanStatus;
  plans: DemandPlan[];
  onOpenPlan: (plan: DemandPlan) => void;
  onCreate?: () => void;
};

const EMPTY_COPY: Record<DemandPlanStatus, string> = {
  draft: "No drafts — start New Plan anytime.",
  active: "No active projects — publish a plan to begin hiring.",
  completed: "No completed plans yet.",
  cancelled: "No cancelled plans.",
};

export function PlannerEmployerPlanStatusSection({ status, plans, onOpenPlan, onCreate }: Props) {
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
        <div className="wm-planner-empty">
          <div className="wm-planner-empty__icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="4"
                width="18"
                height="18"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M16 2v4M8 2v4M3 10h18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="wm-planner-empty__title">
            {status === "active" || status === "draft" ? "No plans yet" : EMPTY_COPY[status]}
          </div>
          <div className="wm-planner-empty__sub">{EMPTY_COPY[status]}</div>
          {(status === "draft" || status === "active") && onCreate ? (
            <button
              type="button"
              className="wm-planner-btnPrimary"
              style={{ marginTop: 14 }}
              onClick={onCreate}
            >
              Create your first demand plan
            </button>
          ) : null}
        </div>
      ) : (
        plans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            className="wm-planner-btnGhost wm-planner-planRow"
            style={{ width: "100%", marginBottom: 8, justifyContent: "space-between" }}
            onClick={() => onOpenPlan(plan)}
          >
            <span style={{ textAlign: "left" }}>
              <span style={{ display: "block", fontSize: 15, fontWeight: 700 }}>
                {plan.name || "Untitled plan"}
              </span>
              <span
                style={{
                  display: "block",
                  marginTop: 2,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--wm-neutral-500)",
                }}
              >
                {plan.slots.length > 0
                  ? `${plan.slots[0]?.date ?? ""} → ${plan.slots[plan.slots.length - 1]?.date ?? ""}`
                  : "No dates yet"}
              </span>
            </span>
            <span className="wm-planner-badge">{plan.slots.length} slots</span>
          </button>
        ))
      )}
    </div>
  );
}
