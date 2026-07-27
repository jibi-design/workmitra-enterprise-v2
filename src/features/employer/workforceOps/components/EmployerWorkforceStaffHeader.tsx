// App name: Job Mitra | EmployerWorkforceStaffHeader.tsx — DomainHero (Wave 5)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { IconBack, IconPlus } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  staffCount: number;
  onBack: () => void;
  onAddStaff: () => void;
};

export function EmployerWorkforceStaffHeader({ staffCount, onBack, onAddStaff }: Props) {
  return (
    <DomainHero
      variant="workforce"
      audience="employer"
      icon={
        <button type="button" className="wm-domainHeroIconBtn" onClick={onBack} aria-label="Back">
          <IconBack />
        </button>
      }
      title="Staff Directory"
      subtitle={`${staffCount} staff member${staffCount !== 1 ? "s" : ""}`}
      description="Add and manage permanent workforce staff for announcements and groups."
      trailing={
        <button
          className="wm-primarybtn"
          type="button"
          onClick={onAddStaff}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
            background: AMBER,
          }}
        >
          <IconPlus /> Add Staff
        </button>
      }
    />
  );
}
