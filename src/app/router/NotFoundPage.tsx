// src/app/router/NotFoundPage.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "./routePaths";
import type { AppRole } from "../storage/roleStorage";
import { useAppRole } from "./guards/useAppRole";
import { AUTH_BACKEND_ENABLED } from "../../shared/config/authConfig";

function getHomeForRole(role: AppRole): string {
  if (role === "employee") return ROUTE_PATHS.employeeHome;
  if (role === "employer") return ROUTE_PATHS.employerHome;
  return ROUTE_PATHS.adminHome;
}

export function NotFoundPage() {
  const loc = useLocation();
  const nav = useNavigate();
  const role = useAppRole();

  const workspaceTarget = AUTH_BACKEND_ENABLED ? ROUTE_PATHS.login : ROUTE_PATHS.landing;
  const homeTarget = role ? getHomeForRole(role) : workspaceTarget;

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
            This route doesn’t exist.
            <br />
            <span style={{ opacity: 0.75, fontSize: 13 }}>Path: {loc.pathname}</span>
          </p>

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button
              className="wm-btn wm-btnPrimary"
              type="button"
              onClick={() => nav(homeTarget, { replace: true })}
            >
              Go Home
            </button>
            <button
              className="wm-btn wm-btnOutline"
              type="button"
              onClick={() => nav(workspaceTarget, { replace: true })}
            >
              {AUTH_BACKEND_ENABLED ? "Sign in" : "Choose Workspace"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
