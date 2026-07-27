// App name: Job Mitra | EmployeeCareerSearchHeader.tsx — DomainHero (full Career)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";

function SearchIcon() {
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
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

export function EmployeeCareerSearchHeader() {
  return (
    <DomainHero
      variant="career"
      audience="employee"
      eyebrow="Career Search"
      icon={<SearchIcon />}
      title="Find your next career"
      subtitle="Search, save, and review career jobs from one clean workspace"
      description="Filter by location and role, then open posts that match your skills."
    />
  );
}
