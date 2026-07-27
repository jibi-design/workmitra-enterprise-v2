// App name: Job Mitra | CareerWorkspacePageHero.tsx — DomainHero (full Career)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { EmployerTrustBadge } from "../../../../shared/employerProfile/EmployerTrustBadge";
import type { CareerWorkspace } from "../../../career/types/careerDomainTypes";
import { statusLabel, statusTone, toneBadgeStyle } from "../helpers/careerWorkspaceDisplayHelpers";

type CareerWorkspacePageHeroProps = {
  workspace: CareerWorkspace;
};

export function CareerWorkspacePageHero({ workspace }: CareerWorkspacePageHeroProps) {
  const tone = statusTone(workspace.status);
  const subtitle = [workspace.companyName, workspace.department, workspace.location]
    .filter(Boolean)
    .join(" · ");

  return (
    <DomainHero
      variant="career"
      audience="employee"
      eyebrow="Employee Career Workspace"
      title={workspace.jobTitle}
      subtitle={subtitle}
      description="Employment details, feedback, and workspace updates for this Career role."
      trailing={
        <span
          className="wm-domainHeroBadge"
          style={{
            minHeight: 28,
            padding: "0 10px",
            display: "inline-flex",
            alignItems: "center",
            fontSize: 11,
            fontWeight: 800,
            ...toneBadgeStyle(tone),
          }}
        >
          {statusLabel(workspace.status)}
        </span>
      }
    >
      <EmployerTrustBadge variant="full" />
    </DomainHero>
  );
}
