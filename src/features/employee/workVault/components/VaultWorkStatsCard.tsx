// src/features/employee/workVault/components/VaultWorkStatsCard.tsx

import { StatusBadge } from "../../../../shared/components/enterprise/StatusBadge";
import type { VaultWorkStats } from "../types/vaultProfileTypes";

type StatBoxProps = {
  value: number;
  label: string;
  accent: "career" | "shift" | "planner" | undefined;
};

function StatBox({ value, label, accent }: StatBoxProps) {
  return (
    <div className="wm-vault-stat-box">
      {accent ? <StatusBadge label={label} tone="neutral" accent={accent} /> : null}
      {!accent ? <div className="wm-vault-stat-box__label">{label}</div> : null}
      <div className="wm-vault-stat-box__value">{value}</div>
    </div>
  );
}

export function VaultWorkStatsCard({ stats }: { stats: VaultWorkStats }) {
  return (
    <div className="wm-vault-stats-grid" data-testid="vault-work-stats">
      <StatBox value={stats.totalCareerPositions} label="Career positions" accent="career" />
      <StatBox value={stats.totalShiftsCompleted} label="Shifts completed" accent="shift" />
      <StatBox value={stats.totalPlannerEpochs} label="Planner epochs" accent="planner" />
      <StatBox value={stats.totalCompaniesWorked} label="Total companies" accent={undefined} />
    </div>
  );
}
