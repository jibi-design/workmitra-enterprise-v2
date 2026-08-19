/** Job Mitra | AuthSessionBootstrap.tsx */

import { useEffect } from "react";
import { AUTH_BACKEND_ENABLED } from "../config/authConfig";
import { useAuthStore } from "../store/authStore";
import { subscribeAuthSessionEpoch } from "../auth/authSessionSync";
import { applyPulseStoreFromStorage } from "../../features/pulse/pulseStore";

export function AuthSessionBootstrap() {
  const hydrateSession = useAuthStore((s) => s.hydrateSession);
  const sessionChecked = useAuthStore((s) => s.sessionChecked);
  const pulseScope = useAuthStore((s) => s.user?.activeMode ?? s.user?.role ?? "guest");

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

  useEffect(() => {
    if (!sessionChecked && AUTH_BACKEND_ENABLED) return;
    applyPulseStoreFromStorage();
  }, [pulseScope, sessionChecked]);

  return null;
}
