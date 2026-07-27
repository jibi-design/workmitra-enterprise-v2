/** Job Mitra | EmployeeInsightsCard.tsx | Dark glass insights card */

import { HomeGlassCardShell } from "../../../../shared/components/layout/HomeGlassCardShell";

interface InsightsCardProps {
  onViewHistory: () => void;
}

function ChartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M21 12H3M12 3v18" />
    </svg>
  );
}

export function InsightsCard({ onViewHistory }: InsightsCardProps) {
  return (
    <HomeGlassCardShell
      audience="employee"
      tone="dark"
      title="Insights & Activity"
      subtitle="Track your history"
      ariaLabel="Open Insights and Activity"
      onClick={onViewHistory}
      icon={<ChartIcon />}
      iconStyle={{
        background: "rgba(255, 255, 255, 0.1)",
        color: "#FFFFFF",
      }}
      trailing={
        <span aria-hidden="true" style={{ color: "rgba(255,255,255,0.3)", fontSize: 20 }}>
          →
        </span>
      }
    />
  );
}
