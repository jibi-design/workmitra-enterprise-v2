// App name: Job Mitra | ShiftPostDetailsApplyHero.tsx — DomainHero + worker trust badges

import { DomainHero } from "../../../../../shared/components/layout/DomainHero";
import { EmployerTrustBadge } from "../../../../../shared/employerProfile/EmployerTrustBadge";
import { ShiftIcon } from "../../components/ShiftPostDetailSections";

export function ShiftPostDetailsApplyHero({
  employerName,
  locationName,
}: {
  readonly employerName: string;
  readonly locationName: string;
}) {
  return (
    <div data-testid="shift-post-details-apply-hero">
      <DomainHero
        variant="shift"
        audience="employee"
        icon={<ShiftIcon size={22} />}
        title="Shift details"
        subtitle={`${employerName} · ${locationName}`}
        description="Review pay, location, dates, requirements, and employer details before you apply."
        trailing={<span className="wm-domainHeroBadge">Apply safely</span>}
      />
      <div style={{ marginTop: 10, padding: "0 2px" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "var(--wm-er-muted, #64748b)",
            marginBottom: 4,
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          Employer verification
        </div>
        <EmployerTrustBadge variant="badges" showEmptyHint />
      </div>
    </div>
  );
}
