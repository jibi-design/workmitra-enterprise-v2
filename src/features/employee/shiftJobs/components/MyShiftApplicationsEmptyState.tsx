// App name: Job Mitra | MyShiftApplicationsEmptyState.tsx — EnterpriseEmpty (Wave A)

import { EnterpriseEmpty } from "../../../../shared/components/enterprise";

export function MyShiftApplicationsEmptyState({
  domain = "shift",
  onFindShifts,
}: {
  domain?: "shift" | "planner";
  onFindShifts: () => void;
}) {
  const isPlanner = domain === "planner";

  return (
    <EnterpriseEmpty
      domain={isPlanner ? "planner" : "shift"}
      title="No applications yet"
      subtitle={
        isPlanner
          ? "Browse Gig Projects and apply to multi-day plans to track bundle status here."
          : "Find shifts and apply to start tracking employer review and updates here."
      }
      primaryLabel={isPlanner ? "Browse Projects" : "Find Shifts"}
      onPrimary={onFindShifts}
      testId="shift-applications-empty"
    />
  );
}
