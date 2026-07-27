// App name: Job Mitra | ShiftPostDetailsApplyHero.tsx — DomainHero (post-details polish)

import { DomainHero } from "../../../../../shared/components/layout/DomainHero";
import { ShiftIcon } from "../../components/ShiftPostDetailSections";

export function ShiftPostDetailsApplyHero({
  employerName,
  locationName,
}: {
  readonly employerName: string;
  readonly locationName: string;
}) {
  return (
    <DomainHero
      variant="shift"
      audience="employee"
      icon={<ShiftIcon size={22} />}
      title="Shift details"
      subtitle={`${employerName} · ${locationName}`}
      description="Review pay, location, dates, requirements, and employer details before you apply."
      trailing={<span className="wm-domainHeroBadge">Apply safely</span>}
    />
  );
}
