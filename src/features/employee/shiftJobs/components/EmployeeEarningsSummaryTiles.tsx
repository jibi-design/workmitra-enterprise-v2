// App name: Job Mitra
// File name: EmployeeEarningsSummaryTiles.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\EmployeeEarningsSummaryTiles.tsx

import type { EarningsSummary } from "../storage/earningsStorage";
import { EARNINGS_GREEN } from "../helpers/employeeEarnings.helpers";

type EmployeeEarningsSummaryTilesProps = {
  summary: EarningsSummary;
};

export function EmployeeEarningsSummaryTiles({ summary }: EmployeeEarningsSummaryTilesProps) {
  return (
    <>
      <div className="wm-ee-tiles" style={{ marginTop: 14 }}>
        <SummaryTile label="Total Earned" value={summary.totalEarned.toLocaleString()} active />
        <SummaryTile label="Shifts" value={String(summary.totalShifts)} active />
        <SummaryTile label="Days Worked" value={String(summary.totalDays)} />
      </div>

      <div className="wm-ee-tiles" style={{ marginTop: 8 }}>
        <SummaryTile label="Avg / Shift" value={summary.avgPerShift.toLocaleString()} compact />
        <SummaryTile label="Avg / Day" value={summary.avgPerDay.toLocaleString()} compact />
      </div>
    </>
  );
}

function SummaryTile({
  label,
  value,
  active = false,
  compact = false,
}: {
  label: string;
  value: string;
  active?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="wm-ee-tile">
      <div className="wm-ee-tileLabel">{label}</div>
      <div
        style={{
          marginTop: 4,
          fontSize: compact ? 16 : 18,
          fontWeight: 700,
          color: active ? EARNINGS_GREEN : "var(--wm-er-text)",
        }}
      >
        {value}
      </div>
    </div>
  );
}
