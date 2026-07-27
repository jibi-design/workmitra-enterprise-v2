// App name: Job Mitra | EmployeeEarningsShiftList.tsx — pressable cards (Wave B)

import type { EarningsSummary } from "../storage/earningsStorage";
import { EARNINGS_GREEN, formatEarningsDateRange } from "../helpers/employeeEarnings.helpers";

type EmployeeEarningsShiftListProps = {
  entries: EarningsSummary["entries"];
};

export function EmployeeEarningsShiftList({ entries }: EmployeeEarningsShiftListProps) {
  if (entries.length === 0) return null;

  return (
    <div className="wm-animateIn" style={{ animationDelay: "120ms", marginBottom: 32 }}>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "var(--wm-er-text)",
          marginBottom: 10,
        }}
      >
        Confirmed Shifts
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {entries.map((entry) => (
          <div
            key={entry.appId}
            className="wm-shift-card wm-shift-pressable"
            data-testid={`shift-earnings-entry-${entry.appId}`}
            style={{ padding: 14 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--wm-er-text)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {entry.jobName} - {entry.companyName}
                </div>

                <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
                  {entry.locationName} - {formatEarningsDateRange(entry.startAt, entry.endAt)}
                </div>
              </div>

              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: EARNINGS_GREEN }}>
                  {entry.totalEarned.toLocaleString()}
                </div>

                <div style={{ fontSize: 10, color: "var(--wm-er-muted)", marginTop: 2 }}>
                  {entry.payPerDay}/day x {entry.totalDays} day
                  {entry.totalDays !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
