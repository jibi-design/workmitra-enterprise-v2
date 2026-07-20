/** Job Mitra | navigation.runtime.ts — domain nav resolved with Phase 2 feature flag */

import { Users } from "lucide-react";
import { ROUTE_PATHS } from "../app/router/routePaths";
import { showPhase2Features } from "../shared/config/featureFlags";
import { NAVIGATION_CONFIG, type DomainConfig, type NavDomain } from "./navigation.config";

export function resolveDomainNavConfig(domain: NavDomain): DomainConfig {
  if (!showPhase2Features && domain === "hr") {
    return NAVIGATION_CONFIG.employerDefault;
  }

  const base = NAVIGATION_CONFIG[domain];

  if (showPhase2Features && domain === "employeeDefault") {
    return {
      ...base,
      items: [
        ...base.items.slice(0, 3),
        {
          label: "Workforce",
          path: ROUTE_PATHS.employeeWorkforceHome,
          icon: Users,
          domain: "employeeDefault",
        },
        base.items[3]!,
      ],
    };
  }

  if (showPhase2Features && domain === "employerDefault") {
    return {
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
  }

  return base;
}
