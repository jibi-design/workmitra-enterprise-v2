/** Job Mitra | useDynamicNav.ts | Resolves domain-themed bottom navigation for the active route */

import { useLocation } from "react-router-dom";
import { usePulseStore } from "../features/pulse/pulseStore";
import type { NavItem } from "../config/navigation.config";
import { resolveDomainNavConfig } from "../config/navigation.runtime";
import { ROUTE_PATHS } from "../app/router/routePaths";
import { isNavItemActive, resolveNavDomain } from "./navigation.helpers";
import { useEmployeeShiftMyWorkUnreadBadge } from "../features/employee/shiftJobs/hooks/useEmployeeShiftMyWorkUnreadBadge";

export type EnrichedNavItem = NavItem & {
  isPulsing: boolean;
  hasUnreadBadge?: boolean;
  isActive: boolean;
};

export const useDynamicNav = () => {
  const location = useLocation();
  const path = location.pathname;
  const pulseChain = usePulseStore((s) => s.chain);

  const activeDomain = resolveNavDomain(path);
  const domainConfig = resolveDomainNavConfig(activeDomain);
  const myWorkUnread = useEmployeeShiftMyWorkUnreadBadge();

  const navItems: EnrichedNavItem[] = domainConfig.items.map((item) => ({
    ...item,
    isActive: isNavItemActive(path, item),
    isPulsing:
      item.pulseNodeIds !== undefined &&
      item.pulseNodeIds.length > 0 &&
      item.pulseNodeIds.some((id) => pulseChain.includes(id)),
    hasUnreadBadge:
      activeDomain === "shift" &&
      item.path === ROUTE_PATHS.employeeShiftApplications &&
      myWorkUnread,
  }));

  return {
    navItems,
    themeColor: domainConfig.color,
    bgTint: domainConfig.bgTint,
    borderTint: domainConfig.borderTint,
    activeDomain,
    currentPath: path,
  };
};
