/** Job Mitra | EmployeeInsightsCard.tsx | My Dashboard entry card */

import { DomainCard } from "../../../../shared/components/layout/designDna";

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
    <DomainCard
      domain="dashboard"
      audience="employee"
      className="wm-homeInsightsPortal"
      title="My Dashboard"
      subtitle="Insights & activity"
      ariaLabel="Open My Dashboard"
      onClick={onViewHistory}
      icon={<ChartIcon />}
      iconStyle={{
        background: "color-mix(in srgb, var(--wm-home-dashboard-accent, #0d9488) 14%, transparent)",
        color: "var(--wm-home-dashboard-accent, #0d9488)",
      }}
    />
  );
}
