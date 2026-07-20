/** Job Mitra | LoginPage.tsx | src/features/auth/pages/LoginPage.tsx */

import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { resolvePostAuthRoute, sanitizeAppRoute } from "../../../app/router/pendingRoute";
import { useAuthStore } from "../../../shared/store/authStore";
import type { UserRole } from "../../../shared/store/authStore";
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        background: "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: `"Inter", "SF Pro Display", system-ui, sans-serif`,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#FFFFFF",
          borderRadius: 24,
          boxShadow:
            "0 24px 48px -12px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255, 255, 255, 1)",
          padding: "36px 24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <JobMitraLandingLogo />
        </div>

        <h1
          style={{
            margin: "0 0 8px",
            fontSize: 22,
            fontWeight: 700,
            color: "#0F172A",
            textAlign: "center",
          }}
        >
          Sign in
        </h1>
        <p style={{ margin: "0 0 24px", fontSize: 14, color: "#64748B", textAlign: "center" }}>
          Email and password — verified by server session.
        </p>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: "#334155",
            }}
          >
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid #E2E8F0",
                fontSize: 15,
              }}
            />
          </label>

          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: "#334155",
            }}
          >
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid #E2E8F0",
                fontSize: 15,
              }}
            />
          </label>

          {error && (
            <p role="alert" style={{ margin: 0, fontSize: 13, color: "#B91C1C" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="wm-press-btn"
            style={{
              marginTop: 8,
              padding: "14px 24px",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              color: "#FFFFFF",
              background: loading ? "#64748B" : "#0F172A",
              border: "none",
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {import.meta.env.DEV && (
          <p
            style={{
              margin: "20px 0 0",
              fontSize: 12,
              color: "#94A3B8",
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            Dev demo: employee@demo.jobmitra.app / employer@demo.jobmitra.app — password{" "}
            <code style={{ fontSize: 11 }}>demo1234</code>
          </p>
        )}
      </div>

      <div style={{ marginTop: 32 }}>
        <LandingFooterLinks supportEmail={SUPPORT_EMAIL} privacyPolicyUrl={PRIVACY_POLICY_URL} />
      </div>
    </div>
  );
}
