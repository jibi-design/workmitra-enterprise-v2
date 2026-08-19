/** Employer home compact pending hub — offer, confirm, reviews. */

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PendingActionsHub } from "../../../../shared/components/PendingActionsHub";
import { useEmployerOfferPendingHubItems } from "../../../../shared/pendingActions/hooks/useEmployerOfferPendingHubItems";
import { useEmployerRoleHomePendingActions } from "../../../../shared/pendingActions/hooks/useEmployerRoleHomePendingActions";
import { useEmployerShiftConfirmPendingHubItems } from "../../../../shared/pendingActions/hooks/useEmployerShiftConfirmPendingHubItems";

export function EmployerHomePendingHub() {
  const nav = useNavigate();
  const offers = useEmployerOfferPendingHubItems(nav);
  const confirms = useEmployerShiftConfirmPendingHubItems(nav);
  const reviews = useEmployerRoleHomePendingActions(nav);
  const items = useMemo(
    () => [...confirms, ...offers, ...reviews],
    [confirms, offers, reviews],
  );
  return <PendingActionsHub variant="compact" items={items} />;
}
