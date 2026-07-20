// App name: Job Mitra
// File name: ShiftControlCenterStatsTiles.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\ShiftControlCenterStatsTiles.tsx

import type { ShiftControlCenterCounts } from "../types/shiftControlCenter.types";

type ShiftControlCenterStatsTilesProps = {
  counts: ShiftControlCenterCounts;
};

export function ShiftControlCenterStatsTiles({ counts }: ShiftControlCenterStatsTilesProps) {
  return (
    <div className="wm-shiftEmployeeStatsGrid wm-animateIn">
      <StatsTile label="Available" value={counts.availableShifts} />
      <StatsTile label="Applications" value={counts.totalApps} />
      <StatsTile label="Workspaces" value={counts.activeWs} />
    </div>
  );
}

function StatsTile({ label, value }: { label: string; value: number }) {
  return (
    <div
      className={["wm-shiftEmployeeStatsTile", value > 0 ? "isPositive" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="wm-shiftEmployeeStatsLabel">{label}</div>
      <div className="wm-shiftEmployeeStatsValue">{value}</div>
    </div>
  );
}
