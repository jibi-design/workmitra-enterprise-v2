// App name: Job Mitra | EmployerWorkforceAnnounceNotFound.tsx — DomainHero (Wave 5)

import { DomainHero } from "../../../../../shared/components/layout/DomainHero";
import { EnterpriseEmpty } from "../../../../../shared/components/enterprise/EnterpriseEmpty";
import { IconBack } from "../../../../../shared/domains/workforce/ui/workforceIcons";

type Props = {
  onBack: () => void;
};

export function EmployerWorkforceAnnounceNotFound({ onBack }: Props) {
  return (
    <div className="wm-er-vWorkforce">
      <DomainHero
        variant="workforce"
        audience="employer"
        icon={
          <button type="button" className="wm-domainHeroIconBtn" onClick={onBack} aria-label="Back">
            <IconBack />
          </button>
        }
        title="Announcement not found"
        subtitle="This announcement may have been deleted"
        description="Return to announcements to continue workforce operations."
      />

      <EnterpriseEmpty
        title="Announcement unavailable"
        subtitle="This announcement may have been deleted."
        primaryLabel="Go Back"
        onPrimary={onBack}
      />
    </div>
  );
}
