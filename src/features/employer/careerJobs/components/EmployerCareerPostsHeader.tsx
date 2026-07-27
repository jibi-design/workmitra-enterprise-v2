// App name: Job Mitra | EmployerCareerPostsHeader.tsx — DomainHero (Wave 2)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";

type EmployerCareerPostsHeaderProps = {
  onCreate: () => void;
};

export function EmployerCareerPostsHeader({ onCreate }: EmployerCareerPostsHeaderProps) {
  return (
    <DomainHero
      variant="career"
      audience="employer"
      eyebrow="Career posts"
      icon={<CareerPostsHeroIcon />}
      title="Career Post List"
      subtitle="Active posts appear first"
      description="Filled, paused, draft, and closed posts stay available for review and future reuse."
      trailing={
        <button className="wm-primarybtn" type="button" onClick={onCreate}>
          Create Career Job
        </button>
      }
    />
  );
}

function CareerPostsHeroIcon() {
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
