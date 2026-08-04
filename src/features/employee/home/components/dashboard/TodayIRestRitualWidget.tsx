/** Wave 3 — Today I Rest ritual (personal off-day). Outside Personal Work Diary. */

import { useSyncExternalStore } from "react";
import { employeeRestRitualStorage } from "../../storage/employeeRestRitual.storage";

export function TodayIRestRitualWidget() {
  const snapshot = useSyncExternalStore(
    employeeRestRitualStorage.subscribe,
    employeeRestRitualStorage.getSnapshot,
    employeeRestRitualStorage.getSnapshot,
  );
  const resting = snapshot.length > 0;

  return (
    <section
      className="wm-dashWidget"
      data-testid="today-i-rest-widget"
      aria-label="Today I Rest ritual"
    >
      <div className="wm-dashWidget__head">
        <div className="wm-dashWidget__kicker">Personal ritual</div>
        <h2 className="wm-dashWidget__title">Today I Rest</h2>
        <p className="wm-dashWidget__sub">
          Mark a rest day for yourself. Separate from employment diary punches.
        </p>
      </div>

      <button
        type="button"
        className={`wm-dashRestBtn${resting ? " isActive" : ""}`}
        data-testid="today-i-rest-toggle"
        aria-pressed={resting}
        onClick={() => {
          if (resting) {
            employeeRestRitualStorage.clearTodayRest();
            return;
          }
          employeeRestRitualStorage.markTodayRest();
        }}
      >
        {resting ? "Resting today — tap to clear" : "Mark today as rest"}
      </button>
    </section>
  );
}
