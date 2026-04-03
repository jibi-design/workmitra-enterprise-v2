// src/features/employee/workVault/components/VaultWorkStatsCard.tsx

import type { VaultWorkStats } from "../types/vaultProfileTypes";

type StatBoxProps = {
  value: number;
  label: string;
  color: string;
};

function StatBox({ value, label, color }: StatBoxProps) {
  return (
    <div
      style={{
        padding: "10px 8px",
        borderRadius: 12,
        background: "var(--wm-emp-bg)",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--wm-emp-muted)", marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}

export function VaultWorkStatsCard({ stats }: { stats: VaultWorkStats }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      <StatBox value={stats.totalCareerPositions} label="Career positions" color="#3730a3" />
      <StatBox value={stats.totalShiftsCompleted} label="Shifts completed" color="#0f766e" />
      <StatBox value={stats.totalWorkforceCompanies} label="Workforce companies" color="#b45309" />
      <StatBox value={stats.totalCompaniesWorked} label="Total companies" color="var(--wm-emp-text)" />
    </div>
  );
}