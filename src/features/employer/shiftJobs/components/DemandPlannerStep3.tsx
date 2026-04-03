// src/features/employer/shiftJobs/components/DemandPlannerStep3.tsx
//
// Demand Planner — Step 3: Review + Submit.
// Shows full summary. Submit → auto-creates one shift post per day.

import type { DaySlot } from "../storage/demandPlannerStorage";
import { fmtPlanDate } from "../storage/demandPlannerStorage";
import type { Step1Data } from "./DemandPlannerStep1";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  step1: Step1Data;
  slots: DaySlot[];
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function DemandPlannerStep3({ step1, slots, isSubmitting, onSubmit, onBack }: Props) {
  const totalDays     = slots.length;
  const totalWorkers  = slots.reduce((s, d) => s + d.workers, 0);
  const totalCost     = slots.reduce((s, d) => s + d.workers * d.payPerDay, 0);
  const avgPay        = totalWorkers > 0 ? Math.round(totalCost / totalWorkers) : 0;

  const uniquePays = [...new Set(slots.map((s) => s.payPerDay))];
  const payLabel   = uniquePays.length === 1 ? `${uniquePays[0]}/day` : `${Math.min(...uniquePays)}–${Math.max(...uniquePays)}/day`;

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-accent-shift)", marginBottom: 4 }}>
        Step 3 of 3 &mdash; Review &amp; Submit
      </div>
      <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 16 }}>
        Review your plan before submitting. Each day will become a separate shift post.
      </div>

      {/* Plan summary card */}
      <div style={{
        padding: "14px 16px", borderRadius: 14,
        background: "rgba(22,163,74,0.04)", border: "1px solid rgba(22,163,74,0.2)",
        marginBottom: 14,
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--wm-er-accent-shift)", marginBottom: 8 }}>
          {step1.name}
        </div>
        <div style={{ display: "grid", gap: 4, fontSize: 12, color: "var(--wm-er-text)" }}>
          <div><span style={{ color: "var(--wm-er-muted)" }}>Company:</span> {step1.companyName || "—"}</div>
          <div><span style={{ color: "var(--wm-er-muted)" }}>Location:</span> {step1.locationName}</div>
          <div><span style={{ color: "var(--wm-er-muted)" }}>Category:</span> {step1.category}</div>
          <div><span style={{ color: "var(--wm-er-muted)" }}>Dates:</span> {fmtPlanDate(step1.startDate)} &rarr; {fmtPlanDate(step1.endDate)}</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[
          { label: "Shift days",      value: String(totalDays),              color: "var(--wm-er-accent-shift)" },
          { label: "Total workers",   value: String(totalWorkers),            color: "var(--wm-er-text)" },
          { label: "Est. total cost", value: totalCost.toLocaleString(),      color: "var(--wm-er-text)" },
        ].map((s) => (
          <div key={s.label} style={{
            padding: "10px 8px", borderRadius: 12, textAlign: "center",
            background: "var(--wm-er-surface)", border: "1px solid var(--wm-er-border)",
          }}>
            <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 14, fontSize: 12, color: "var(--wm-er-muted)" }}>
        Pay range: <b style={{ color: "var(--wm-er-text)" }}>{payLabel}</b>
        {avgPay > 0 && totalCost > 0 && ` &middot; Avg: ${avgPay}/day per worker`}
      </div>

      {/* Day-by-day summary */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 8 }}>
          Day-by-day breakdown
        </div>
        <div style={{ display: "grid", gap: 6, maxHeight: 260, overflowY: "auto" }}>
          {slots.map((slot, idx) => (
            <div key={slot.date} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 12px", borderRadius: 10,
              background: "var(--wm-er-bg)", border: "1px solid var(--wm-er-border)",
            }}>
              <div>
                <span style={{ fontSize: 10, color: "var(--wm-er-muted)", fontWeight: 600 }}>Day {idx + 1} &middot; </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>{fmtPlanDate(slot.date)}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>
                <b style={{ color: "var(--wm-er-text)" }}>{slot.workers}</b> workers &middot; <b style={{ color: "var(--wm-er-text)" }}>{slot.payPerDay}</b>/day
                <span style={{ marginLeft: 8, color: "var(--wm-er-accent-shift)", fontWeight: 700 }}>
                  = {(slot.workers * slot.payPerDay).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What happens on submit */}
      <div style={{
        padding: "12px 14px", borderRadius: 12,
        background: "var(--wm-er-surface)", border: "1px solid var(--wm-er-border)",
        fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.7,
        marginBottom: 16,
      }}>
        <div style={{ fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 4 }}>What happens when you submit:</div>
        <div>&#10003; {totalDays} shift {totalDays === 1 ? "post is" : "posts are"} created automatically</div>
        <div>&#10003; Workers can see the full plan and apply for multiple days</div>
        <div>&#10003; Each day appears in My Posts for selection</div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
        <button type="button" onClick={onBack} disabled={isSubmitting}
          style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid var(--wm-er-border)", background: "none", color: "var(--wm-er-text)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          &larr; Back
        </button>
        <button type="button" onClick={onSubmit} disabled={isSubmitting}
          style={{
            padding: "10px 28px", borderRadius: 10, border: "none",
            background: isSubmitting ? "#d1d5db" : "var(--wm-er-accent-shift, #16a34a)",
            color: "#fff", fontSize: 14, fontWeight: 700,
            cursor: isSubmitting ? "not-allowed" : "pointer",
          }}>
          {isSubmitting ? "Creating shifts..." : `Submit &mdash; Create ${totalDays} Shifts`}
        </button>
      </div>
    </div>
  );
}