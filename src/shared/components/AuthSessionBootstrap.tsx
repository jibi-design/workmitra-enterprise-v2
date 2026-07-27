/** Job Mitra | AuthSessionBootstrap.tsx */

import { useEffect } from "react";
import { AUTH_BACKEND_ENABLED } from "../config/authConfig";
import { useAuthStore } from "../store/authStore";
import { subscribeAuthSessionEpoch } from "../auth/authSessionSync";
import { RouteGuardLoading } from "./routes/RouteGuardStatus";

export function AuthSessionBootstrap() {
  const hydrateSession = useAuthStore((s) => s.hydrateSession);
  const sessionChecked = useAuthStore((s) => s.sessionChecked);

  useEffect(() => {
    if (AUTH_BACKEND_ENABLED) {
      void hydrateSession();
    }
  }, [hydrateSession]);

  useEffect(() => {
    if (!AUTH_BACKEND_ENABLED) return;
    return subscribeAuthSessionEpoch((epoch) => {
      const current = useAuthStore.getState().user;
      const currentId = current?.id ?? null;
      const currentRole = current?.role ?? null;
      if (epoch.userId === currentId && epoch.role === currentRole) return;
      void hydrateSession();
    });
  }, [hydrateSession]);

  if (AUTH_BACKEND_ENABLED && !sessionChecked) {
    return <RouteGuardLoading overlay label="Loading session" />;
  }

  return null;
}
