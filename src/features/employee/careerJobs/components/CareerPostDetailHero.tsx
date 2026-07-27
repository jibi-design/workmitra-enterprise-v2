// App name: Job Mitra | CareerPostDetailHero.tsx — DomainHero (full Career)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";

type CareerPostDetailHeroProps = {
  jobTitle: string;
  companyName: string;
  department?: string;
};

function BriefcaseIcon() {
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

function formatDisplayTitle(value: string): string {
  return value
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

export function CareerPostDetailHero({
  jobTitle,
  companyName,
  department,
}: CareerPostDetailHeroProps) {
  return (
    <DomainHero
      variant="career"
      audience="employee"
      eyebrow="Career role"
      icon={<BriefcaseIcon />}
      title={formatDisplayTitle(jobTitle)}
      subtitle={`${companyName}${department ? ` · ${department}` : ""}`}
      description="Review role details, requirements, and apply when ready."
    />
  );
}
