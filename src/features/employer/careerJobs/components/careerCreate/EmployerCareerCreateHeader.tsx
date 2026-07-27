// App name: Job Mitra | EmployerCareerCreateHeader.tsx — DomainHero (full Career)

import { DomainHero } from "../../../../../shared/components/layout/DomainHero";

function CreateIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function EmployerCareerCreateHeader() {
  return (
    <DomainHero
      variant="career"
      audience="employer"
      eyebrow="Employer Career"
      icon={<CreateIcon />}
      title="Create a long-term career post"
      subtitle="Role details, requirements, interview steps, and final review"
      description="Publish a stable Career Job for permanent hiring pipelines."
    />
  );
}
