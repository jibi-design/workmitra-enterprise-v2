/** Job Mitra | navigation.runtime.ts — domain nav resolved with feature flags */

import { Radio, Users } from "lucide-react";
import { ROUTE_PATHS } from "../app/router/routePaths";
import { showPhase2Features, showShiftOpsFeatures } from "../shared/config/featureFlags";
import { NAVIGATION_CONFIG, type DomainConfig, type NavDomain } from "./navigation.config";

export function resolveDomainNavConfig(domain: NavDomain): DomainConfig {
  if (!showPhase2Features && domain === "hr") {
    return NAVIGATION_CONFIG.employerDefault;
  }

  const base = NAVIGATION_CONFIG[domain];

  const employeeHomeLike = domain === "employeeDefault" || domain === "diary";

  if (showPhase2Features && employeeHomeLike) {
    const withWorkforce: DomainConfig = {
      ...base,
      items: [
        ...base.items.slice(0, 3),
        {
          label: "Workforce",
          path: ROUTE_PATHS.employeeWorkforceHome,
          icon: Users,
          domain: domain === "diary" ? "diary" : "employeeDefault",
        },
        base.items[3]!,
      ],
    };
    if (!showShiftOpsFeatures) return withWorkforce;
    return {
      ...withWorkforce,
      items: [
        ...withWorkforce.items,
        {
          label: "Shift Ops",
          path: ROUTE_PATHS.employeeShiftOpsHub,
          icon: Radio,
          domain: domain === "diary" ? "diary" : "employeeDefault",
        },
      ],
    };
  }

  if (showPhase2Features && domain === "employerDefault") {
    const withWorkforce: DomainConfig = {
      ...base,
      items: [
        ...base.items,
        {
          label: "Workforce",
          path: ROUTE_PATHS.employerWorkforceHome,
          icon: Users,
          domain: "employerDefault",
        },
      ],
    };
    if (!showShiftOpsFeatures) return withWorkforce;
    return {
      ...withWorkforce,
      items: [
        ...withWorkforce.items,
        {
          label: "Shift Ops",
          path: ROUTE_PATHS.employerShiftOpsApprovals,
          icon: Radio,
          domain: "employerDefault",
        },
      ],
    };
  }

  if (showShiftOpsFeatures && employeeHomeLike) {
    return {
      ...base,
      items: [
        ...base.items,
        {
          label: "Shift Ops",
          path: ROUTE_PATHS.employeeShiftOpsHub,
          icon: Radio,
          domain: domain === "diary" ? "diary" : "employeeDefault",
        },
      ],
    };
  }

  if (showShiftOpsFeatures && domain === "employerDefault") {
    return {
      ...base,
      items: [
        ...base.items,
        {
          label: "Shift Ops",
          path: ROUTE_PATHS.employerShiftOpsApprovals,
          icon: Radio,
          domain: "employerDefault",
        },
      ],
    };
  }

  if (showShiftOpsFeatures && domain === "shift") {
    return {
      ...base,
      items: [
        ...base.items,
        {
          label: "Shift Ops",
          path: ROUTE_PATHS.employeeShiftOpsHub,
          icon: Radio,
          domain: "shift",
        },
      ],
    };
  }

  if (showShiftOpsFeatures && domain === "employerShift") {
    return {
      ...base,
      items: [
        ...base.items,
        {
          label: "Shift Ops",
          path: ROUTE_PATHS.employerShiftOpsApprovals,
          icon: Radio,
          domain: "employerShift",
        },
      ],
    };
  }

  return base;
}
