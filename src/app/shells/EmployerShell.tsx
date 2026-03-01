// src/app/shells/EmployerShell.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { roleStorage } from "../storage/roleStorage";
import { ROUTE_PATHS } from "../router/routePaths";

export function EmployerShell() {
  const role = roleStorage.get();
  const loc = useLocation();

  if (role !== "employer") {
    return <Navigate to={ROUTE_PATHS.landing} state={{ from: loc.pathname }} replace />;
  }

  return (
    <div className="wm-er-bg" style={{ minHeight: "100vh" }}>
      <div className="wm-topbar wm-er-topbar">
        <div className="wm-title">
          <h1>WorkMitra</h1>
          <p>Employer</p>
        </div>
        <button className="wm-iconbtn" type="button" aria-label="Settings" title="Settings">
          ⚙️
        </button>
      </div>

      <div className="wm-container">
        <Outlet />
      </div>
    </div>
  );
}