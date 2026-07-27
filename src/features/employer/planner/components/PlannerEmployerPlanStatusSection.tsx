// Job Mitra | PlannerEmployerPlanStatusSection.tsx | Plan list bucket — always visible
// All empty statuses share the same compact chrome (Completed/Cancelled match Draft/Active).

import type { DemandPlan, DemandPlanStatus } from "../storage/demandPlannerStorage";

type Props = {
  status: DemandPlanStatus;
  plans: DemandPlan[];
  onOpenPlan: (plan: DemandPlan) => void;
  onCreate?: () => void;
};

const EMPTY_TITLE: Record<DemandPlanStatus, string> = {
  draft: "No drafts yet",
  active: "No active plans",
  completed: "No completed plans",
  cancelled: "No cancelled plans",
};

const EMPTY_COPY: Record<DemandPlanStatus, string> = {
  draft: "Start a New Plan anytime.",
  active: "Publish a plan to begin hiring.",
  completed: "Finished crews will land here.",
  cancelled: "Cancelled plans will land here.",
};

function StatusEmptyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function PlannerEmployerPlanStatusSection({ status, plans, onOpenPlan, onCreate }: Props) {
  const isEmpty = plans.length === 0;
  const showCreate = isEmpty && (status === "draft" || status === "active") && Boolean(onCreate);

  return (
    <div
      className={`wm-planner-card wm-planner-statusBucket${isEmpty ? " wm-planner-statusBucket--empty" : ""}`}
      data-testid={`planner-status-bucket-${status}`}
      data-empty={isEmpty ? "true" : "false"}
      data-status={status}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: isEmpty ? 6 : 10,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 800, textTransform: "capitalize" }}>
          {status} plans
        </div>
        <span className="wm-planner-badge">{plans.length}</span>
      </div>

      {isEmpty ? (
        <div className="wm-planner-empty wm-planner-empty--compact">
          <div className="wm-planner-empty__icon" aria-hidden="true">
            <StatusEmptyIcon />
          </div>
          <div className="wm-planner-empty__copy">
            <div className="wm-planner-empty__title">{EMPTY_TITLE[status]}</div>
            <div className="wm-planner-empty__sub">{EMPTY_COPY[status]}</div>
          </div>
          {showCreate && onCreate ? (
            <button type="button" className="wm-planner-btnPrimary" onClick={onCreate}>
              Create plan
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
