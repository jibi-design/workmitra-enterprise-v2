// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeWorkforceTimesheetEmptyState.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workforceOps\components\EmployeeWorkforceTimesheetEmptyState.tsx

type Props = {
  year: number;
  month: number;
  monthNames: string[];
  isCurrentMonth: boolean;
};

export function EmployeeWorkforceTimesheetEmptyState({
  year,
  month,
  monthNames,
  isCurrentMonth,
}: Props) {
  return (
    <div className="wm-er-card" style={{ marginTop: 16, marginBottom: 24 }}>
      <div style={{ padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "var(--wm-er-text)" }}>
          No attendance records
        </div>

        <div
          style={{
            fontSize: 13,
            color: "var(--wm-er-muted)",
            marginTop: 4,
            maxWidth: 280,
            margin: "4px auto 0",
            lineHeight: 1.5,
          }}
        >
          {isCurrentMonth
            ? "No shifts recorded this month yet. Sign in to your shifts from the group page."
            : `No work recorded in ${monthNames[month]} ${year}.`}
        </div>
      </div>
    </div>
  );
}
