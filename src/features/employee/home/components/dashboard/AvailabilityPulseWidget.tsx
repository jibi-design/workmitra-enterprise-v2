/** Wave 3 — Availability Pulse widget (My Dashboard). No diary coupling. */

import { useSyncExternalStore } from "react";
import {
  shiftAvailabilityDailyStorage,
  type DailyAvailabilityStatus,
} from "../../storage/shiftAvailabilityDaily.storage";

const STATUS_OPTIONS: readonly {
  readonly id: DailyAvailabilityStatus;
  readonly label: string;
  readonly hint: string;
}[] = [
  { id: "available", label: "Available", hint: "Open for shifts today" },
  { id: "shifted", label: "Shifted", hint: "Already on a shift" },
  { id: "off_duty", label: "Off-Duty", hint: "Not taking work today" },
];

function parseStatus(snapshot: string): DailyAvailabilityStatus | null {
  if (!snapshot) return null;
  try {
    const parsed = JSON.parse(snapshot) as { status?: unknown };
    if (
      parsed.status === "available" ||
      parsed.status === "shifted" ||
      parsed.status === "off_duty"
    ) {
      return parsed.status;
    }
    return null;
  } catch {
    return null;
  }
}

export function AvailabilityPulseWidget() {
  const snapshot = useSyncExternalStore(
    shiftAvailabilityDailyStorage.subscribe,
    shiftAvailabilityDailyStorage.getSnapshot,
    shiftAvailabilityDailyStorage.getSnapshot,
  );
  const active = parseStatus(snapshot);

  return (
    <section
      className="wm-dashWidget"
      data-testid="availability-pulse-widget"
      aria-label="Availability Pulse"
    >
      <div className="wm-dashWidget__head">
        <div className="wm-dashWidget__kicker">Daily status</div>
        <h2 className="wm-dashWidget__title">Availability Pulse</h2>
        <p className="wm-dashWidget__sub">
          One tap — persists for today only. Not your work diary.
        </p>
      </div>

      <div className="wm-dashPulseGrid" role="group" aria-label="Set availability for today">
        {STATUS_OPTIONS.map((option) => {
          const isActive = active === option.id;
          return (
            <button
              key={option.id}
              type="button"
              className={`wm-dashPulseBtn wm-dashPulseBtn--${option.id}${isActive ? " isActive" : ""}`}
              data-testid={`availability-pulse-${option.id}`}
              aria-pressed={isActive}
              onClick={() => {
                if (isActive) {
                  shiftAvailabilityDailyStorage.clearToday();
                  return;
                }
                shiftAvailabilityDailyStorage.setTodayStatus(option.id);
              }}
            >
              <span className="wm-dashPulseBtn__label">{option.label}</span>
              <span className="wm-dashPulseBtn__hint">{option.hint}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
