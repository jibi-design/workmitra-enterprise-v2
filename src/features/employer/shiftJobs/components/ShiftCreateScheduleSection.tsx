// src/features/employer/shiftJobs/components/ShiftCreateScheduleSection.tsx

import { toDateStr, todayStr, toEpoch } from "../helpers/shiftCreateHelpers";
import { SectionHead, IconSchedule } from "./ShiftCreateIcons";

type JobType = "one-time" | "weekly" | "custom";

type Props = {
  startAt: number;      onStartAt: (v: number) => void;
  endAt: number;        onEndAt: (v: number) => void;
  shiftTiming: string;  onShiftTiming: (v: string) => void;
  payPerDayStr: string; onPayPerDay: (v: string) => void;
  jobType: JobType;     onJobType: (v: JobType) => void;
};

const JOB_TYPES: { value: JobType; label: string; sub: string }[] = [
  { value: "one-time", label: "One-time",         sub: "Single shift or short run" },
  { value: "weekly",   label: "Weekly recurring", sub: "Repeats every week" },
  { value: "custom",   label: "Custom recurring", sub: "Specific days / pattern" },
];

export function ShiftCreateScheduleSection(props: Props) {
  const payPerDay = Number(props.payPerDayStr) || 0;

  return (
    <section className="wm-er-card" style={{ marginTop: 12 }}>
      <SectionHead icon={<IconSchedule />} title="Schedule and Pay" sub="When is the shift and how much does it pay" />

      {/* Dates */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div className="wm-field">
          <div className="wm-label">Start Date <span style={{ color: "var(--wm-error)" }}>*</span></div>
          <input className="wm-input" type="date"
            value={toDateStr(props.startAt)} min={todayStr()}
            onChange={(e) => props.onStartAt(toEpoch(e.target.value))} />
        </div>
        <div className="wm-field">
          <div className="wm-label">End Date <span style={{ color: "var(--wm-error)" }}>*</span></div>
          <input className="wm-input" type="date"
            value={toDateStr(props.endAt)} min={toDateStr(props.startAt)}
            onChange={(e) => props.onEndAt(toEpoch(e.target.value))} />
        </div>
      </div>

      {/* Job Type */}
      <div className="wm-field" style={{ marginTop: 12 }}>
        <div className="wm-label">Job Type</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {JOB_TYPES.map((jt) => {
            const isOn = props.jobType === jt.value;
            return (
              <button
                key={jt.value}
                type="button"
                onClick={() => props.onJobType(jt.value)}
                style={{
                  flex: "1 1 0", minWidth: 90,
                  padding: "8px 10px", borderRadius: 10, cursor: "pointer",
                  border: isOn
                    ? "1.5px solid var(--wm-er-accent-shift)"
                    : "1.5px solid var(--wm-er-border)",
                  background: isOn ? "rgba(22,163,74,0.08)" : "var(--wm-er-surface)",
                  textAlign: "left", transition: "all 0.15s",
                }}
                aria-pressed={isOn}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: isOn ? "var(--wm-er-accent-shift)" : "var(--wm-er-text)" }}>
                  {jt.label}
                </div>
                <div style={{ fontSize: 10, color: "var(--wm-er-muted)", marginTop: 2 }}>
                  {jt.sub}
                </div>
              </button>
            );
          })}
        </div>
        {props.jobType !== "one-time" && (
          <div style={{ marginTop: 6, fontSize: 11, color: "var(--wm-er-muted)", fontStyle: "italic" }}>
            {props.jobType === "weekly"
              ? "Workers will see this as a weekly recurring shift. Set the date range for the full period."
              : "Set the start and end date to cover the full custom period."}
          </div>
        )}
      </div>

      {/* Shift Timing */}
      <div className="wm-field" style={{ marginTop: 10 }}>
        <div className="wm-label">Shift Timing</div>
        <input className="wm-input" value={props.shiftTiming}
          onChange={(e) => props.onShiftTiming(e.target.value)}
          placeholder="e.g. 8:00 AM – 5:00 PM" maxLength={50} />
      </div>

      {/* Pay */}
      <div className="wm-field" style={{ marginTop: 10 }}>
        <div className="wm-label">Pay per day <span style={{ color: "var(--wm-error)" }}>*</span></div>
        <input className="wm-input" value={props.payPerDayStr}
          onChange={(e) => props.onPayPerDay(e.target.value.replace(/\D/g, ""))}
          inputMode="numeric" placeholder="Amount (no currency symbol)" maxLength={7} />
        <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-er-muted)" }}>
          Workers will see: Pay {payPerDay > 0 ? payPerDay : "___"} / day
        </div>
      </div>
    </section>
  );
}