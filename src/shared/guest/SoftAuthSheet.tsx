/** Phase 4 — Soft Auth Sheet (intent-preserving login/register). */

import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { CenterModal } from "../components/CenterModal";
import { AUTH_BACKEND_ENABLED } from "../config/authConfig";
import { ensureCsrfReady } from "../services/apiService";
import { useAuthStore, type UserRole } from "../store/authStore";
import { ROUTE_PATHS } from "../../app/router/routePaths";
import { AuthPasswordField } from "../components/AuthPasswordField";
import type { IntentPacket } from "./intentPacket";
import { CONTINUE_WITH_JOB_MITRA_ARIA } from "../components/brand/brandAriaLabels";
import { JobMitraBrandName } from "../components/brand/BrandName";

type Mode = "login" | "register";

type Props = {
  readonly open: boolean;
  readonly intent: IntentPacket | null;
  readonly onClose: () => void;
  readonly onAuthenticated: (role: UserRole) => void;
};

export function SoftAuthSheet({ open, intent, onClose, onAuthenticated }: Props) {
  const loginWithCredentials = useAuthStore((s) => s.loginWithCredentials);
  const registerWithCredentials = useAuthStore((s) => s.registerWithCredentials);

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"employee" | "employer">(intent?.roleHint ?? "employee");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Prefetch CSRF so register/login mutations can attach X-CSRF-Token immediately.
  useEffect(() => {
    if (!open || !AUTH_BACKEND_ENABLED) return;
    void ensureCsrfReady({ force: true });
    if (intent?.roleHint === "employee" || intent?.roleHint === "employer") {
      setRole(intent.roleHint);
    }
  }, [open, intent?.roleHint]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!AUTH_BACKEND_ENABLED) {
        setError("Sign-in is temporarily unavailable. Try again later.");
        return;
      }
      await ensureCsrfReady({ force: true });
      if (mode === "login") {
        const user = await loginWithCredentials(email.trim(), password);
        onAuthenticated(user.role);
      } else {
        const user = await registerWithCredentials({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          role,
        });
        onAuthenticated(user.role);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  const ariaTitle =
    intent?.action === "apply_shift" || intent?.action === "apply_career"
      ? "Sign in to apply"
      : intent?.action === "save_shift" || intent?.action === "save_career"
        ? "Sign in to save"
        : intent?.action === "create_draft"
          ? "Profile required to publish live"
          : CONTINUE_WITH_JOB_MITRA_ARIA;

  const titleContent =
    ariaTitle === CONTINUE_WITH_JOB_MITRA_ARIA
      ? (
          <>
            Continue with <JobMitraBrandName size="sm" />
          </>
        )
      : ariaTitle;

  return (
    <CenterModal open={open} onBackdropClose={onClose} ariaLabel={ariaTitle} maxWidth={440}>
      <div className="wm-auth-panel" style={{ boxShadow: "none", margin: 0 }}>
        <h2 className="wm-auth-hero__title" style={{ fontSize: 22, marginBottom: 6 }}>
          {titleContent}
        </h2>
        <p className="wm-auth-hero__sub" style={{ marginBottom: 14 }}>
          {intent?.action === "create_draft"
            ? "Finish exploring in playground mode. A profile is required only to publish live."
            : "Your place is saved — we will continue where you left off after sign-in."}
        </p>

        <div className="wm-auth-role-toggle" role="group" aria-label="Sign in or create account">
          <button
            type="button"
            className={`wm-auth-role-toggle__btn${mode === "login" ? " wm-auth-role-toggle__btn--active" : ""}`}
            aria-pressed={mode === "login"}
            onClick={() => setMode("login")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`wm-auth-role-toggle__btn${mode === "register" ? " wm-auth-role-toggle__btn--active" : ""}`}
            aria-pressed={mode === "register"}
            onClick={() => setMode("register")}
          >
            Create account
          </button>
        </div>

        <form className="wm-auth-form" onSubmit={(e) => void onSubmit(e)}>
          {mode === "register" ? (
            <>
              <label className="wm-auth-label">
                Full name
                <input
                  className="wm-auth-input"
                  name="fullName"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </label>
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
            </>
          ) : null}

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
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error ? (
            <p className="wm-auth-error" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" className="wm-press-btn wm-auth-submit" disabled={loading}>
            {loading
              ? "Please wait…"
              : mode === "login"
                ? "Sign in & continue"
                : "Create & continue"}
          </button>
        </form>

        <button type="button" className="wm-outlineBtn" onClick={onClose} style={{ width: "100%", marginTop: 10 }}>
          Skip / Continue browsing
        </button>

        <div className="wm-auth-nav-links">
          {mode === "login" ? (
            <Link to={ROUTE_PATHS.forgotPassword} onClick={onClose}>
              Forgot password?
            </Link>
          ) : null}
          <Link to={ROUTE_PATHS.login} onClick={onClose}>
            Full sign-in page
          </Link>
          <Link to={ROUTE_PATHS.register} onClick={onClose}>
            Create account
          </Link>
        </div>
      </div>
    </CenterModal>
  );
}
