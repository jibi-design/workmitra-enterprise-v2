// src/app/router/NotFoundPage.tsx
import { useEffect } from "react";
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

function decodeOverEncodedPath(pathname: string): string | null {
  if (!/%2[fF]/.test(pathname)) return null;
  try {
    let decoded = pathname;
    for (let i = 0; i < 3; i += 1) {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    }
    if (!decoded.startsWith("/") || decoded === pathname) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function NotFoundPage() {
  const loc = useLocation();
  const nav = useNavigate();
  const role = useAppRole();

  useEffect(() => {
    const fixed = decodeOverEncodedPath(loc.pathname);
    if (fixed) nav(fixed, { replace: true });
  }, [loc.pathname, nav]);

  const workspaceTarget = AUTH_BACKEND_ENABLED ? ROUTE_PATHS.login : ROUTE_PATHS.landing;
  const homeTarget = role ? getHomeForRole(role) : workspaceTarget;

  return (
    <div className="wm-notFound">
      <div className="wm-notFound__card">
        <div className="wm-notFound__eyebrow">404</div>
        <h1 className="wm-notFound__title">Page not found</h1>
        <p className="wm-notFound__body">
          This route doesn&apos;t exist.
          <span className="wm-notFound__path">Path: {loc.pathname}</span>
        </p>

        <div className="wm-notFound__actions">
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
  );
}
