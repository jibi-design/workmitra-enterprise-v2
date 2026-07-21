// Job Mitra | PlannerPickChooseCalendar.tsx | Pick & Choose + odometer footer

import type { EmployeeAvailability } from "../types/employeeAvailability.types";
import type { SmartEarningsPredictorPayload } from "../types/employeeAvailability.types";
import { fmtPlanDate } from "../../../shared/planner/plannerPublic";
import { triggerSelectionHaptic } from "../../../../shared/platform/haptics";
import { formatPlannerPayAmount } from "../../../shared/planner/plannerPublic";
import { PlannerOdometerAmount } from "./PlannerOdometerAmount";

type Props = {
  availability: EmployeeAvailability;
  predictor: SmartEarningsPredictorPayload;
  onToggleDay: (dateKey: string) => void;
  onSelectAllOpen: () => void;
};

export function PlannerPickChooseCalendar({
  availability,
  predictor,
  onToggleDay,
  onSelectAllOpen,
}: Props) {
  const openCount = availability.summary.selectableDayCount;
  const fillPercent = Math.round(predictor.meter.fillRatio * 100);
  const selectedCount = predictor.meter.selectedDayCount;

  function handleToggle(dateKey: string, selectable: boolean) {
    if (!selectable) return;
    void triggerSelectionHaptic();
    onToggleDay(dateKey);
  }

  return (
    <div className="wm-planner-pickChoose">
      <div className="wm-planner-pickChooseToolbar">
        <div style={{ fontSize: 12, color: "var(--wm-neutral-500)" }}>
          Tap only the days you are available
        </div>
        {openCount > 1 ? (
          <button
            type="button"
            className="wm-planner-btnGhost wm-planner-pickChooseToolbarBtn"
            onClick={onSelectAllOpen}
          >
            Apply all open
          </button>
        ) : null}
      </div>

      <div className="wm-planner-calendarGrid">
        {availability.days.map((day) => {
          const isSelected = availability.selectedDateKeys.includes(day.dateKey);
          const disabled = !day.selectable;
          const conflict = day.status === "conflict";

          return (
            <button
              key={day.dateKey}
              type="button"
              className="wm-planner-calendarDay"
              data-selected={isSelected ? "true" : "false"}
              data-disabled={disabled ? "true" : "false"}
              data-conflict={conflict ? "true" : "false"}
              data-day-status={day.status}
              aria-pressed={isSelected}
              disabled={disabled}
              title={day.conflict?.conflictLabel ?? (conflict ? "⚠️ Conflict" : undefined)}
              onClick={() => handleToggle(day.dateKey, day.selectable)}
            >
              <div>{fmtPlanDate(day.dateKey).split(",")[0]}</div>
              {day.status === "full" && <div className="wm-planner-dayMeta">Full</div>}
              {day.status === "applied" && <div className="wm-planner-dayMeta">Applied</div>}
              {day.status === "confirmed" && <div className="wm-planner-dayMeta">Confirmed</div>}
              {conflict && (
                <div className="wm-planner-dayMeta wm-planner-dayMeta--conflict">⚠️ Conflict</div>
              )}
              {isSelected && day.payPerDay > 0 ? (
                <div className="wm-planner-dayMeta wm-planner-dayMeta--pay">
                  {formatPlannerPayAmount(day.payPerDay)}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="wm-planner-earningsCapsule" aria-live="polite" aria-atomic="true">
        <div className="wm-planner-earningsCapsuleRow">
          <span className="wm-planner-earningsCapsuleLabel">
            {selectedCount > 0
              ? `${selectedCount} day${selectedCount !== 1 ? "s" : ""} selected`
              : "Select days to see estimated earnings"}
          </span>
          {selectedCount > 0 ? (
            <PlannerOdometerAmount amount={predictor.meter.displayAmount} />
          ) : null}
        </div>
        <div
          className="wm-planner-earningsCapsuleBar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={fillPercent}
        >
          <div className="wm-planner-earningsCapsuleBarFill" style={{ width: `${fillPercent}%` }} />
        </div>
        {predictor.meter.sublabel ? (
          <div className="wm-planner-earningsCapsuleSub">{predictor.meter.sublabel}</div>
        ) : null}
        {predictor.commitmentStreak.eligible && predictor.commitmentStreak.teaserLabel ? (
          <div className="wm-planner-earningsCapsuleStreak">
            {predictor.commitmentStreak.teaserLabel}
          </div>
        ) : null}
        <div className="wm-planner-earningsCapsuleDisclaimer">{predictor.disclaimer}</div>
      </div>
    </div>
  );
}
