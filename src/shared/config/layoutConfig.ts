/** Job Mitra | layoutConfig.ts | src/shared/config/layoutConfig.ts */

/**
 * ARCHITECTURE NOTE:
 * Central control for UI behavior based on routes.
 * Decouples the decision of "what to show where" from individual components.
 */

/**
 * AUDIT NOTE:
 * Fixed circular reference in getLayoutConfig helper to resolve TS7022 and TS6133.
 */

interface PageConfig {
  hasBottomNav: boolean;
  hasTopBar: boolean;
  theme: "light" | "dark" | "transparent";
}

export const LAYOUT_CONFIG: Record<string, PageConfig> = {
  "/employee": {
    hasBottomNav: true,
    hasTopBar: true,
    theme: "light",
  },
  "/employer": {
    hasBottomNav: true,
    hasTopBar: true,
    theme: "light",
  },
  "/admin": {
    hasBottomNav: false,
    hasTopBar: true,
    theme: "dark",
  },
  "/": {
    hasBottomNav: false,
    hasTopBar: false,
    theme: "transparent",
  },
};

/**
 * Helper function to retrieve UI configuration for the active URL path.
 * Matches the current pathname against the defined LAYOUT_CONFIG keys.
 */
export const getLayoutConfig = (pathname: string): PageConfig => {
  // Corrected find logic: matching against the 'route' argument, not the variable itself.
  const baseRoute = Object.keys(LAYOUT_CONFIG).find((route) => pathname.startsWith(route));

  // Return matched config, or fallback to the root/default configuration
  return LAYOUT_CONFIG[baseRoute || "/"] || LAYOUT_CONFIG["/"];
};
