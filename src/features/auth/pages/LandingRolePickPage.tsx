// src/features/auth/pages/LandingRolePickPage.tsx
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { roleStorage, type AppRole } from "../../../app/storage/roleStorage";

function goTo(role: AppRole, nav: ReturnType<typeof useNavigate>) {
  roleStorage.set(role);

  if (role === "employee") nav(ROUTE_PATHS.employeeHome, { replace: true });
  else if (role === "employer") nav(ROUTE_PATHS.employerHome, { replace: true });
  else nav(ROUTE_PATHS.adminHome, { replace: true });
}

export function LandingRolePickPage() {
  const nav = useNavigate();
  const existing = roleStorage.get();

  return (
    <div className="wm-container" style={{ paddingTop: "24px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ fontWeight: 1000, fontSize: "18px" }}>WorkMitra Enterprise</div>
        <div style={{ color: "var(--wm-emp-muted)", fontSize: "12px" }}>
          Phase-0 demo mode (local only). Select your role to continue.
        </div>
      </div>

      {existing ? (
        <div style={{ marginTop: "16px", display: "flex", gap: "12px", alignItems: "center" }}>
          <button className="wm-primarybtn" type="button" onClick={() => goTo(existing, nav)}>
            Continue as {existing}
          </button>

          <button
            className="wm-iconbtn"
            type="button"
            onClick={() => roleStorage.clear()}
            aria-label="Clear saved role"
            title="Clear saved role"
          >
            ⟲
          </button>
        </div>
      ) : null}

      {/* Opening page: 3 cards */}
      <div className="wm-cards" style={{ marginTop: "16px" }}>
        <div className="wm-card" role="button" tabIndex={0} onClick={() => goTo("employee", nav)}>
          <div className="left">
            <div className="label">Employee</div>
            <div className="desc">Find shifts, apply jobs, manage assignments.</div>
          </div>
          <span className="wm-badge">→</span>
        </div>

        <div className="wm-card" role="button" tabIndex={0} onClick={() => goTo("employer", nav)}>
          <div className="left">
            <div className="label">Employer</div>
            <div className="desc">Post jobs, manage hiring and workforce.</div>
          </div>
          <span className="wm-badge">→</span>
        </div>

        <div className="wm-card" role="button" tabIndex={0} onClick={() => goTo("admin", nav)}>
          <div className="left">
            <div className="label">Admin</div>
            <div className="desc">Control panel, analytics, reports & suspensions.</div>
          </div>
          <span className="wm-badge">🔒</span>
        </div>
      </div>

      <div className="wm-footer">
        <a href="#" onClick={(e) => e.preventDefault()}>
          Support
        </a>
        <a href="#" onClick={(e) => e.preventDefault()}>
          Language
        </a>
      </div>
    </div>
  );
}