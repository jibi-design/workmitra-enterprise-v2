/** Job Mitra | useMyShiftApplicationsLanding.ts */

import { useEffect, useRef, useState } from "react";
import type {
  ApplicationTab,
  ShiftApplicationData,
} from "../../shiftJobs/types/shiftApplicationTypes";
import { resolveEmployeeShiftApplicationsTab } from "../../shiftJobs/helpers/shiftApplications.smartResume";

const ALLOWED: readonly ApplicationTab[] = ["all", "active", "confirmed", "closed"];

export function useMyShiftApplicationsLanding(
  domainApps: readonly ShiftApplicationData[],
  tabFromUrl: string | null,
): [ApplicationTab, (tab: ApplicationTab) => void] {
  const [tab, setTab] = useState<ApplicationTab>("all");
  const landedRef = useRef(false);

  useEffect(() => {
    if (landedRef.current) return;
    if (tabFromUrl && ALLOWED.includes(tabFromUrl as ApplicationTab)) {
      queueMicrotask(() => setTab(tabFromUrl as ApplicationTab));
      landedRef.current = true;
      return;
    }
    if (domainApps.length === 0) return;
    const next = resolveEmployeeShiftApplicationsTab(domainApps);
    queueMicrotask(() => setTab(next));
    landedRef.current = true;
  }, [domainApps, tabFromUrl]);

  return [tab, setTab];
}
