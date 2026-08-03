// App name: Job Mitra | EmployeeEarningsSummaryTiles.tsx — glass KPI (Wave B)

import type { EarningsSummary } from "../storage/earningsStorage";

type EmployeeEarningsSummaryTilesProps = {
  summary: EarningsSummary;
};

export function EmployeeEarningsSummaryTiles({ summary }: EmployeeEarningsSummaryTilesProps) {
  return (
    <div className="wm-animateIn" style={{ animationDelay: "60ms", display: "grid", gap: 12 }}>
      <div
        className="wm-shift-surface-glass wm-shift-surface-glass--shift"
        data-testid="shift-earnings-total"
        style={{ padding: "16px 14px", textAlign: "center" }}
      >
        <div className="wm-shift-kpi-tile__label">Estimated Earnings (total)</div>
        <div
          className="wm-shift-kpi-tile__value isPositive"
          style={{ fontSize: 32, marginTop: 8, color: "var(--wm-shift-accent, #16a34a)" }}
        >
          {summary.totalEarned.toLocaleString()}
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 13,
            fontWeight: 600,
            color: "var(--wm-emp-muted, #64748b)",
          }}
        >
          {summary.totalShifts} shifts · {summary.totalDays} days worked
        </div>
      </div>

      <div className="wm-shift-kpi-grid" data-testid="shift-earnings-kpi-grid">
        <div className="wm-shift-kpi-tile isShift isPositive">
          <div className="wm-shift-kpi-tile__label">Avg / Shift</div>
          <div className="wm-shift-kpi-tile__value" style={{ fontSize: 18 }}>
            {summary.avgPerShift.toLocaleString()}
          </div>
        </div>
        <div className="wm-shift-kpi-tile isShift isPositive">
          <div className="wm-shift-kpi-tile__label">Avg / Day</div>
          <div className="wm-shift-kpi-tile__value" style={{ fontSize: 18 }}>
            {summary.avgPerDay.toLocaleString()}
          </div>
        </div>
        <div
          className={`wm-shift-kpi-tile ${summary.totalShifts > 0 ? "isShift isPositive" : "isZero"}`}
        >
          <div className="wm-shift-kpi-tile__label">Shifts</div>
          <div className="wm-shift-kpi-tile__value" style={{ fontSize: 18 }}>
            {summary.totalShifts}
          </div>
        </div>
      </div>
    </div>
  );
}
