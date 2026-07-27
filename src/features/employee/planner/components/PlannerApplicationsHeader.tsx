/** Job Mitra | PlannerApplicationsHeader.tsx | DomainHero chrome (P-UI-1) */

import { DomainHero } from "../../../../shared/components/layout/DomainHero";

type Props = {
  onBrowseProjects: () => void;
};

export function PlannerApplicationsHeader({ onBrowseProjects }: Props) {
  return (
    <DomainHero
      variant="planner"
      audience="employee"
      eyebrow="Gig Projects"
      title="My Project Applications"
      subtitle="Multi-day Gig project bundles only"
      description="Track plan bundle status and per-day breakdown — never mixed with green shift applications."
      trailing={
        <button
          type="button"
          className="wm-planner-btnGhost"
          onClick={onBrowseProjects}
          data-testid="planner-applications-browse"
          style={{ whiteSpace: "nowrap", minHeight: 36, padding: "6px 12px", fontSize: 12 }}
        >
          Browse Projects
        </button>
      }
    />
  );
}
