/** Job Mitra | ForgotPasswordPage.tsx | Apple-grade password recovery request */

import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";
import { authService } from "../services/authService";
import { JobMitraLandingLogo } from "../components/JobMitraLandingLogo";
import { LandingFooterLinks } from "../components/LandingFooterLinks";

const SUPPORT_EMAIL = "support@mitraaccesshub.com";
const PRIVACY_POLICY_URL = "https://jibi-design.github.io/workmitra-privacy/";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [debugToken, setDebugToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setDebugToken(null);

    if (!AUTH_BACKEND_ENABLED) {
      setError("Password recovery is temporarily unavailable. Try again later.");
      return;
    }

    setLoading(true);
    try {
      const result = await authService.requestPasswordReset(email.trim());
      setSuccess(
        result.message ||
          "If an account exists for that email, password reset instructions have been sent.",
      );
      if (result.debugResetToken) {
        setDebugToken(result.debugResetToken);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start password recovery");
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
          <h1 className="wm-auth-hero__title wm-auth-hero__title--center">Forgot password</h1>
          <p className="wm-auth-hero__sub wm-auth-hero__sub--center">
            Enter your email and we&apos;ll send a secure reset link if an account exists.
          </p>
        </div>

        <form className="wm-auth-form" onSubmit={onSubmit}>
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

          {debugToken ? (
            <p className="wm-auth-dev-hint">
              Dev reset token:{" "}
              <Link to={`${ROUTE_PATHS.resetPassword}?token=${encodeURIComponent(debugToken)}`}>
                Open reset form
              </Link>
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
                Sending…
              </>
            ) : (
              "Send reset link"
            )}
          </button>
        </form>

        <div className="wm-auth-nav-links">
          <Link to={ROUTE_PATHS.login}>Back to sign in</Link>
          <Link to={ROUTE_PATHS.register}>Create account</Link>
        </div>
      </div>

      <div className="wm-auth-footer">
        <LandingFooterLinks supportEmail={SUPPORT_EMAIL} privacyPolicyUrl={PRIVACY_POLICY_URL} />
      </div>
    </div>
  );
}
