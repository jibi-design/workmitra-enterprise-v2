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
      title="No estimated earnings yet"
      subtitle={
        isPlanner
          ? "Estimated gig pay appears after confirmed plan days. These are estimates only — not payroll. Direct payouts are planned for a later release."
          : "Estimated Earnings appear after you are confirmed. These figures are planning estimates only — not payroll, payout, or settlement (planned for v2.1)."
      }
      primaryLabel={isPlanner ? "Browse Projects" : "Find Shifts"}
      onPrimary={() =>
        nav(isPlanner ? ROUTE_PATHS.employeePlannerBrowse : ROUTE_PATHS.employeeShiftSearch)
      }
      testId="shift-earnings-empty"
    />
  );
}
