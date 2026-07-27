// App name: Job Mitra | EmployeeCareerWorkspacesHero.tsx — DomainHero (full Career)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";

function WorkspaceIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3Zm2 0h4V4h-4v2Zm9 6h-5v2h-4v-2H5v7h14v-7Z"
      />
    </svg>
  );
}

export function EmployeeCareerWorkspacesHero() {
  return (
    <DomainHero
      variant="career"
      audience="employee"
      eyebrow="Career Workspaces"
      icon={<WorkspaceIcon />}
      title="Career employment workspaces"
      subtitle="Active and completed Career work records"
      description="Open workspaces for feedback, updates, and employment history."
    />
  );
}
