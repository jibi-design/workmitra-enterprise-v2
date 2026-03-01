// src/features/auth/pages/ModeSelectPage.tsx
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { roleStorage, type AppRole } from "../../../app/storage/roleStorage";

const DEMO_ADMIN_CODE = "WM-ADMIN-2026";

function roleToHome(role: AppRole) {
  if (role === "employee") return ROUTE_PATHS.employeeHome;
  if (role === "employer") return ROUTE_PATHS.employerHome;
  return ROUTE_PATHS.adminHome;
}

export function ModeSelectPage() {
  const nav = useNavigate();
  const [params] = useSearchParams();

  const primary = useMemo(() => {
    const raw = params.get("primary");
    return raw === "employer" ? ("employer" as const) : ("employee" as const);
  }, [params]);

  const other: AppRole = primary === "employee" ? "employer" : "employee";

  function continueAs(role: AppRole) {
    roleStorage.set(role);
    nav(roleToHome(role), { replace: true });
  }

  function tryAdmin() {
    // Phase-0 demo safe: local gate only. No real OTP/email.
    const code = window.prompt("Enter Admin Access Code (demo):");
    if (!code) return;

    if (code.trim() !== DEMO_ADMIN_CODE) {
      window.alert("Invalid admin code.");
      return;
    }

    continueAs("admin");
  }

  return (
    <div className="wm-container" style={{ paddingTop: "24px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ fontWeight: 1000, fontSize: "16px" }}>Select Mode</div>
        <div style={{ color: "var(--wm-emp-muted)", fontSize: "12px" }}>
          Admin is gated. Roles and domains never mix.
        </div>
      </div>

      {/* Inside selected role -> 3 cards */}
      <div className="wm-cards" style={{ marginTop: "16px" }}>
        <div className="wm-card" role="button" tabIndex={0} onClick={() => continueAs(primary)}>
          <div className="left">
            <div className="label">Continue as {primary}</div>
            <div className="desc">Enter {primary} workspace.</div>
          </div>
          <span className="wm-badge">✓</span>
        </div>

        <div className="wm-card" role="button" tabIndex={0} onClick={() => continueAs(other)}>
          <div className="left">
            <div className="label">Switch to {other}</div>
            <div className="desc">Change entry role.</div>
          </div>
          <span className="wm-badge">↺</span>
        </div>

        <div className="wm-card" role="button" tabIndex={0} onClick={tryAdmin}>
          <div className="left">
            <div className="label">Admin (Control)</div>
            <div className="desc">Restricted access. Requires admin code.</div>
          </div>
          <span className="wm-badge">🔒</span>
        </div>
      </div>

      <div className="wm-footer">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            nav(ROUTE_PATHS.landing, { replace: true });
          }}
        >
          Back
        </a>
        <a href="#" onClick={(e) => e.preventDefault()}>
          Support
        </a>
      </div>
    </div>
  );
}