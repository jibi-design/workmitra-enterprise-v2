// Demand Planner — Step 2: Fill Calendar — facade

import { useState } from "react";
import type { DaySlot } from "../../storage/demandPlannerStorage";
import { DemandPlannerSlotGrid, DemandPlannerTotals } from "./DemandPlannerStep2.parts";

type Props = {
  slots: DaySlot[];
  defaultPay: number;
  onSlotsChange: (slots: DaySlot[]) => void;
  onNext: () => void;
  onBack: () => void;
  hideActions?: boolean;
  hideTitle?: boolean;
};

export function DemandPlannerStep2({
  slots,
  defaultPay,
  onSlotsChange,
  onNext,
  onBack,
  hideActions = false,
  hideTitle = false,
}: Props) {
  const [copyApplied, setCopyApplied] = useState(false);

  const firstSlot = slots[0];
  const totalDays = slots.length;
  const totalWorkers = slots.reduce((s, d) => s + (d.workers || 0), 0);
  const estimatedCost = slots.reduce((s, d) => s + (d.workers || 0) * (d.payPerDay || 0), 0);
  const allFilled = slots.every((s) => s.workers > 0 && s.payPerDay > 0);

  function updateSlot(date: string, field: "workers" | "payPerDay", value: number) {
    onSlotsChange(slots.map((s) => (s.date === date ? { ...s, [field]: value } : s)));
  }

  function copyFirstToAll() {
    if (!firstSlot) return;
    onSlotsChange(
      slots.map((s) => ({
        ...s,
        workers: firstSlot.workers,
        payPerDay: firstSlot.payPerDay,
      })),
    );
    setCopyApplied(true);
    setTimeout(() => setCopyApplied(false), 2000);
  }

  function applyDefault() {
    onSlotsChange(
      slots.map((s) => ({
        ...s,
        payPerDay: s.payPerDay > 0 ? s.payPerDay : defaultPay,
        workers: s.workers > 0 ? s.workers : 1,
      })),
    );
  }

  return (
    <div>
      {!hideTitle && (
        <>
          <div className="wm-planner-stepTitle">Demand Matrix</div>
          <div style={{ fontSize: 12, color: "var(--wm-neutral-500)", marginBottom: 14 }}>
            {totalDays} working {totalDays === 1 ? "day" : "days"} — set workers and pay for each.
          </div>
        </>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {defaultPay > 0 && (
          <button
            type="button"
            onClick={applyDefault}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid var(--wm-er-border)",
              background: "var(--wm-er-surface)",
              color: "var(--wm-er-text)",
              cursor: "pointer",
            }}
          >
            &#9889; Fill defaults (1 worker, {defaultPay}/day)
          </button>
        )}
        {firstSlot && firstSlot.workers > 0 && (
          <button
            type="button"
            onClick={copyFirstToAll}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid var(--wm-er-border)",
              background: copyApplied ? "var(--wm-planner-accent-soft)" : "var(--wm-er-surface)",
              color: copyApplied ? "var(--wm-planner-accent-strong)" : "var(--wm-er-text)",
              cursor: "pointer",
            }}
          >
            {copyApplied ? "&#10003; Applied!" : "Copy first day to all"}
          </button>
        )}
      </div>

      <DemandPlannerSlotGrid slots={slots} onUpdateSlot={updateSlot} />
      <DemandPlannerTotals totalWorkers={totalWorkers} estimatedCost={estimatedCost} />

      {!hideActions && (
        <div className="wm-planner-stepActions wm-planner-stepActions--split">
          <button type="button" className="wm-planner-btnGhost" onClick={onBack}>
            ← Back
          </button>
          <button
            type="button"
            className="wm-planner-btnPrimary"
            onClick={onNext}
            disabled={!allFilled}
          >
            Next: Review →
          </button>
        </div>
      )}

      {!hideActions && !allFilled && (
        <div
          style={{ marginTop: 8, fontSize: 11, color: "var(--wm-er-muted)", textAlign: "right" }}
        >
          Fill workers and pay for all days to continue.
        </div>
      )}

      {hideTitle && slots.length > 0 && !allFilled && (
        <div
          style={{
            marginTop: 8,
            fontSize: 11,
            color: "var(--wm-planner-accent-strong)",
            fontWeight: 700,
          }}
        >
          Set pay per day for every planned day before continuing.
        </div>
      )}
    </div>
  );
}
