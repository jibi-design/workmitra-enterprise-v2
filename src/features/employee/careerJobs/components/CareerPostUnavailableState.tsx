// App name: Job Mitra
// File name: CareerPostUnavailableState.tsx
// Wave 3 — enterprise Empty + alert

import { EnterpriseEmpty } from "../../../../shared/components/enterprise";

type CareerPostUnavailableStateProps = {
  onBack: () => void;
};

export function CareerPostUnavailableState({ onBack }: CareerPostUnavailableStateProps) {
  return (
    <div className="wm-stackGrid" style={{ padding: 16 }} role="alert">
      <EnterpriseEmpty
        domain="career"
        title="Job details unavailable"
        subtitle="This career post is no longer available. It may have closed, filled, or been removed."
        primaryLabel="Back to Search"
        onPrimary={onBack}
        testId="career-post-unavailable"
      />
    </div>
  );
}
