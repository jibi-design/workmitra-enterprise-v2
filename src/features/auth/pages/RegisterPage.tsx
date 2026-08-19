/** Job Mitra | RegisterPage.tsx | Apple-grade account creation */

import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";
import { useAuthStore, type UserRole } from "../../../shared/store/authStore";
import { peekIntentPacket } from "../../../shared/guest/intentPacket";
import { resumeIntentAfterAuth } from "../../../shared/guest/resumeIntent";
import { AuthPasswordField } from "../../../shared/components/AuthPasswordField";
import { JobMitraLandingLogo } from "../components/JobMitraLandingLogo";
import { LandingFooterLinks } from "../components/LandingFooterLinks";
import { JobMitraBrandName } from "../../../shared/components/brand/BrandName";

const SUPPORT_EMAIL = "support@mitraaccesshub.com";
const PRIVACY_POLICY_URL = "https://jibi-design.github.io/workmitra-privacy/";
/** Public legal page — Terms section lives on the same published policy URL. */
const TERMS_URL = `${PRIVACY_POLICY_URL}#terms`;

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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [role, setRole] = useState<RegisterRole>("employee");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordMismatch = useMemo(
    () => confirmPassword.length > 0 && password !== confirmPassword,
    [password, confirmPassword],
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!AUTH_BACKEND_ENABLED) {
      setError("Account creation is temporarily unavailable. Try again later.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!acceptedLegal) {
      setError("Please accept the Terms and Privacy Policy to continue.");
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
            Join <JobMitraBrandName size="sm" /> as an employee or employer.
          </p>
        </div>

        <form className="wm-auth-form" onSubmit={onSubmit}>
          <div className="wm-auth-role-toggle" role="group" aria-label="Account type">
            <button
              type="button"
              className={`wm-auth-role-toggle__btn${role === "employee" ? " wm-auth-role-toggle__btn--active" : ""}`}
              aria-pressed={role === "employee"}
              onClick={() => setRole("employee")}
            >
              Employee
            </button>
            <button
              type="button"
              className={`wm-auth-role-toggle__btn${role === "employer" ? " wm-auth-role-toggle__btn--active" : ""}`}
              aria-pressed={role === "employer"}
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
              name="fullName"
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
              name="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <AuthPasswordField
            label="Password"
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <AuthPasswordField
            label="Confirm password"
            name="confirm-password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {passwordMismatch ? (
            <p className="wm-auth-error" role="alert">
              Passwords do not match.
            </p>
          ) : null}

          <label className="wm-auth-consent">
            <input
              type="checkbox"
              className="wm-auth-consent__input"
              checked={acceptedLegal}
              onChange={(e) => setAcceptedLegal(e.target.checked)}
              required
            />
            <span className="wm-auth-consent__text">
              I agree to the{" "}
              <a href={TERMS_URL} target="_blank" rel="noreferrer">
                Terms
              </a>{" "}
              and{" "}
              <a href={PRIVACY_POLICY_URL} target="_blank" rel="noreferrer">
                Privacy Policy
              </a>
              .
            </span>
          </label>

          {error ? (
            <p className="wm-auth-error" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading || passwordMismatch || !acceptedLegal}
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
