// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeWorkforceTimesheetSummary.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workforceOps\components\EmployeeWorkforceTimesheetSummary.tsx

import { AMBER, AMBER_BG } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  year: number;
  month: number;
  monthNames: string[];
  primaryValue: number;
  primaryLabel: string;
  switchLabel: string;
  onToggleMode: () => void;
};

export function EmployeeWorkforceTimesheetSummary({
  year,
  month,
  monthNames,
  primaryValue,
  primaryLabel,
  switchLabel,
  onToggleMode,
}: Props) {
  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          padding: "20px 16px",
          borderRadius: "var(--wm-radius-14)",
          background: AMBER_BG,
          border: `1px solid ${AMBER}`,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 36, fontWeight: 900, color: AMBER, letterSpacing: -1 }}>
          {primaryValue}
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)", marginTop: 4 }}>
          {primaryLabel}
        </div>

        <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
          {monthNames[month]} {year}
        </div>

        <button
          type="button"
          onClick={onToggleMode}
          style={{
            marginTop: 10,
            padding: "6px 16px",
            borderRadius: 999,
            border: `1px solid ${AMBER}`,
            background: "#fff",
            color: AMBER,
            fontSize: 11,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {switchLabel}
        </button>
      </div>
    </div>
  );
}
