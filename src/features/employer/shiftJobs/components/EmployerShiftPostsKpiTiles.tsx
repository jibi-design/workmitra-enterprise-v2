// App name: Job Mitra
// File name: EmployerShiftPostsKpiTiles.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerShiftPostsKpiTiles.tsx

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
    <div className="wm-er-tiles wm-shiftPostsKpiGrid">
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
      className={["wm-er-tile", "wm-shiftPostsKpiTile", toneClassName, stateClassName]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="wm-er-tileLabel">{label}</div>
      <div className="wm-er-tileValue">{value}</div>
    </div>
  );
}
