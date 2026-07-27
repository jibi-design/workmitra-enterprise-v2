// App name: Job Mitra
// File name: ShiftControlCenterStatsTiles.tsx
// Shift Jobs Home — KPI row aligned to Applications / Earnings primitives

import type { ShiftControlCenterCounts } from "../types/shiftControlCenter.types";

type ShiftControlCenterStatsTilesProps = {
  counts: ShiftControlCenterCounts;
};

export function ShiftControlCenterStatsTiles({ counts }: ShiftControlCenterStatsTilesProps) {
  return (
    <div
      className="wm-shift-kpi-grid wm-shift-kpi-grid--cols2 wm-animateIn"
      data-testid="shift-jobs-stats-tiles"
      style={{ animationDelay: "40ms" }}
    >
      <div
        className={[
          "wm-shift-kpi-tile",
          counts.availableShifts > 0 ? "isShift isPositive" : "isZero",
        ].join(" ")}
        data-testid="shift-jobs-stat-available"
      >
        <div className="wm-shift-kpi-tile__label">Available</div>
        <div className="wm-shift-kpi-tile__value">{counts.availableShifts}</div>
      </div>

      <div
        className={[
          "wm-shift-kpi-tile",
          counts.totalApps > 0 ? "isShift isPositive" : "isZero",
        ].join(" ")}
        data-testid="shift-jobs-stat-applications"
      >
        <div className="wm-shift-kpi-tile__label">Applications</div>
        <div className="wm-shift-kpi-tile__value">{counts.totalApps}</div>
      </div>
    </div>
  );
}
