// App name: Job Mitra
// Phase 1 / Level 3.1: 7-day rolling calendar — auto-save on tap, Mitra Green active state.

import { useState } from "react";
import type { CSSProperties } from "react";
import { triggerSelectionHaptic } from "../../../../shared/platform/haptics";
import { availabilityStorage, getRolling7Days } from "../storage/availabilityStorage";

const SHIFT_GREEN_BG = "var(--wm-shift-accent, #16a34a)";

type ShiftAvailabilityBroadcastCardProps = {
  selectedDates: string[];
  onToggleDay: (iso: string) => void;
};

export function ShiftAvailabilityBroadcastCard({
  selectedDates,
  onToggleDay,
}: ShiftAvailabilityBroadcastCardProps) {
  const rollingDays = getRolling7Days();
  const hasSelection = selectedDates.length > 0;
  const selectedLabel = availabilityStorage.formatSelectedDatesLabel(selectedDates);

  return (
    <div
      className="wm-shift-surface-glass wm-shift-surface-glass--shift wm-shiftAvailabilityCalendar"
      data-testid="shift-availability-broadcast-card"
    >
      <div className="wm-typeCardTitle">My availability — next 7 days</div>

      <p className="wm-typeHelperMd" style={{ marginTop: 4 }}>
        Tap the days you are free to work. Your selection saves automatically.
      </p>

      <div
        role="group"
        aria-label="7-day rolling availability calendar"
        className="wm-shiftAvailabilityCalendar__grid"
      >
        {rollingDays.map((day) => {
          const active = selectedDates.includes(day.iso);

          return (
            <DayCircle
              key={day.iso}
              weekday={day.weekday}
              dayNum={day.dayNum}
              active={active}
              onToggle={() => onToggleDay(day.iso)}
            />
          );
        })}
      </div>

      <p
        className={
          hasSelection
            ? "wm-shiftAvailabilityCalendar__summary isActive"
            : "wm-shiftAvailabilityCalendar__summary"
        }
      >
        {hasSelection
          ? `You are free on: ${selectedLabel}. We will notify you if a job matches your free days.`
          : "You are free on: (no days selected yet). We will notify you if a job matches your free days."}
      </p>
    </div>
  );
}

function DayCircle({
  weekday,
  dayNum,
  active,
  onToggle,
}: {
  weekday: string;
  dayNum: number;
  active: boolean;
  onToggle: () => void;
}) {
  const [popSaved, setPopSaved] = useState(false);

  const circleStyle: CSSProperties = active
    ? {
        background: SHIFT_GREEN_BG,
        color: "#ffffff",
        border: `2px solid ${SHIFT_GREEN_BG}`,
        boxShadow: "0 4px 14px rgba(22,163,74,0.35)",
      }
    : {
        background: "var(--wm-emp-glass-bg-strong)",
        color: "var(--wm-er-text)",
        border: "1.5px solid var(--wm-glass-border)",
        boxShadow: "var(--wm-emp-card-shadow)",
      };

  function handleToggle() {
    void triggerSelectionHaptic();
    setPopSaved(true);
    onToggle();
  }

  function handleAnimationEnd() {
    setPopSaved(false);
  }

  return (
    <button
      type="button"
      className={`wm-press-btn wm-shiftAvailabilityCalendar__day${popSaved ? " wm-popSaved" : ""}`}
      aria-pressed={active}
      aria-label={`${weekday} ${dayNum}${active ? ", selected" : ""}`}
      onClick={handleToggle}
      onAnimationEnd={handleAnimationEnd}
      style={circleStyle}
    >
      <span className="wm-shiftAvailabilityCalendar__weekday">{weekday}</span>
      <span className="wm-shiftAvailabilityCalendar__dayNum">{dayNum}</span>
    </button>
  );
}
