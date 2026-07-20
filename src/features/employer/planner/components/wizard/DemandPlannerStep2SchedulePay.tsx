// Job Mitra | DemandPlannerStep2SchedulePay.tsx | Step 2 — Schedule, Pay, Location, Matrix

import { PlannerBlindDemandCard } from "../PlannerBlindDemandCard";
import { validateDemandPlannerDaySlots } from "../../helpers/employerDemandPlanner.helpers";
import type { DaySlot } from "../../storage/demandPlannerStorage";
import { DemandPlannerStep2Calendar } from "./DemandPlannerStep2Calendar";
import { DemandPlannerStep2 } from "./DemandPlannerStep2";
import type { Step1Data } from "./DemandPlannerStep1.types";

type Props = {
  step1: Step1Data;
  onStep1Change: (d: Step1Data) => void;
  slots: DaySlot[];
  onSlotsChange: (slots: DaySlot[]) => void;
  onNext: () => void;
  onBack: () => void;
  errors: string[];
};

export function DemandPlannerStep2SchedulePay({
  step1,
  onStep1Change,
  slots,
  onSlotsChange,
  onNext,
  onBack,
  errors,
}: Props) {
  function setStep1<K extends keyof Step1Data>(key: K, val: Step1Data[K]) {
    onStep1Change({ ...step1, [key]: val });
  }

  const slotErrors = slots.length > 0 ? validateDemandPlannerDaySlots(slots) : [];
  const canAdvance = slotErrors.length === 0;

  return (
    <div>
      <div className="wm-planner-stepTitle">Step 2 of 3 — Schedule &amp; Pay</div>

      <DemandPlannerStep2Calendar
        data={step1}
        onChange={onStep1Change}
        onNext={() => undefined}
        onBack={() => undefined}
        errors={[]}
        hideActions
      />

      <PlannerBlindDemandCard dateKey={step1.startDate} />

      <div className="wm-field" style={{ marginTop: 12 }}>
        <div className="wm-label">Shift Timing (optional)</div>
        <input
          className="wm-input"
          value={step1.shiftTiming}
          onChange={(e) => setStep1("shiftTiming", e.target.value)}
          placeholder="e.g. 9 AM – 6 PM"
          maxLength={80}
        />
      </div>

      <div className="wm-field" style={{ marginTop: 10 }}>
        <div className="wm-label">Work Location *</div>
        <input
          className="wm-input"
          value={step1.locationName}
          onChange={(e) => setStep1("locationName", e.target.value)}
          placeholder="City / area / address"
          maxLength={120}
        />
      </div>

      <div className="wm-field" style={{ marginTop: 10 }}>
        <div className="wm-label">Map link (optional)</div>
        <input
          className="wm-input"
          value={step1.mapsLink}
          onChange={(e) => setStep1("mapsLink", e.target.value)}
          placeholder="Google Maps URL"
          maxLength={200}
        />
      </div>

      {slots.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <DemandPlannerStep2
            slots={slots}
            defaultPay={0}
            onSlotsChange={onSlotsChange}
            onNext={() => undefined}
            onBack={() => undefined}
            hideActions
            hideTitle
          />
        </div>
      )}

      {errors.length > 0 && (
        <div className="wm-planner-errorBox">
          {errors.map((e) => (
            <div key={e}>— {e}</div>
          ))}
        </div>
      )}

      <div className="wm-planner-stepActions wm-planner-stepActions--split">
        <button type="button" className="wm-planner-btnGhost" onClick={onBack}>
          ← Back
        </button>
        <button
          type="button"
          className="wm-planner-btnPrimary"
          onClick={onNext}
          disabled={slots.length > 0 && !canAdvance}
        >
          Next: Review &amp; Publish →
        </button>
      </div>
    </div>
  );
}
