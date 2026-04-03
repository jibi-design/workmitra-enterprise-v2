// src/features/employer/shiftJobs/components/DemandPlannerStep2.tsx
//
// Demand Planner — Step 2: Fill Calendar.
// Each day: workers count + pay per day.
// Quick: "Copy to all" shortcut from first day.

import { useState } from "react";
import type { DaySlot } from "../storage/demandPlannerStorage";
import { fmtPlanDate } from "../storage/demandPlannerStorage";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  slots: DaySlot[];
  defaultPay: number;
  onSlotsChange: (slots: DaySlot[]) => void;
  onNext: () => void;
  onBack: () => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function DemandPlannerStep2({ slots, defaultPay, onSlotsChange, onNext, onBack }: Props) {
  const [copyApplied, setCopyApplied] = useState(false);

  const firstSlot  = slots[0];
  const totalDays  = slots.length;
  const totalWorkers = slots.reduce((s, d) => s + (d.workers || 0), 0);
  const estimatedCost = slots.reduce((s, d) => s + (d.workers || 0) * (d.payPerDay || 0), 0);

  const allFilled = slots.every((s) => s.workers > 0 && s.payPerDay > 0);

  function updateSlot(date: string, field: "workers" | "payPerDay", value: number) {
    onSlotsChange(slots.map((s) => s.date === date ? { ...s, [field]: value } : s));
  }

  function copyFirstToAll() {
    if (!firstSlot) return;
    onSlotsChange(slots.map((s) => ({
      ...s,
      workers:    firstSlot.workers,
      payPerDay:  firstSlot.payPerDay,
    })));
    setCopyApplied(true);
    setTimeout(() => setCopyApplied(false), 2000);
  }

  function applyDefault() {
    onSlotsChange(slots.map((s) => ({
      ...s,
      payPerDay: s.payPerDay > 0 ? s.payPerDay : defaultPay,
      workers:   s.workers   > 0 ? s.workers   : 1,
    })));
  }

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-accent-shift)", marginBottom: 4 }}>
        Step 2 of 3 &mdash; Fill Calendar
      </div>
      <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 14 }}>
        {totalDays} working {totalDays === 1 ? "day" : "days"} &mdash; set workers and pay for each.
      </div>

      {/* Quick fill */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {defaultPay > 0 && (
          <button type="button" onClick={applyDefault}
            style={{ fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 8, border: "1px solid var(--wm-er-border)", background: "var(--wm-er-surface)", color: "var(--wm-er-text)", cursor: "pointer" }}>
            &#9889; Fill defaults (1 worker, {defaultPay}/day)
          </button>
        )}
        {firstSlot && firstSlot.workers > 0 && (
          <button type="button" onClick={copyFirstToAll}
            style={{
              fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 8,
              border: "1px solid var(--wm-er-border)",
              background: copyApplied ? "rgba(22,163,74,0.08)" : "var(--wm-er-surface)",
              color: copyApplied ? "var(--wm-er-accent-shift)" : "var(--wm-er-text)",
              cursor: "pointer",
            }}>
            {copyApplied ? "&#10003; Applied!" : "Copy first day to all"}
          </button>
        )}
      </div>

      {/* Calendar slots */}
      <div style={{ display: "grid", gap: 8 }}>
        {slots.map((slot, idx) => (
          <div key={slot.date} style={{
            padding: "10px 12px", borderRadius: 12,
            border: `1px solid ${slot.workers > 0 && slot.payPerDay > 0 ? "rgba(22,163,74,0.2)" : "var(--wm-er-border)"}`,
            background: slot.workers > 0 && slot.payPerDay > 0 ? "rgba(22,163,74,0.03)" : "var(--wm-er-bg)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              {/* Date label */}
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)", minWidth: 120 }}>
                <span style={{ fontSize: 10, color: "var(--wm-er-muted)", fontWeight: 600 }}>Day {idx + 1}</span>
                <br />{fmtPlanDate(slot.date)}
              </div>

              {/* Workers */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--wm-er-muted)", whiteSpace: "nowrap" }}>
                  Workers
                </label>
                <input
                  type="number" min={1} max={500}
                  value={slot.workers || ""}
                  onChange={(e) => updateSlot(slot.date, "workers", Math.max(0, parseInt(e.target.value) || 0))}
                  style={{
                    width: 64, padding: "6px 8px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                    border: "1.5px solid var(--wm-er-border)", background: "var(--wm-er-bg)",
                    color: "var(--wm-er-text)", textAlign: "center",
                  }}
                  placeholder="0"
                />
              </div>

              {/* Pay */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--wm-er-muted)", whiteSpace: "nowrap" }}>
                  Pay/day
                </label>
                <input
                  type="number" min={0}
                  value={slot.payPerDay || ""}
                  onChange={(e) => updateSlot(slot.date, "payPerDay", Math.max(0, parseInt(e.target.value) || 0))}
                  style={{
                    width: 90, padding: "6px 8px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                    border: "1.5px solid var(--wm-er-border)", background: "var(--wm-er-bg)",
                    color: "var(--wm-er-text)", textAlign: "center",
                  }}
                  placeholder="0"
                />
              </div>

              {/* Day total */}
              {slot.workers > 0 && slot.payPerDay > 0 && (
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-accent-shift)", whiteSpace: "nowrap" }}>
                  = {(slot.workers * slot.payPerDay).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Running total */}
      {totalWorkers > 0 && (
        <div style={{
          marginTop: 14, padding: "12px 14px", borderRadius: 12,
          background: "var(--wm-er-surface)", border: "1px solid var(--wm-er-border)",
          display: "flex", gap: 16, flexWrap: "wrap",
        }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>Total worker-days</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--wm-er-accent-shift)" }}>{totalWorkers}</div>
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
      )}

      {/* Actions */}
      <div style={{ marginTop: 16, display: "flex", gap: 10, justifyContent: "space-between" }}>
        <button type="button" onClick={onBack}
          style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid var(--wm-er-border)", background: "none", color: "var(--wm-er-text)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          &larr; Back
        </button>
        <button type="button" onClick={onNext} disabled={!allFilled}
          style={{
            padding: "10px 24px", borderRadius: 10, border: "none",
            background: allFilled ? "var(--wm-er-accent-shift, #16a34a)" : "#d1d5db",
            color: "#fff", fontSize: 14, fontWeight: 700,
            cursor: allFilled ? "pointer" : "not-allowed",
          }}>
          Next: Review &rarr;
        </button>
      </div>

      {!allFilled && (
        <div style={{ marginTop: 8, fontSize: 11, color: "var(--wm-er-muted)", textAlign: "right" }}>
          Fill workers and pay for all days to continue.
        </div>
      )}
    </div>
  );
}