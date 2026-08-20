/** Dashboard mount: hydrate live APIs once; keep last snapshot on error. */

import { useEffect, useState } from "react";
import { hydrateEmployerOsLiveFeeds } from "../helpers/employerDashboard.osLive.hydrate";

export type OsLiveFeedState = "loading" | "ready" | "error";

export type EmployerOsLiveHydrate = {
  readonly state: OsLiveFeedState;
  readonly hrClockedIn: number;
};

export function useEmployerOsLiveHydrate(): EmployerOsLiveHydrate {
  const [state, setState] = useState<OsLiveFeedState>("loading");
  const [hrClockedIn, setHrClockedIn] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void hydrateEmployerOsLiveFeeds()
      .then((result) => {
        if (cancelled) return;
        setHrClockedIn(result.hrClockedIn);
        setState(result.ok ? "ready" : "error");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { state, hrClockedIn };
}
