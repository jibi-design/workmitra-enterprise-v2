// src/features/employer/hrManagement/components/HRStatsBar.tsx
//
// 4-metric stats bar for Staff Lifecycle page.
// Shows: Total | Active | Pending | Exit counts.
// 10/10: Filled cards, large numbers, icons, domain-accurate colors.

import type { HRCandidateRecord } from "../types/hrManagement.types";

type Props = {
  records: HRCandidateRecord[];
};

type StatItem = {
  label: string;
  value: number;
  color: string;
  accent: string;
  bg: string;
  border: string;
  iconPath: string;
};

function computeStats(records: HRCandidateRecord[]): StatItem[] {
  const total = records.length;

  const active = records.filter((r) => r.status === "active").length;

  const pending = records.filter(
    (r) =>
      r.status === "offer_pending" ||
      r.status === "offered" ||
      r.status === "hired" ||
      r.status === "onboarding",
  ).length;

  const exit = records.filter((r) => r.status === "exit_processing").length;

  return [
    {
      label: "Total",
      value: total,
      color: "#7c3aed",
      accent: "#7c3aed",
      bg: "rgba(124, 58, 237, 0.06)",
      border: "rgba(124, 58, 237, 0.14)",
      iconPath: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
    },
    {
      label: "Active",
      value: active,
      color: "#15803d",
      accent: "#16a34a",
      bg: "rgba(22, 163, 74, 0.06)",
      border: "rgba(22, 163, 74, 0.14)",
      iconPath: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
    },
    {
      label: "Pending",
      value: pending,
      color: "#b45309",
      accent: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.06)",
      border: "rgba(245, 158, 11, 0.14)",
      iconPath: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z",
    },
    {
      label: "Exit",
      value: exit,
      color: "#dc2626",
      accent: "#ef4444",
      bg: "rgba(220, 38, 38, 0.06)",
      border: "rgba(220, 38, 38, 0.14)",
      iconPath: "M10.79 16.29c.39.39 1.02.39 1.41 0l3.59-3.59a.996.996 0 000-1.41L12.2 7.7a.996.996 0 10-1.41 1.41L12.67 11H4c-.55 0-1 .45-1 1s.45 1 1 1h8.67l-1.88 1.88c-.39.39-.38 1.03 0 1.41zM19 3H5c-1.11 0-2 .9-2 2v3c0 .55.45 1 1 1s1-.45 1-1V5h14v14H5v-3c0-.55-.45-1-1-1s-1 .45-1 1v3c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z",
    },
  ];
}

export function HRStatsBar({ records }: Props) {
  const stats = computeStats(records);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
      {stats.map((s) => {
        const isZero = s.value === 0;

        return (
          <div
            key={s.label}
            style={{
              padding: "12px 6px 10px",
              borderRadius: 12,
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderTop: `2.5px solid ${s.accent}`,
              textAlign: "center",
              position: "relative",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 8,
                background: isZero ? "rgba(15, 23, 42, 0.04)" : `${s.accent}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 6px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill={isZero ? "#b0b5bf" : s.color}
                  d={s.iconPath}
                />
              </svg>
            </div>

            {/* Number */}
            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: isZero ? "#b0b5bf" : s.color,
                lineHeight: 1,
                transition: "color 0.2s",
              }}
            >
              {s.value}
            </div>

            {/* Label */}
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "var(--wm-er-muted, #64748b)",
                marginTop: 4,
                letterSpacing: 0.2,
              }}
            >
              {s.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
