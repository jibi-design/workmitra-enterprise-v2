/** Job Mitra | useDynamicNav.ts | Resolves domain-themed bottom navigation for the active route */

import { useLocation } from "react-router-dom";
import type { NavItem } from "../config/navigation.config";
import { resolveDomainNavConfig } from "../config/navigation.runtime";
import { ROUTE_PATHS } from "../app/router/routePaths";
import { isNavItemActive, resolveNavDomain } from "./navigation.helpers";
import { useEmployeeShiftMyWorkUnreadBadge } from "../features/employee/shiftJobs/hooks/useEmployeeShiftMyWorkUnreadBadge";

export type EnrichedNavItem = NavItem & {
  hasUnreadBadge?: boolean;
  isActive: boolean;
};

export const useDynamicNav = () => {
  const location = useLocation();
  const path = location.pathname;
  const activeDomain = resolveNavDomain(path);
  const domainConfig = resolveDomainNavConfig(activeDomain);
  const myWorkUnread = useEmployeeShiftMyWorkUnreadBadge();

  const navItems: EnrichedNavItem[] = domainConfig.items.map((item) => ({
    ...item,
    isActive: isNavItemActive(path, item),
    hasUnreadBadge:
      activeDomain === "shift" &&
      item.path === ROUTE_PATHS.employeeShiftApplications &&
      myWorkUnread,
  }));

  /** Home = neutral slate; Dashboard route = teal (never Career blue / purple). */
  const themeColor = path.startsWith(ROUTE_PATHS.employerDashboard)
    ? "#0f766e"
    : domainConfig.color;

  return {
    navItems,
    themeColor,
    bgTint: domainConfig.bgTint,
    borderTint: domainConfig.borderTint,
    activeDomain,
    currentPath: path,
  };
};
