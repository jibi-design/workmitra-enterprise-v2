/** Job Mitra | AuthSessionBootstrap.tsx */

import { useEffect } from "react";
import { AUTH_BACKEND_ENABLED } from "../config/authConfig";
import { useAuthStore } from "../store/authStore";

export function AuthSessionBootstrap() {
  const hydrateSession = useAuthStore((s) => s.hydrateSession);
  const sessionChecked = useAuthStore((s) => s.sessionChecked);

  useEffect(() => {
    if (AUTH_BACKEND_ENABLED) {
      void hydrateSession();
    }
  }, [hydrateSession]);

  if (AUTH_BACKEND_ENABLED && !sessionChecked) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F8FAFC",
          zIndex: 9998,
        }}
        aria-busy="true"
        aria-label="Loading session"
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            border: "3px solid #1d4ed8",
            borderTopColor: "transparent",
            animation: "wm-spin 0.6s linear infinite",
          }}
        />
      </div>
    );
  }

  return null;
}
