// App name: Job Mitra | EmployeeCareerApplicationsHero.tsx — DomainHero (full Career)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";

function ApplicationsIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

export function EmployeeCareerApplicationsHero({ onFindJobs }: { onFindJobs: () => void }) {
  return (
    <DomainHero
      variant="career"
      audience="employee"
      eyebrow="Career Applications"
      icon={<ApplicationsIcon />}
      title="Track your application journey"
      subtitle="Review applications, interviews, offers, and outcomes"
      description="Stay on top of every Career pipeline step from apply to outcome."
      trailing={
        <button type="button" className="wm-outlineBtn" onClick={onFindJobs} aria-label="Find jobs">
          Find Jobs
        </button>
      }
    />
  );
}
