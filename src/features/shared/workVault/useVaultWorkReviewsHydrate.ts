/** Job Mitra | useVaultWorkReviewsHydrate.ts | Fetch work_reviews into ratingStorage */

import { useEffect, useState } from "react";
import { hydrateWorkReviewsFromServer } from "../../shift/services/hydrateWorkReviewsFromServer";

export function useVaultWorkReviewsHydrate(role: "employer" | "employee"): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let cancelled = false;
    void hydrateWorkReviewsFromServer(role).then(() => {
      if (!cancelled) setTick((value) => value + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [role]);
  return tick;
}
