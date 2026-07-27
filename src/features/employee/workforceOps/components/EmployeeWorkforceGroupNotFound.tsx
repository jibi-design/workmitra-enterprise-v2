// App name: Job Mitra | EmployeeWorkforceGroupNotFound.tsx — DomainHero (Wave 5)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { IconBack } from "../../../../shared/domains/workforce/ui/workforceIcons";

type Props = {
  onBack: () => void;
};

export function EmployeeWorkforceGroupNotFound({ onBack }: Props) {
  return (
    <div style={{ padding: "0 16px" }}>
      <DomainHero
        variant="workforce"
        audience="employee"
        icon={
          <button type="button" className="wm-domainHeroIconBtn" onClick={onBack} aria-label="Back">
            <IconBack />
          </button>
        }
        title="Group not found"
        subtitle="This work group may have been removed"
        description="Return to Workforce Ops Hub to continue."
      />
    </div>
  );
}
