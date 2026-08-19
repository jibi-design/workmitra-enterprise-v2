/** Employee home compact pending hub — RSVP, offer, reviews. */

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PendingActionsHub } from "../../../../shared/components/PendingActionsHub";
import { useEmployeeRoleHomePendingActions } from "../../../../shared/pendingActions/hooks/useEmployeeRoleHomePendingActions";
import { useEmployeeUrgentPendingHubItems } from "../../../../shared/pendingActions/hooks/useEmployeeUrgentPendingHubItems";

export function EmployeeHomePendingHub() {
  const nav = useNavigate();
  const urgent = useEmployeeUrgentPendingHubItems(nav);
  const reviews = useEmployeeRoleHomePendingActions(nav);
  const items = useMemo(() => [...urgent, ...reviews], [reviews, urgent]);
  return <PendingActionsHub variant="compact" items={items} />;
}
