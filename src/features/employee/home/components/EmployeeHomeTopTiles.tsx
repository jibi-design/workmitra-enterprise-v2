/** Job Mitra | EmployeeHomeTopTiles.tsx | Welcome greeting + unified status strips */

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { HomeGreetingStrip } from "../../../../shared/home/HomeGreetingStrip";
import { HomeStatusStripStack } from "../../../../shared/home/HomeWelcomeStack";
import { useEmployeeRoleHomePendingActions } from "../../../../shared/pendingActions/hooks/useEmployeeRoleHomePendingActions";
import { useEmployeeUrgentPendingHubItems } from "../../../../shared/pendingActions/hooks/useEmployeeUrgentPendingHubItems";
import { useEmployeeHomeNotice } from "../hooks/useEmployeeHomeNotice";

type Props = {
  readonly userName: string;
};

export function EmployeeHomeTopTiles({ userName }: Props) {
  return (
    <HomeGreetingStrip displayName={userName.trim() || "You"} testId="employee-home-compact-header" />
  );
}

export function EmployeeHomeBanners() {
  const ticker = useEmployeeHomeNotice();
  const nav = useNavigate();
  const urgent = useEmployeeUrgentPendingHubItems(nav);
  const reviews = useEmployeeRoleHomePendingActions(nav);
  const extraPendingCount = useMemo(
    () => [...urgent, ...reviews].reduce((sum, item) => sum + item.count, 0),
    [reviews, urgent],
  );
  return (
    <HomeStatusStripStack
      tickerTestId="employee-home-inbox-ticker"
      tickerRole="employee"
      tickerItem={ticker.item}
      tickerItems={ticker.items}
      onOpenTickerItem={ticker.onOpenItem}
      extraPendingCount={extraPendingCount}
    />
  );
}
