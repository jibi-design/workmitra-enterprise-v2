/** Job Mitra | ResetPasswordPage.tsx | Apple-grade password reset confirmation */

import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";
import { authService } from "../services/authService";
import { JobMitraLandingLogo } from "../components/JobMitraLandingLogo";
import { LandingFooterLinks } from "../components/LandingFooterLinks";

const SUPPORT_EMAIL = "support@mitralabs.app";
const PRIVACY_POLICY_URL = "https://jibi-design.github.io/workmitra-privacy/";

export function ResetPasswordPage() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const token = useMemo(() => (params.get("token") ?? "").trim(), [params]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!AUTH_BACKEND_ENABLED) {
      setError("Password reset requires auth backend.");
      return;
    }
    if (!token) {
      setError("Missing reset token. Open the link from your email.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setSuccess("Password updated. You can sign in with your new password.");
      window.setTimeout(() => nav(ROUTE_PATHS.login, { replace: true }), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password");
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
          <h1 className="wm-auth-hero__title wm-auth-hero__title--center">Set new password</h1>
          <p className="wm-auth-hero__sub wm-auth-hero__sub--center">
            Choose a strong password for your Job Mitra account.
          </p>
        </div>

        <form className="wm-auth-form" onSubmit={onSubmit}>
          <label className="wm-auth-label">
            New password
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

          <label className="wm-auth-label">
            Confirm password
            <input
              className="wm-auth-input"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </label>

          {error ? (
            <p className="wm-auth-error" role="alert">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="wm-auth-success" role="status">
              {success}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading || !token}
            className={`wm-press-btn wm-auth-submit${loading ? " wm-auth-submit--loading" : ""}`}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="wm-auth-submit__spinner" aria-hidden="true" />
                Updating…
              </>
            ) : (
              "Update password"
            )}
          </button>
        </form>

        <div className="wm-auth-nav-links">
          <Link to={ROUTE_PATHS.forgotPassword}>Request a new link</Link>
          <Link to={ROUTE_PATHS.login}>Sign in</Link>
        </div>
      </div>

      <div className="wm-auth-footer">
        <LandingFooterLinks supportEmail={SUPPORT_EMAIL} privacyPolicyUrl={PRIVACY_POLICY_URL} />
      </div>
    </div>
  );
}
