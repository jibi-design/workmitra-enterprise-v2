/** Hook: load a theme CSS bundle once on mount. */

import { useEffect } from "react";
import { ensureThemeBundle, type ThemeBundleId } from "../theme/ensureThemeBundle";

export function useThemeBundle(bundleId: ThemeBundleId): void {
  useEffect(() => {
    ensureThemeBundle(bundleId);
  }, [bundleId]);
}
