// App name: Job Mitra
// File name: ShiftHomeKpiTiles.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\ShiftHomeKpiTiles.tsx

import type { KeyboardEvent } from "react";
import type { ShiftHomeKpiData } from "../types/shiftHomeSection.types";

type ShiftHomeKpiTilesProps = {
  kpi: ShiftHomeKpiData;
  onApplied?: () => void;
  onShortlisted?: () => void;
  onConfirmed?: () => void;
};

type ShiftHomeKpiTone = "shift" | "success" | "warning";

export function ShiftHomeKpiTiles({
  kpi,
  onApplied,
  onShortlisted,
  onConfirmed,
}: ShiftHomeKpiTilesProps) {
  return (
    <div className="wm-shiftHomeKpiWrap">
      <div className="wm-shiftHomeKpiGrid">
        <KpiTile label="Posts" value={kpi.total} />
        <KpiTile label="Open" value={kpi.open} tone="shift" />
        <KpiTile label="Active" value={kpi.active} tone="success" />
      </div>

      <div className="wm-shiftHomeKpiGrid">
        <KpiTile label="Applied" value={kpi.applied} onClick={onApplied} />
        <KpiTile
          label="Shortlisted"
          value={kpi.shortlisted}
          tone="warning"
          onClick={onShortlisted}
        />
        <KpiTile label="Confirmed" value={kpi.confirmed} tone="success" onClick={onConfirmed} />
      </div>
    </div>
  );
}

function KpiTile({
  label,
  value,
  tone,
  onClick,
}: {
  label: string;
  value: number;
  tone?: ShiftHomeKpiTone;
  onClick?: () => void;
}) {
  const toneClassName = tone ? `is${tone[0].toUpperCase()}${tone.slice(1)}` : "";
  const zeroClassName = value === 0 ? "isZero" : "";
  const isClickable = Boolean(onClick) && value > 0;

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  }

  return (
    <div
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      className={[
        "wm-shiftHomeKpiTile",
        "wm-press-card",
        toneClassName,
        zeroClassName,
        isClickable ? "isClickable" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={isClickable ? { cursor: "pointer" } : undefined}
      aria-label={isClickable ? `View ${value} ${label.toLowerCase()} candidates` : undefined}
    >
      <div className="wm-shiftHomeKpiLabel">{label}</div>
      <div className="wm-shiftHomeKpiValue">{value}</div>
      {isClickable && (
        <div
          style={{ fontSize: 9, fontWeight: 800, opacity: 0.55, marginTop: 2, letterSpacing: 0.3 }}
        >
          TAP TO VIEW
        </div>
      )}
    </div>
  );
}
