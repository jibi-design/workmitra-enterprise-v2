// App name: Job Mitra | EmployerWorkforceAnnounceHeader.tsx — DomainHero (Wave 5)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { IconBack } from "../../../../shared/domains/workforce/ui/workforceIcons";

type Step = 1 | 2 | 3 | 4 | 5;

type Props = {
  step: Step;
  stepLabels: Record<Step, string>;
  onBack: () => void;
};

export function EmployerWorkforceAnnounceHeader({ step, stepLabels, onBack }: Props) {
  return (
    <DomainHero
      variant="workforce"
      audience="employer"
      icon={
        <button type="button" className="wm-domainHeroIconBtn" onClick={onBack} aria-label="Back">
          <IconBack />
        </button>
      }
      title="New Announcement"
      subtitle={`Step ${step} · ${stepLabels[step]}`}
      description="Create a workforce announcement for your staff groups."
    />
  );
}
