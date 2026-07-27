// App name: Job Mitra
// File name: EmployerShiftPostsKpiTiles.tsx
// My Posts KPIs — shared .wm-shift-kpi-tile primitives (Step 2)

type EmployerShiftPostsKpiTilesProps = {
  kpi: {
    total: number;
    open: number;
    active: number;
    reviewed: number;
  };
};

type EmployerShiftPostsKpiTone = "neutral" | "shift" | "success";

export function EmployerShiftPostsKpiTiles({ kpi }: EmployerShiftPostsKpiTilesProps) {
  return (
    <div
      className="wm-shift-kpi-grid wm-shiftPostsKpiGrid wm-animateIn"
      data-testid="shift-posts-kpi-grid"
      style={{ animationDelay: "60ms" }}
    >
      <KpiTile label="Total" value={kpi.total} tone="neutral" />
      <KpiTile label="Open" value={kpi.open} tone={kpi.open > 0 ? "shift" : "neutral"} />
      <KpiTile label="Active" value={kpi.active} tone={kpi.active > 0 ? "success" : "neutral"} />
    </div>
  );
}

function KpiTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: EmployerShiftPostsKpiTone;
}) {
  const toneClassName = tone === "neutral" ? "" : `is${tone[0].toUpperCase()}${tone.slice(1)}`;
  const stateClassName = value > 0 ? "isPositive" : "isZero";

  return (
    <div
      className={["wm-shift-kpi-tile", "wm-shiftPostsKpiTile", toneClassName, stateClassName]
        .filter(Boolean)
        .join(" ")}
      data-testid={`shift-posts-kpi-${label.toLowerCase()}`}
    >
      <div className="wm-shift-kpi-tile__label">{label}</div>
      <div className="wm-shift-kpi-tile__value">{value}</div>
    </div>
  );
}
