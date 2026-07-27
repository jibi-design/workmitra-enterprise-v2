// App name: Job Mitra | ShiftWorkspaceNotFound.tsx — EnterpriseEmpty (Wave C)

import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { EnterpriseEmpty } from "../../../../shared/components/enterprise";

export function ShiftWorkspaceNotFound() {
  const nav = useNavigate();

  return (
    <div className="wm-ee-vShift wm-stackGrid" data-testid="shift-workspace-not-found">
      <EnterpriseEmpty
        domain="shift"
        title="This work group is not available"
        subtitle="The link may be outdated, or the group was closed. Use Back or open your workspaces list."
        primaryLabel="My Work Groups"
        onPrimary={() => nav(ROUTE_PATHS.employeeShiftWorkspaces)}
        secondaryLabel="Find Shifts"
        onSecondary={() => nav(ROUTE_PATHS.employeeShiftSearch)}
        testId="shift-workspace-missing"
      />
    </div>
  );
}
