// Job Mitra | EmployerShiftPlannerGroupPromoCard.tsx | Green promo on shift posts — no teal planner UI

import type { EmployerPlannerPostGroup } from "../../../shared/planner/ports/plannerShiftJobsBridge";

type Props = {
  group: EmployerPlannerPostGroup;
  onOpenPlan: (planId: string) => void;
};

export function EmployerShiftPlannerGroupPromoCard({ group, onOpenPlan }: Props) {
  return (
    <article
      style={{
        padding: "14px 16px",
        borderRadius: "var(--wm-radius-chip)",
        border: "1px solid rgba(39, 174, 96, 0.2)",
        background: "linear-gradient(180deg, rgba(240,253,244,0.88), rgba(255,255,255,0.98))",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 800, color: "#15803d" }}>
        📋 Multi-day project plan
      </div>
      <div style={{ fontSize: 15, fontWeight: 800, marginTop: 6 }}>{group.planName}</div>
      <div style={{ fontSize: 12, color: "var(--wm-neutral-500)", marginTop: 4 }}>
        {group.dayCount} days · managed in Gig Projects (teal domain)
      </div>
      <button
        type="button"
        className="wm-er-btnPrimary"
        style={{ marginTop: 12, width: "100%" }}
        onClick={() => onOpenPlan(group.planId)}
      >
        Open in Gig Projects →
      </button>
    </article>
  );
}
