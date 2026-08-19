/** Job Mitra | PulseTrailProvider.tsx | Mount point — destination click owns resolve */

import type { ReactNode } from "react";

/**
 * Breathing lights follow the current hop. Clicking that hop advances the chain
 * so the next page can light. Destination click clears the trail.
 */
export function PulseTrailProvider({ children }: { readonly children: ReactNode }) {
  return <>{children}</>;
}
