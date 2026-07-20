// Job Mitra | DemandPlannerStep4Budget.tsx | Wizard step 4 — Budget (skippable P1)

import type { DaySlot } from "../../storage/demandPlannerStorage";
import { formatPlannerPayTotal } from "../../helpers/plannerPayDisplay.helpers";

type Props = {
  slots: DaySlot[];
  onNext: () => void;
  onBack: () => void;
};

export function DemandPlannerStep4Budget({ slots, onNext, onBack }: Props) {
  const workerDays = slots.reduce((sum, s) => sum + (s.workers > 0 ? s.workers : 0), 0);
  const estimated = slots.reduce((sum, s) => sum + s.workers * s.payPerDay, 0);

  return (
    <div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "var(--wm-planner-accent-strong)",
          marginBottom: 8,
        }}
      >
        Step 4 of 5 — Budget (optional)
      </div>
      <p style={{ fontSize: 12, color: "var(--wm-neutral-500)", marginBottom: 14 }}>
        Full finance ledger arrives in a later update. Review your estimated plan budget below.
      </p>

      <div className="wm-planner-card" style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "var(--wm-neutral-500)" }}>Planned days</span>
          <span style={{ fontWeight: 800 }}>{slots.filter((s) => s.workers > 0).length}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "var(--wm-neutral-500)" }}>Total worker-days</span>
          <span style={{ fontWeight: 800 }}>{workerDays}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "var(--wm-neutral-500)" }}>Estimated budget</span>
          <span style={{ fontWeight: 800, color: "var(--wm-planner-accent-strong)" }}>
            {formatPlannerPayTotal(estimated)}
          </span>
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", gap: 10 }}>
        <button type="button" className="wm-planner-btnGhost" onClick={onBack}>
          ← Back
        </button>
        <button type="button" className="wm-planner-btnPrimary" onClick={onNext}>
          Next: Review & Publish →
        </button>
      </div>
    </div>
  );
}
