// App name: Job Mitra | EmployerShiftTemplatesHeader.tsx — DomainHero (Wave 3)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";

type Props = {
  totalCount: number;
};

export function EmployerShiftTemplatesHeader({ totalCount }: Props) {
  return (
    <DomainHero
      variant="shift"
      audience="employer"
      icon={<TemplatesHeroIcon />}
      title="Shift Templates"
      subtitle="Reuse saved shift post formats"
      description='Save a template from My Posts with "Save as Template", then use it here to pre-fill create.'
      trailing={<span className="wm-domainHeroBadge">{totalCount} saved</span>}
    />
  );
}

function TemplatesHeroIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm0 16H5V5h14v14ZM7 7h10v2H7V7Zm0 4h10v2H7v-2Zm0 4h7v2H7v-2Z"
      />
    </svg>
  );
}
