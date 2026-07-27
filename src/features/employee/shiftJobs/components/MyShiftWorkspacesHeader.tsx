// App name: Job Mitra | MyShiftWorkspacesHeader.tsx — DomainHero (shift + planner)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";

type Domain = "shift" | "planner";

type MyShiftWorkspacesHeaderProps = {
  domain?: Domain;
  onFindShifts: () => void;
};

export function MyShiftWorkspacesHeader({
  domain = "shift",
  onFindShifts,
}: MyShiftWorkspacesHeaderProps) {
  const isPlanner = domain === "planner";

  return (
    <DomainHero
      variant={isPlanner ? "planner" : "shift"}
      audience="employee"
      icon={<WorkspacesHeroIcon />}
      title={isPlanner ? "Project Workspaces" : "My Work Groups"}
      subtitle={
        isPlanner
          ? "Confirmed Gig project days — crew chat and updates."
          : "Confirmed single-day shifts and active work groups."
      }
      description={
        isPlanner
          ? "Only workspaces from multi-day project plans appear here — separate from green shift groups."
          : "A work group is created after an employer confirms you for a single-day shift."
      }
      trailing={
        <button
          className={
            isPlanner
              ? "wm-planner-btnGhost wm-shift-pressable"
              : "wm-outlineBtn wm-shift-pressable"
          }
          type="button"
          onClick={onFindShifts}
        >
          {isPlanner ? "Browse Projects" : "Find Shifts"}
        </button>
      }
    />
  );
}

function WorkspacesHeroIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z"
      />
    </svg>
  );
}
