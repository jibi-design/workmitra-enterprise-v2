/** Job Mitra | LoginPage.tsx | src/features/auth/pages/LoginPage.tsx */

import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { resolvePostAuthRoute, sanitizeAppRoute } from "../../../app/router/pendingRoute";
import { useAuthStore } from "../../../shared/store/authStore";
import type { UserRole } from "../../../shared/store/authStore";
import { peekIntentPacket } from "../../../shared/guest/intentPacket";
import { resumeIntentAfterAuth } from "../../../shared/guest/resumeIntent";
import { JobMitraLandingLogo } from "../components/JobMitraLandingLogo";
import { LandingFooterLinks } from "../components/LandingFooterLinks";

const SUPPORT_EMAIL = "support@mitralabs.app";
const PRIVACY_POLICY_URL = "https://jibi-design.github.io/workmitra-privacy/";

function homeForRole(role: UserRole): string {
  if (role === "employee") return ROUTE_PATHS.employeeHome;
  if (role === "employer") return ROUTE_PATHS.employerHome;
  return ROUTE_PATHS.adminHome;
}

export function LoginPage() {
  const nav = useNavigate();
  const location = useLocation();
  const loginWithCredentials = useAuthStore((s) => s.loginWithCredentials);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await loginWithCredentials(email.trim(), password);
      if (peekIntentPacket()) {
        resumeIntentAfterAuth(nav, user.role);
        return;
      }
      const stateFrom = (location.state as { from?: string } | null)?.from;
      const fallback = homeForRole(user.role);
      const rawTarget =
        stateFrom && stateFrom.startsWith(`/${user.role}`)
          ? stateFrom
          : resolvePostAuthRoute(user.role, fallback);
      const target = sanitizeAppRoute(rawTarget, user.role, fallback);
      nav(target, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wm-auth-stage wm-auth-login">
      <div className="wm-auth-panel">
        <div className="wm-auth-hero">
          <div className="wm-auth-hero__logo">
            <JobMitraLandingLogo />
          </div>
          <h1 className="wm-auth-hero__title wm-auth-hero__title--center">Sign in</h1>
          <p className="wm-auth-hero__sub wm-auth-hero__sub--center">
            Email and password — verified by server session.
          </p>
        </div>

        <form className="wm-auth-form" onSubmit={onSubmit}>
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
              autoComplete="current-password"
              required
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
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="wm-auth-nav-links">
          <Link to={ROUTE_PATHS.forgotPassword}>Forgot password?</Link>
          <Link to={ROUTE_PATHS.register}>Create account</Link>
        </div>

        {import.meta.env.DEV ? (
          <p className="wm-auth-dev-hint">
            Dev demo: employee@demo.jobmitra.app / employer@demo.jobmitra.app — password{" "}
            <code>demo1234</code>
          </p>
        ) : null}
      </div>

      <div className="wm-auth-footer">
        <LandingFooterLinks supportEmail={SUPPORT_EMAIL} privacyPolicyUrl={PRIVACY_POLICY_URL} />
      </div>
    </div>
  );
}
