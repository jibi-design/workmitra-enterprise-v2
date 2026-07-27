// App name: Job Mitra | EmployeeEarningsEmptyState.tsx — EnterpriseEmpty (Wave B)

import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { EnterpriseEmpty } from "../../../../shared/components/enterprise";

type Props = {
  domain?: "shift" | "planner";
};

export function EmployeeEarningsEmptyState({ domain = "shift" }: Props) {
  const nav = useNavigate();
  const isPlanner = domain === "planner";

  return (
    <EnterpriseEmpty
      domain={isPlanner ? "planner" : "shift"}
      title="No earnings yet"
      subtitle={
        isPlanner
          ? "Estimated gig pay appears after confirmed plan days. Direct payouts are planned for a later release."
          : "Estimated totals appear after you are confirmed. Direct payout and settlement are planned for v2.1."
      }
      primaryLabel={isPlanner ? "Browse Projects" : "Find Shifts"}
      onPrimary={() =>
        nav(isPlanner ? ROUTE_PATHS.employeePlannerBrowse : ROUTE_PATHS.employeeShiftSearch)
      }
      testId="shift-earnings-empty"
    />
  );
}
