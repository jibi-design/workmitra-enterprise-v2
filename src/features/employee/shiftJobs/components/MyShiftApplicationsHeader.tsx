// App name: Job Mitra | MyShiftApplicationsHeader.tsx — DomainHero (Wave A)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";

type Domain = "shift" | "planner";

type MyShiftApplicationsHeaderProps = {
  domain?: Domain;
  onFindShifts: () => void;
};

export function MyShiftApplicationsHeader({
  domain = "shift",
  onFindShifts,
}: MyShiftApplicationsHeaderProps) {
  const isPlanner = domain === "planner";

  return (
    <DomainHero
      variant={isPlanner ? "planner" : "shift"}
      audience="employee"
      icon={<ApplicationsHeroIcon />}
      title={isPlanner ? "My Project Applications" : "My Applications"}
      subtitle={
        isPlanner ? "Multi-day Gig project bundles only" : "Single-day shift applications only"
      }
      description={
        isPlanner
          ? "Track plan bundle status and per-day breakdown — never mixed with green shift applications."
          : "Review pending, shortlisted, confirmed, and closed shift applications from one place."
      }
      trailing={
        <button
          type="button"
          className={
            isPlanner
              ? "wm-planner-btnGhost wm-shift-pressable"
              : "wm-outlineBtn wm-shift-pressable"
          }
          onClick={onFindShifts}
          data-testid="shift-applications-find-cta"
        >
          {isPlanner ? "Browse Projects" : "Find Shifts"}
        </button>
      }
    />
  );
}

function ApplicationsHeroIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm4 18H6V4h7v5h5v11Z"
      />
    </svg>
  );
}
