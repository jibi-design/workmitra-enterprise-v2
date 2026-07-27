// App name: Job Mitra | EmployerWorkforceAnnouncementsHeader.tsx — DomainHero (Wave 5)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { IconBack, IconPlus } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  onBack: () => void;
  onNewAnnouncement: () => void;
};

export function EmployerWorkforceAnnouncementsHeader({ onBack, onNewAnnouncement }: Props) {
  return (
    <DomainHero
      variant="workforce"
      audience="employer"
      icon={
        <button type="button" className="wm-domainHeroIconBtn" onClick={onBack} aria-label="Back">
          <IconBack />
        </button>
      }
      title="Announcements"
      subtitle="All work announcements"
      description="Create and track open, confirmed, and completed workforce announcements."
      trailing={
        <button
          className="wm-primarybtn"
          type="button"
          onClick={onNewAnnouncement}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
            background: AMBER,
            fontSize: 12,
            padding: "8px 14px",
          }}
        >
          <IconPlus /> New
        </button>
      }
    />
  );
}
