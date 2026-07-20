// App name: Job Mitra
// File name: WorkDiarySummary.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\employment\components\WorkDiarySummary.tsx

import { useMemo, useSyncExternalStore } from "react";
import { WD_STATUS_CONFIG } from "../helpers/workDiaryConstants";
import { useWorkDiarySummary } from "../helpers/workDiaryHooks";
import { workDiaryStorage } from "../storage/workDiary.storage";

type Props = {
  employmentId: string;
  year: number;
  month: number;
};

export function WorkDiarySummary({ employmentId, year, month }: Props) {
  const monthlySummary = useWorkDiarySummary(employmentId, year, month);

  const cycleSnapshot = useSyncExternalStore(
    workDiaryStorage.subscribe,
    () =>
      JSON.stringify({
        setting: workDiaryStorage.getCycleSetting(employmentId),
        summary: workDiaryStorage.getCycleSummaryForMonth(employmentId, year, month),
        label: workDiaryStorage.getCurrentCycleLabel(employmentId),
      }),
    () =>
      JSON.stringify({
        setting: workDiaryStorage.getCycleSetting(employmentId),
        summary: workDiaryStorage.getCurrentCycleSummary(employmentId),
        label: workDiaryStorage.getCurrentCycleLabel(employmentId),
      }),
  );

  const cycleData = useMemo(() => {
    try {
      return JSON.parse(cycleSnapshot) as {
        setting: { mode: "calendar_month" | "custom_start_day"; startDay: number };
        summary: {
          daysWorked: number;
          totalHours: number;
          daysLeave: number;
          daysOff: number;
        };
        label: string;
      };
    } catch {
      return {
        setting: { mode: "calendar_month" as const, startDay: 1 },
        summary: monthlySummary,
        label: "Calendar month",
      };
    }
  }, [cycleSnapshot, monthlySummary]);

  const isCustomCycle = cycleData.setting.mode === "custom_start_day";
  const summary = isCustomCycle ? cycleData.summary : monthlySummary;
  const total = summary.daysWorked + summary.daysLeave + summary.daysOff;

  if (total === 0) return null;

  const stats = [
    {
      label: "Worked",
      value: summary.daysWorked,
      color: WD_STATUS_CONFIG.worked.color,
      icon: WD_STATUS_CONFIG.worked.icon,
    },
    {
      label: "Leave",
      value: summary.daysLeave,
      color: WD_STATUS_CONFIG.leave.color,
      icon: WD_STATUS_CONFIG.leave.icon,
    },
    {
      label: "Off",
      value: summary.daysOff,
      color: WD_STATUS_CONFIG.off.color,
      icon: WD_STATUS_CONFIG.off.icon,
    },
  ];

  return (
    <div
      style={{
        padding: 14,
        background: "#f8fafc",
        borderRadius: 10,
        border: "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: 12,
            color: "var(--wm-emp-muted, var(--wm-er-muted))",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {isCustomCycle ? "Current Cycle Summary" : "Monthly Summary"}
        </div>

        {isCustomCycle && (
          <span
            style={{
              padding: "3px 8px",
              borderRadius: 999,
              background: "rgba(3,105,161,0.08)",
              color: "var(--wm-er-accent-console, #0369a1)",
              fontSize: 10,
              fontWeight: 900,
              whiteSpace: "nowrap",
            }}
          >
            {cycleData.label}
          </span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}
          >
            <span style={{ fontSize: 14 }}>{stat.icon}</span>
            <span style={{ color: "var(--wm-emp-muted, var(--wm-er-muted))" }}>{stat.label}:</span>
            <span style={{ fontWeight: 800, color: stat.color }}>{stat.value}</span>
          </div>
        ))}
      </div>

      {summary.totalHours > 0 && (
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 12, color: "var(--wm-emp-muted, var(--wm-er-muted))" }}>
            Total Hours:
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: "var(--wm-emp-text, var(--wm-er-text))",
            }}
          >
            {summary.totalHours}h
          </span>
        </div>
      )}
    </div>
  );
}
