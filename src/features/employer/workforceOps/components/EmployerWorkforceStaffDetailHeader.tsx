// App name: Job Mitra | EmployerWorkforceStaffDetailHeader.tsx — DomainHero (Wave 5)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import type { WorkforceStaff } from "../../../../shared/domains/workforce/types/workforceTypes";
import { IconBack } from "../../../../shared/domains/workforce/ui/workforceIcons";

type Props = {
  staff: WorkforceStaff;
  onBack: () => void;
};

export function EmployerWorkforceStaffDetailHeader({ staff, onBack }: Props) {
  return (
    <DomainHero
      variant="workforce"
      audience="employer"
      icon={
        <button type="button" className="wm-domainHeroIconBtn" onClick={onBack} aria-label="Back">
          <IconBack />
        </button>
      }
      title={staff.employeeName}
      subtitle={`ID: ${staff.employeeUniqueId}`}
      description="Staff profile, ratings, and workforce history."
    />
  );
}
