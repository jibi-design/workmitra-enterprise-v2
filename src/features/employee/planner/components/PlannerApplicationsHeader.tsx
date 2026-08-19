/** Job Mitra | PlannerApplicationsHeader.tsx | DomainHero chrome (P-UI-1) */

import { DomainHero } from "../../../../shared/components/layout/DomainHero";

export function PlannerApplicationsHeader() {
  return (
    <DomainHero
      variant="planner"
      audience="employee"
      eyebrow="Gig Projects"
      title="My Project Applications"
      subtitle="Multi-day Gig project bundles only"
      description="Track plan bundle status and per-day breakdown — never mixed with green shift applications."
    />
  );
}
