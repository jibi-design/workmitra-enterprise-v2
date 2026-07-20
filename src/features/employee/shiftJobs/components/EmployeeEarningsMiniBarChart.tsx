// App name: Job Mitra
// File name: EmployeeEarningsMiniBarChart.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\EmployeeEarningsMiniBarChart.tsx

type EmployeeEarningsMiniBarChartProps = {
  data: {
    label: string;
    earned: number;
  }[];
};

export function EmployeeEarningsMiniBarChart({ data }: EmployeeEarningsMiniBarChartProps) {
  if (data.length === 0) return null;

  const max = Math.max(...data.map((item) => item.earned), 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60, marginTop: 8 }}>
      {data.map((item) => {
        const percent = Math.round((item.earned / max) * 100);

        return (
          <div
            key={item.label}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: "var(--wm-er-muted)",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              {item.earned.toLocaleString()}
            </div>

            <div
              style={{
                width: "100%",
                borderRadius: "4px 4px 0 0",
                height: `${Math.max(4, percent * 0.44)}px`,
                background: `rgba(22,163,74,${0.4 + percent / 200})`,
                transition: "height 0.3s ease",
              }}
            />

            <div
              style={{
                fontSize: 9,
                color: "var(--wm-er-muted)",
                fontWeight: 600,
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
