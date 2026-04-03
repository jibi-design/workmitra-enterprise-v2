// src/app/router/NotFoundPage.tsx
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "./routePaths";
import { roleStorage, type AppRole } from "../storage/roleStorage";

function getHomeForRole(role: AppRole): string {
  if (role === "employee") return ROUTE_PATHS.employeeHome;
  if (role === "employer") return ROUTE_PATHS.employerHome;
  return ROUTE_PATHS.adminHome;
}

export function NotFoundPage() {
  const loc = useLocation();
  const nav = useNavigate();

  const target = useMemo(() => {
    const role = roleStorage.get();
    if (!role) return ROUTE_PATHS.landing;
    return getHomeForRole(role);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--wm-bg, #0b1220)" }}>
      <div className="wm-container" style={{ paddingTop: 18 }}>
        <div
          style={{
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.04)",
            padding: 16,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 18, letterSpacing: 0.2 }}>Page not found</h1>
          <p style={{ marginTop: 8, opacity: 0.85, lineHeight: 1.5 }}>
            This route doesn’t exist in Phase-0 demo.
            <br />
            <span style={{ opacity: 0.75, fontSize: 13 }}>Path: {loc.pathname}</span>
          </p>

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button className="wm-btn wm-btnPrimary" type="button" onClick={() => nav(target, { replace: true })}>
              Go Home
            </button>
            <button className="wm-btn wm-btnOutline" type="button" onClick={() => nav(ROUTE_PATHS.landing, { replace: true })}>
              Choose Workspace
            </button>
          </div>

          <p style={{ marginTop: 12, opacity: 0.7, fontSize: 12, lineHeight: 1.5 }}>
            Note: This is a demo build. No real verification, OTP, payments, or messaging.
          </p>
        </div>
      </div>
    </div>
  );
}