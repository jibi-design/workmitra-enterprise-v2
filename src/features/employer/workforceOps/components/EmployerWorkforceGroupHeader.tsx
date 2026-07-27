// App name: Job Mitra | EmployerWorkforceGroupHeader.tsx — DomainHero (Wave 5)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import type { WorkforceGroup } from "../../../../shared/domains/workforce/types/workforceTypes";
import { IconBack } from "../../../../shared/domains/workforce/ui/workforceIcons";

type Props = {
  group: WorkforceGroup;
  activeMembers: number;
  onBack: () => void;
};

export function EmployerWorkforceGroupHeader({ group, activeMembers, onBack }: Props) {
  const dateLabel = new Date(group.date + "T00:00:00").toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <DomainHero
      variant="workforce"
      audience="employer"
      icon={
        <button type="button" className="wm-domainHeroIconBtn" onClick={onBack} aria-label="Back">
          <IconBack />
        </button>
      }
      title={group.name}
      subtitle={`${activeMembers} member${activeMembers !== 1 ? "s" : ""} · ${dateLabel}`}
      description="Group members, attendance, and completion controls."
      trailing={
        <span className="wm-domainHeroBadge">
          {group.status === "active" ? "Active" : "Completed"}
        </span>
      }
    />
  );
}
