// App name: Job Mitra | EmployerVaultViewHeader.tsx — DomainHero (Wave 5)

import { DomainHero } from "../../../../../shared/components/layout/DomainHero";

type Props = {
  isActive: boolean;
  onBack: () => void;
};

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2Z" />
    </svg>
  );
}

export function EmployerVaultViewHeader({ isActive, onBack }: Props) {
  return (
    <DomainHero
      variant="settings"
      audience="employer"
      icon={
        <button type="button" className="wm-domainHeroIconBtn" onClick={onBack} aria-label="Back">
          <IconBack />
        </button>
      }
      title="Employee Profile"
      subtitle={isActive ? "Full access · session active" : "OTP verification required to unlock"}
      description="Trust Vault profile view with session-gated document access."
    />
  );
}
