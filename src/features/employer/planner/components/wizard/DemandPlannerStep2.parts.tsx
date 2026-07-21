import type { DaySlot } from "../../storage/demandPlannerStorage";
import { fmtPlanDate } from "../../storage/demandPlannerStorage";

type DemandPlannerSlotGridProps = {
  slots: DaySlot[];
  onUpdateSlot: (date: string, field: "workers" | "payPerDay", value: number) => void;
};

export function DemandPlannerSlotGrid({ slots, onUpdateSlot }: DemandPlannerSlotGridProps) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {slots.map((slot, idx) => (
        <div
          key={slot.date}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: `1px solid ${slot.workers > 0 && slot.payPerDay > 0 ? "rgba(22,163,74,0.2)" : "var(--wm-er-border)"}`,
            background:
              slot.workers > 0 && slot.payPerDay > 0 ? "rgba(22,163,74,0.03)" : "var(--wm-er-bg)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)", minWidth: 120 }}
            >
              <span style={{ fontSize: 10, color: "var(--wm-er-muted)", fontWeight: 600 }}>
                Day {idx + 1}
              </span>
              <br />
              {fmtPlanDate(slot.date)}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--wm-er-muted)",
                  whiteSpace: "nowrap",
                }}
              >
                Workers
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={slot.workers || ""}
                onChange={(e) =>
                  onUpdateSlot(slot.date, "workers", Math.max(0, parseInt(e.target.value) || 0))
                }
                style={{
                  width: 64,
                  padding: "6px 8px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  border: "1.5px solid var(--wm-er-border)",
                  background: "var(--wm-er-bg)",
                  color: "var(--wm-er-text)",
                  textAlign: "center",
                }}
                placeholder="0"
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--wm-er-muted)",
                  whiteSpace: "nowrap",
                }}
              >
                Pay/day
              </label>
              <input
                type="number"
                min={0}
                value={slot.payPerDay || ""}
                onChange={(e) =>
                  onUpdateSlot(slot.date, "payPerDay", Math.max(0, parseInt(e.target.value) || 0))
                }
                style={{
                  width: 90,
                  padding: "6px 8px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  border: "1.5px solid var(--wm-er-border)",
                  background: "var(--wm-er-bg)",
                  color: "var(--wm-er-text)",
                  textAlign: "center",
                }}
                placeholder="0"
              />
            </div>

            {slot.workers > 0 && slot.payPerDay > 0 && (
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--wm-er-accent-shift)",
                  whiteSpace: "nowrap",
                }}
              >
                = {(slot.workers * slot.payPerDay).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

type DemandPlannerTotalsProps = {
  totalWorkers: number;
  estimatedCost: number;
};

export function DemandPlannerTotals({ totalWorkers, estimatedCost }: DemandPlannerTotalsProps) {
  if (totalWorkers <= 0) return null;

  return (
    <div
      style={{
        marginTop: 14,
        padding: "12px 14px",
        borderRadius: 12,
        background: "var(--wm-er-surface)",
        border: "1px solid var(--wm-er-border)",
        display: "flex",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div>
        <div style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>Total worker-days</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--wm-er-accent-shift)" }}>
          {totalWorkers}
        </div>
      </div>
      {estimatedCost > 0 && (
        <div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>Estimated total cost</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--wm-er-text)" }}>
            {estimatedCost.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
