// App name: Job Mitra
// File name: EmployeeEarningsBreakdownSections.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\EmployeeEarningsBreakdownSections.tsx

import type { EarningsSummary } from "../storage/earningsStorage";
import { EARNINGS_GREEN, getBreakdownPercent } from "../helpers/employeeEarnings.helpers";
import { EmployeeEarningsMiniBarChart } from "./EmployeeEarningsMiniBarChart";

type EmployeeEarningsBreakdownSectionsProps = {
  summary: EarningsSummary;
};

export function EmployeeEarningsBreakdownSections({
  summary,
}: EmployeeEarningsBreakdownSectionsProps) {
  return (
    <>
      {summary.byMonth.length > 0 && (
        <div className="wm-ee-card" style={{ marginTop: 14 }}>
          <SectionTitle title="Monthly Earnings" />
          <EmployeeEarningsMiniBarChart data={summary.byMonth} />
        </div>
      )}

      {summary.byWeek.length > 0 && (
        <div className="wm-ee-card" style={{ marginTop: 10 }}>
          <SectionTitle title="Weekly Breakdown" spaced />
          <div style={{ display: "grid", gap: 8 }}>
            {summary.byWeek.map((item) => (
              <BreakdownRow
                key={item.label}
                label={`Week of ${item.label}`}
                earned={item.earned}
                shifts={item.shifts}
                percent={getBreakdownPercent(item.earned, summary.totalEarned)}
              />
            ))}
          </div>
        </div>
      )}

      {summary.byCompany.length > 0 && (
        <div className="wm-ee-card" style={{ marginTop: 10 }}>
          <SectionTitle title="By Company" spaced />
          <div style={{ display: "grid", gap: 8 }}>
            {summary.byCompany.map((item) => (
              <BreakdownRow
                key={item.name}
                label={item.name}
                earned={item.earned}
                shifts={item.shifts}
                percent={getBreakdownPercent(item.earned, summary.totalEarned)}
                showPercent
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function SectionTitle({ title, spaced = false }: { title: string; spaced?: boolean }) {
  return (
    <div
      style={{
        fontSize: 13,
        fontWeight: 700,
        color: "var(--wm-er-text)",
        marginBottom: spaced ? 10 : 4,
      }}
    >
      {title}
    </div>
  );
}

function BreakdownRow({
  label,
  earned,
  shifts,
  percent,
  showPercent = false,
}: {
  label: string;
  earned: number;
  shifts: number;
  percent: number;
  showPercent?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          marginBottom: 4,
        }}
      >
        <span style={{ fontWeight: 600, color: "var(--wm-er-text)" }}>{label}</span>
        <span style={{ fontWeight: 700, color: EARNINGS_GREEN }}>{earned.toLocaleString()}</span>
      </div>

      <div style={{ height: 6, borderRadius: 999, background: "var(--wm-er-bg)" }}>
        <div
          style={{
            height: "100%",
            borderRadius: 999,
            width: `${percent}%`,
            background: EARNINGS_GREEN,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      <div style={{ fontSize: 10, color: "var(--wm-er-muted)", marginTop: 2 }}>
        {shifts} shift{shifts !== 1 ? "s" : ""}
        {showPercent ? ` - ${percent}% of total` : ""}
      </div>
    </div>
  );
}
