// App: Job Mitra / WorkMitra_Enterprise_v2
// File: ShiftCreateScheduleSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\ShiftCreateScheduleSection.tsx

import type { CSSProperties } from "react";
import {
  formatShiftPayDisplay,
  getShiftPayBasisLabel,
  SHIFT_PAY_BASIS_OPTIONS,
  toDateStr,
  todayStr,
  toEpoch,
  type ShiftPayBasisDraft,
} from "../helpers/shiftCreateHelpers";
import { SectionHead, IconSchedule } from "./ShiftCreateIcons";

type Props = {
  startAt: number;
  onStartAt: (v: number) => void;
  endAt: number;
  onEndAt: (v: number) => void;
  shiftTiming: string;
  onShiftTiming: (v: string) => void;
  payPerDayStr: string;
  onPayPerDay: (v: string) => void;
  payBasis: ShiftPayBasisDraft;
  onPayBasis: (v: ShiftPayBasisDraft) => void;
};

const CARD_STYLE: CSSProperties = {
  marginTop: 12,
  borderRadius: "var(--wm-radius-employee-card)",
  border: "1px solid rgba(226,232,240,0.95)",
  background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
  boxShadow: "0 10px 24px rgba(15,23,42,0.045)",
};

const GRID_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};

const PAY_HINT_STYLE: CSSProperties = {
  marginTop: 6,
  padding: "9px 12px",
  borderRadius: "var(--wm-radius-chip)",
  background: "rgba(22,163,74,0.06)",
  border: "1px solid rgba(22,163,74,0.16)",
  fontSize: 11,
  color: "var(--wm-er-muted)",
  lineHeight: 1.45,
};

export function ShiftCreateScheduleSection(props: Props) {
  const payPerDay = Number(props.payPerDayStr) || 0;
  const payInputDisabled = props.payBasis === "not_listed";
  const payDisplay = formatShiftPayDisplay(payPerDay, props.payBasis);

  return (
    <section className="wm-er-card" style={CARD_STYLE}>
      <SectionHead
        icon={<IconSchedule />}
        title="Schedule and Pay"
        sub="Set shift dates, timing, and pay"
      />

      <div style={GRID_STYLE}>
        <div className="wm-field">
          <div className="wm-label">
            Start Date <span style={{ color: "var(--wm-error)" }}>*</span>
          </div>
          <input
            className="wm-input"
            type="date"
            value={toDateStr(props.startAt)}
            min={todayStr()}
            onChange={(e) => props.onStartAt(toEpoch(e.target.value))}
          />
        </div>

        <div className="wm-field">
          <div className="wm-label">
            End Date <span style={{ color: "var(--wm-error)" }}>*</span>
          </div>
          <input
            className="wm-input"
            type="date"
            value={toDateStr(props.endAt)}
            min={toDateStr(props.startAt)}
            onChange={(e) => props.onEndAt(toEpoch(e.target.value))}
          />
        </div>
      </div>

      <div className="wm-field" style={{ marginTop: 12 }}>
        <div className="wm-label">Shift Timing</div>
        <input
          className="wm-input"
          value={props.shiftTiming}
          onChange={(e) => props.onShiftTiming(e.target.value)}
          placeholder="e.g. 8:00 AM - 5:00 PM"
          maxLength={50}
        />
      </div>

      <div className="wm-field" style={{ marginTop: 12 }}>
        <div className="wm-label">
          Pay Basis <span style={{ color: "var(--wm-error)" }}>*</span>
        </div>
        <select
          className="wm-input"
          value={props.payBasis}
          onChange={(e) => props.onPayBasis(e.target.value as ShiftPayBasisDraft)}
        >
          <option value="" disabled>
            Select pay basis
          </option>
          {SHIFT_PAY_BASIS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {props.payBasis && (
          <div
            style={{ marginTop: 5, fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.45 }}
          >
            {SHIFT_PAY_BASIS_OPTIONS.find((item) => item.value === props.payBasis)?.helper}
          </div>
        )}
      </div>

      <div className="wm-field" style={{ marginTop: 12 }}>
        <div className="wm-label">
          Pay Amount{" "}
          {props.payBasis !== "not_listed" && <span style={{ color: "var(--wm-error)" }}>*</span>}
        </div>
        <input
          className="wm-input"
          value={payInputDisabled ? "" : props.payPerDayStr}
          onChange={(e) => props.onPayPerDay(e.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          placeholder={
            payInputDisabled
              ? "Not required when pay is not listed"
              : "Amount without currency symbol"
          }
          maxLength={7}
          disabled={payInputDisabled}
        />

        <div style={PAY_HINT_STYLE}>
          Workers will see:{" "}
          <b style={{ color: "var(--wm-er-text)" }}>
            {props.payBasis ? payDisplay : getShiftPayBasisLabel(props.payBasis)}
          </b>
        </div>
      </div>
    </section>
  );
}
