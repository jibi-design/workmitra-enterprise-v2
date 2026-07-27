// App name: Job Mitra | EmployerWorkforceAnnounceDashHeader.tsx — DomainHero (Wave 5)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import type { WorkforceAnnouncement } from "../../../../shared/domains/workforce/types/workforceTypes";
import { IconBack } from "../../../../shared/domains/workforce/ui/workforceIcons";

type Props = {
  announcement: WorkforceAnnouncement;
  statusColor: string;
  onBack: () => void;
};

export function EmployerWorkforceAnnounceDashHeader({ announcement, statusColor, onBack }: Props) {
  return (
    <DomainHero
      variant="workforce"
      audience="employer"
      icon={
        <button type="button" className="wm-domainHeroIconBtn" onClick={onBack} aria-label="Back">
          <IconBack />
        </button>
      }
      title={announcement.title}
      subtitle="Announcement Dashboard"
      description="Track responses, confirmations, and completion for this announcement."
      trailing={
        <span className="wm-domainHeroBadge" style={{ color: statusColor }}>
          {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
        </span>
      }
    />
  );
}
