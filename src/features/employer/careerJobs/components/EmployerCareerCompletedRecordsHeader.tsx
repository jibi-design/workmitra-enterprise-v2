// App name: Job Mitra | EmployerCareerCompletedRecordsHeader.tsx — DomainHero (Wave 2)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";

export function EmployerCareerCompletedRecordsHeader() {
  return (
    <DomainHero
      variant="career"
      audience="employer"
      eyebrow="Closed employment"
      icon={<CompletedRecordsHeroIcon />}
      title="Completed Career Records"
      subtitle="Exited staff and closed work history"
      description="Feedback status and long-term staff lookup stay here, separate from active workspace."
    />
  );
}

function CompletedRecordsHeroIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm4 18H6V4h7v5h5v11Zm-3.5-5.5-1.41-1.41L11 15.17l-1.09-1.09L8.5 15.5 11 18l3.5-3.5Z"
      />
    </svg>
  );
}
