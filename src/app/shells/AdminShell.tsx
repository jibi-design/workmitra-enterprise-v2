// src/app/shells/AdminShell.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { roleStorage } from "../storage/roleStorage";
import { ROUTE_PATHS } from "../router/routePaths";

export function AdminShell() {
  const role = roleStorage.get();
  const loc = useLocation();

  if (role !== "admin") {
    return <Navigate to={ROUTE_PATHS.landing} state={{ from: loc.pathname }} replace />;
  }

  return (
    <div className="wm-admin-bg" style={{ minHeight: "100vh" }}>
      <div className="wm-topbar wm-admin-topbar">
        <div className="wm-title">
          <h1>WorkMitra</h1>
          <p>Admin Control</p>
        </div>
        <button className="wm-iconbtn" type="button" aria-label="Alerts">
          ⚠️
        </button>
      </div>

      <div className="wm-container">
        <Outlet />
      </div>
    </div>
  );
}