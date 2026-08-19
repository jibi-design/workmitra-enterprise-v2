/**
 * Weekly Shift Planner — 7-day rolling window (baseline + instance overrides).
 */

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Lock, Shuffle } from "lucide-react";
import { useAuthStore } from "../../../shared/store/authStore";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { useShiftPlannerStore } from "../storage/shiftSwap.storage";
import {
  buildDemoWeekShifts,
  buildRollingSevenDays,
  collectApprovedOverrides,
  isShiftLockedForSwap,
  toIsoDate,
  type PlannerDayShift,
} from "../helpers/shiftPlanner.helpers";

type Props = {
  readonly audience: "employee" | "employer";
};

function swapsPath(audience: "employee" | "employer"): string {
  return audience === "employee"
    ? ROUTE_PATHS.employeeShiftPlannerSwaps
    : ROUTE_PATHS.employerShiftPlannerSwaps;
}

export function WeeklyShiftPlanner({ audience }: Props) {
  const nav = useNavigate();
  const user = useAuthStore((s) => s.user);
  const swapRequests = useShiftPlannerStore((s) => s.swapRequests);
  const [selected, setSelected] = useState<PlannerDayShift | null>(null);

  const days = useMemo(() => buildRollingSevenDays(), []);
  const shifts = useMemo(() => {
    // Demo roster is DEV-only — production shows an empty week until live SoT lands.
    if (!import.meta.env.DEV) return [] as PlannerDayShift[];
    const overrides = collectApprovedOverrides(swapRequests);
    return buildDemoWeekShifts(days, overrides);
  }, [days, swapRequests]);

  const byDate = useMemo(() => {
    const map = new Map<string, PlannerDayShift[]>();
    for (const s of shifts) {
      const list = map.get(s.date) ?? [];
      list.push(s);
      map.set(s.date, list);
    }
    return map;
  }, [shifts]);

  return (
    <div className="wm-dashPage wm-spPage" data-testid="weekly-shift-planner">
      <header className="wm-dashHero">
        <button
          type="button"
          className="wm-dashHero__back"
          onClick={() =>
            nav(audience === "employee" ? ROUTE_PATHS.employeeHome : ROUTE_PATHS.employerHome)
          }
        >
          ← Home
        </button>
        <div className="wm-dashHero__kicker">
          <CalendarDays size={12} aria-hidden="true" /> Weekly Shift Planner
        </div>
        <h1 className="wm-dashHero__title">7-day rolling plan</h1>
        <p className="wm-dashHero__sub">
          {[user?.fullName?.trim(), "Instance swaps only — baseline schedule unchanged"]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {!import.meta.env.DEV && shifts.length === 0 ? (
          <p className="wm-dashWidget__sub" style={{ marginTop: 8 }}>
            Live roster sync is not connected yet. Your week will appear here when available.
          </p>
        ) : null}
        <button
          type="button"
          className="wm-outlineBtn"
          style={{ marginTop: 10 }}
          onClick={() => nav(swapsPath(audience))}
        >
          <Shuffle size={14} aria-hidden="true" /> Open swaps
        </button>
      </header>

      <div className="wm-spWeekGrid">
        {days.map((day) => {
          const date = toIsoDate(day);
          const dayShifts = byDate.get(date) ?? [];
          return (
            <section key={date} className="wm-dashWidget wm-spDayCard">
              <div className="wm-dashWidget__kicker">
                {day.toLocaleDateString(undefined, { weekday: "short" })}
              </div>
              <h2 className="wm-dashWidget__title" style={{ fontSize: 16 }}>
                {day.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </h2>
              {dayShifts.length === 0 ? (
                <div className="wm-spEmpty">No shifts</div>
              ) : (
                <ul className="wm-spShiftList">
                  {dayShifts.map((shift) => {
                    const locked = isShiftLockedForSwap(shift.startAt);
                    return (
                      <li key={shift.instanceId}>
                        <button
                          type="button"
                          className={`wm-spShiftChip${shift.isOverride ? " isOverride" : ""}${locked ? " isLocked" : ""}`}
                          onClick={() => setSelected(shift)}
                        >
                          <div className="wm-spShiftChip__title">
                            {shift.assigneeName}
                            {shift.isOverride ? " · override" : ""}
                          </div>
                          <div className="wm-spShiftChip__meta">
                            {new Date(shift.startAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {" – "}
                            {new Date(shift.endAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {" · "}
                            {shift.roleTag}
                            {locked ? (
                              <>
                                {" "}
                                <Lock size={12} aria-label="Swap locked" />
                              </>
                            ) : null}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      {selected ? (
        <div className="wm-dashWidget" data-testid="weekly-shift-detail">
          <div className="wm-dashWidget__kicker">Selected instance</div>
          <h2 className="wm-dashWidget__title">{selected.assigneeName}</h2>
          <p className="wm-dashWidget__sub">
            {selected.date} · {selected.roleTag} · {selected.siteId}
            {selected.isOverride ? " · one-time override" : " · baseline"}
          </p>
          {audience === "employee" && !isShiftLockedForSwap(selected.startAt) ? (
            <button
              type="button"
              className="wm-primarybtn"
              style={{ marginTop: 10 }}
              onClick={() =>
                nav(`${ROUTE_PATHS.employeeShiftPlannerSwaps}?instanceId=${selected.instanceId}`)
              }
            >
              Request swap
            </button>
          ) : null}
          {isShiftLockedForSwap(selected.startAt) ? (
            <div className="wm-spEmpty" style={{ marginTop: 10 }}>
              Swap locked — less than 24 hours until start.
            </div>
          ) : null}
          <button
            type="button"
            className="wm-outlineBtn"
            style={{ marginTop: 8 }}
            onClick={() => setSelected(null)}
          >
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function EmployeeWeeklyShiftPlannerPage() {
  return <WeeklyShiftPlanner audience="employee" />;
}

export function EmployerWeeklyShiftPlannerPage() {
  return <WeeklyShiftPlanner audience="employer" />;
}

export default WeeklyShiftPlanner;
