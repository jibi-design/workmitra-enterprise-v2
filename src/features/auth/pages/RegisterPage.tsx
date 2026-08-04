/** Job Mitra | RegisterPage.tsx | Apple-grade account creation */

import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";
import { useAuthStore, type UserRole } from "../../../shared/store/authStore";
import { peekIntentPacket } from "../../../shared/guest/intentPacket";
import { resumeIntentAfterAuth } from "../../../shared/guest/resumeIntent";
import { JobMitraLandingLogo } from "../components/JobMitraLandingLogo";
import { LandingFooterLinks } from "../components/LandingFooterLinks";

const SUPPORT_EMAIL = "support@mitralabs.app";
const PRIVACY_POLICY_URL = "https://jibi-design.github.io/workmitra-privacy/";

type RegisterRole = Exclude<UserRole, "admin">;

function homeForRole(role: UserRole): string {
  if (role === "employee") return ROUTE_PATHS.employeeHome;
  if (role === "employer") return ROUTE_PATHS.employerHome;
  return ROUTE_PATHS.adminHome;
}

export function RegisterPage() {
  const nav = useNavigate();
  const registerWithCredentials = useAuthStore((s) => s.registerWithCredentials);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RegisterRole>("employee");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!AUTH_BACKEND_ENABLED) {
      setError("Account creation requires auth backend. Use role pick in demo mode.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const user = await registerWithCredentials({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role,
      });
      if (peekIntentPacket()) {
        resumeIntentAfterAuth(nav, user.role);
        return;
      }
      nav(homeForRole(user.role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wm-auth-stage">
      <div className="wm-auth-panel">
        <div className="wm-auth-hero">
          <div className="wm-auth-hero__logo">
            <JobMitraLandingLogo />
          </div>
          <h1 className="wm-auth-hero__title wm-auth-hero__title--center">Create account</h1>
          <p className="wm-auth-hero__sub wm-auth-hero__sub--center">
            Join Job Mitra as an employee or employer.
          </p>
        </div>

        <form className="wm-auth-form" onSubmit={onSubmit}>
          <div className="wm-auth-role-toggle" role="group" aria-label="Account type">
            <button
              type="button"
              className={`wm-auth-role-toggle__btn${role === "employee" ? " wm-auth-role-toggle__btn--active" : ""}`}
              onClick={() => setRole("employee")}
            >
              Employee
            </button>
            <button
              type="button"
              className={`wm-auth-role-toggle__btn${role === "employer" ? " wm-auth-role-toggle__btn--active" : ""}`}
              onClick={() => setRole("employer")}
            >
              Employer
            </button>
          </div>

          <label className="wm-auth-label">
            Full name
            <input
              className="wm-auth-input"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </label>

          <label className="wm-auth-label">
            Email
            <input
              className="wm-auth-input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="wm-auth-label">
            Password
            <input
              className="wm-auth-input"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error ? (
            <p className="wm-auth-error" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className={`wm-press-btn wm-auth-submit${loading ? " wm-auth-submit--loading" : ""}`}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="wm-auth-submit__spinner" aria-hidden="true" />
                Creating…
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <div className="wm-auth-nav-links">
          <Link to={ROUTE_PATHS.login}>Already have an account? Sign in</Link>
        </div>
      </div>

      <div className="wm-auth-footer">
        <LandingFooterLinks supportEmail={SUPPORT_EMAIL} privacyPolicyUrl={PRIVACY_POLICY_URL} />
      </div>
    </div>
  );
}
