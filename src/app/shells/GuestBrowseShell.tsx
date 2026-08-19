/** Phase 4 — Guest browse shell (no EmployeeShell / no RequireActiveContext). */

import { Link, Outlet, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../router/routePaths";
import { JobMitraBrandName } from "../../shared/components/brand/BrandName";
import { useThemeBundle } from "./useThemeBundle";

export function GuestBrowseShell() {
  const nav = useNavigate();
  useThemeBundle("employee-shell");

  return (
    <div className="wm-shellRoot wm-shellEmployee" data-testid="guest-browse-shell">
      <header
        className="wm-topbar"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "10px 14px",
          background: "rgba(255,255,255,0.92)",
          borderBottom: "1px solid rgba(226,232,240,0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        <button
          type="button"
          className="wm-outlineBtn"
          onClick={() => nav(ROUTE_PATHS.explore)}
          aria-label="Job Mitra"
          style={{ fontWeight: 800 }}
        >
          <JobMitraBrandName as="span" />
        </button>
        <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <Link to={ROUTE_PATHS.guestShifts} style={{ fontSize: 13, fontWeight: 750 }}>
            Shifts
          </Link>
          <Link to={ROUTE_PATHS.guestCareers} style={{ fontSize: 13, fontWeight: 750 }}>
            Careers
          </Link>
          <Link to={ROUTE_PATHS.login} className="wm-primarybtn" style={{ fontSize: 12 }}>
            Sign in
          </Link>
        </nav>
      </header>

      <div className="wm-container" style={{ paddingBottom: 32 }}>
        <Outlet />
      </div>
    </div>
  );
}
