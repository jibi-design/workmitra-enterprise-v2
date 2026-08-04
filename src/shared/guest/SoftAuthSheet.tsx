/** Phase 4 — Soft Auth Sheet (intent-preserving login/register). */

import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { CenterModal } from "../components/CenterModal";
import { AUTH_BACKEND_ENABLED } from "../config/authConfig";
import { ensureCsrfReady } from "../services/apiService";
import { useAuthStore, type UserRole } from "../store/authStore";
import { ROUTE_PATHS } from "../../app/router/routePaths";
import type { IntentPacket } from "./intentPacket";

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
        setError("Sign-in requires auth backend. Use role pick in demo mode.");
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

  const title =
    intent?.action === "apply_shift" || intent?.action === "apply_career"
      ? "Sign in to apply"
      : intent?.action === "save_shift" || intent?.action === "save_career"
        ? "Sign in to save"
        : intent?.action === "create_draft"
          ? "Sign in to keep your draft"
          : "Continue with Job Mitra";

  return (
    <CenterModal open={open} onBackdropClose={onClose} ariaLabel={title} maxWidth={440}>
      <div className="wm-auth-panel" style={{ boxShadow: "none", margin: 0 }}>
        <h2 className="wm-auth-hero__title" style={{ fontSize: 22, marginBottom: 6 }}>
          {title}
        </h2>
        <p className="wm-auth-hero__sub" style={{ marginBottom: 14 }}>
          Your place is saved — we will continue where you left off after sign-in.
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button
            type="button"
            className={mode === "login" ? "wm-primarybtn" : "wm-outlineBtn"}
            onClick={() => setMode("login")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === "register" ? "wm-primarybtn" : "wm-outlineBtn"}
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
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </label>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <button
                  type="button"
                  className={role === "employee" ? "wm-primarybtn" : "wm-outlineBtn"}
                  onClick={() => setRole("employee")}
                >
                  Employee
                </button>
                <button
                  type="button"
                  className={role === "employer" ? "wm-primarybtn" : "wm-outlineBtn"}
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
              autoComplete={mode === "login" ? "current-password" : "new-password"}
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

          <button type="submit" className="wm-press-btn wm-auth-submit" disabled={loading}>
            {loading
              ? "Please wait…"
              : mode === "login"
                ? "Sign in & continue"
                : "Create & continue"}
          </button>
        </form>

        <p style={{ marginTop: 12, fontSize: 12, color: "var(--wm-er-muted)" }}>
          Prefer full page?{" "}
          <Link to={ROUTE_PATHS.login} onClick={onClose}>
            Sign in
          </Link>{" "}
          ·{" "}
          <Link to={ROUTE_PATHS.register} onClick={onClose}>
            Register
          </Link>
        </p>
      </div>
    </CenterModal>
  );
}
