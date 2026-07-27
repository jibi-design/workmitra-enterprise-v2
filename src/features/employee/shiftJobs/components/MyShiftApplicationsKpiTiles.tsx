// App name: Job Mitra | MyShiftApplicationsKpiTiles.tsx — wm-shift-kpi-tile (Wave A)

import type { KpiCounts } from "../../shiftJobs/helpers/shiftApplicationHelpers";

type MyShiftApplicationsKpiTilesProps = {
  kpi: KpiCounts;
  domain?: "shift" | "planner";
};

export function MyShiftApplicationsKpiTiles({
  kpi,
  domain = "shift",
}: MyShiftApplicationsKpiTilesProps) {
  const kpiDefs = [
    { label: "Applied", field: "applied" as const },
    { label: "Shortlisted", field: "shortlisted" as const },
    { label: "Confirmed", field: "confirmed" as const },
  ];

  return (
    <div
      className="wm-shift-kpi-grid wm-animateIn"
      data-testid="shift-applications-kpi-grid"
      style={{ animationDelay: "60ms" }}
    >
      {kpiDefs.map((definition) => {
        const count = kpi[definition.field];
        const isZero = count === 0;
        const toneClass =
          domain === "planner"
            ? ""
            : isZero
              ? "isZero"
              : definition.field === "confirmed"
                ? "isSuccess"
                : "isShift isPositive";

        return (
          <div
            key={definition.label}
            className={["wm-shift-kpi-tile", toneClass].filter(Boolean).join(" ")}
            data-testid={`shift-applications-kpi-${definition.field}`}
          >
            <div className="wm-shift-kpi-tile__label">{definition.label}</div>
            <div className="wm-shift-kpi-tile__value">{count}</div>
          </div>
        );
      })}
    </div>
  );
}
