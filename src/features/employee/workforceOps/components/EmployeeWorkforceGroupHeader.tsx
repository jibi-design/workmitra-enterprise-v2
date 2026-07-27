// App name: Job Mitra | EmployeeWorkforceGroupHeader.tsx — DomainHero (Wave 5)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import type { WorkforceGroup } from "../../../../shared/domains/workforce/types/workforceTypes";
import { IconBack } from "../../../../shared/domains/workforce/ui/workforceIcons";

type Props = {
  group: WorkforceGroup;
  onBack: () => void;
};

export function EmployeeWorkforceGroupHeader({ group, onBack }: Props) {
  const dateLabel = new Date(group.date + "T00:00:00").toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <DomainHero
      variant="workforce"
      audience="employee"
      icon={
        <button type="button" className="wm-domainHeroIconBtn" onClick={onBack} aria-label="Back">
          <IconBack />
        </button>
      }
      title={group.name}
      subtitle={`${dateLabel}${group.location ? ` · ${group.location}` : ""}`}
      description="Group schedule, attendance, and team details."
      trailing={
        <span className="wm-domainHeroBadge">
          {group.status === "active" ? "Active" : "Completed"}
        </span>
      }
    />
  );
}
