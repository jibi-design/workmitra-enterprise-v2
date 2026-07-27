// App name: Job Mitra | CareerCandidateReviewHeader.tsx — DomainHero (full Career)

import { DomainHero } from "../../../../../shared/components/layout/DomainHero";

export function CareerCandidateReviewHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <DomainHero
      variant="career"
      audience="employer"
      eyebrow="Employer review console"
      title={title}
      subtitle={subtitle}
      description="Review the submitted application before shortlist or interview decisions."
    />
  );
}
