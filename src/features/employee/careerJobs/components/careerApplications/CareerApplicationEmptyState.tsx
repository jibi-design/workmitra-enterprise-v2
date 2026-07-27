// App name: Job Mitra
// File name: CareerApplicationEmptyState.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\careerApplications\CareerApplicationEmptyState.tsx

import { CareerEmptyState } from "../../../../career/components/CareerEmptyState";

export function EmptyState({ onFind }: { onFind: () => void }) {
  return (
    <CareerEmptyState
      title="No applications in this view"
      subtitle="Apply to active Career Jobs to start tracking your progress here."
      ctaLabel="Find Career Jobs"
      onCta={onFind}
    />
  );
}
