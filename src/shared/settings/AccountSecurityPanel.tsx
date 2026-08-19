/** Shared Account & Security panel — password change + active session revoke. */

import { useCallback, useEffect, useState } from "react";
import { authService } from "../../features/auth/services/authService";
import { useAuthStore } from "../store/authStore";

export type AuthSessionRow = {
  id: string;
  current: boolean;
  createdAt: string;
  lastSeenAt: string;
  userAgent: string | null;
};

type Props = {
  /** Visual surface: employer card vs employee settings group. */
  variant?: "employer" | "employee";
  onNotice?: (title: string, message: string, tone?: "success" | "warn" | "info") => void;
};

function shortUa(ua: string | null): string {
  if (!ua || !ua.trim()) return "This browser";
  const raw = ua.trim();
  const chrome = raw.match(/Chrome\/(\d+)/);
  const firefox = raw.match(/Firefox\/(\d+)/);
  const safari = /Safari\//.test(raw) && !/Chrome\//.test(raw);
  const os = /Windows/i.test(raw) ? "Windows" : /Mac OS X/i.test(raw) ? "macOS" : /Android/i.test(raw) ? "Android" : /iPhone|iPad/i.test(raw) ? "iOS" : "this device";
  if (chrome) return `Chrome ${chrome[1]} on ${os}`;
  if (firefox) return `Firefox ${firefox[1]} on ${os}`;
  if (safari) return `Safari on ${os}`;
  return os === "this device" ? "This browser" : `Browser on ${os}`;
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function AccountSecurityPanel({ variant = "employee", onNotice }: Props) {
  const user = useAuthStore((s) => s.user);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busyPassword, setBusyPassword] = useState(false);
  const [busySessions, setBusySessions] = useState(false);
  const [sessions, setSessions] = useState<AuthSessionRow[]>([]);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setSessionsError(null);
    try {
      const rows = await authService.listSessions();
      setSessions(rows);
    } catch {
      setSessionsError("Could not load active sessions. Sign in again if this persists.");
      setSessions([]);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      onNotice?.("Validation", "New password must be at least 8 characters.", "warn");
      return;
    }
    if (newPassword !== confirmPassword) {
      onNotice?.("Validation", "New password and confirmation do not match.", "warn");
      return;
    }
    setBusyPassword(true);
    try {
      const result = await authService.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onNotice?.(
        "Password updated",
        result.revokedOtherSessions > 0
          ? `Password changed. Revoked ${result.revokedOtherSessions} other session(s).`
          : "Password changed successfully.",
        "success",
      );
      await loadSessions();
    } catch (err) {
      const message =
        err instanceof Error && err.message.trim()
          ? err.message
          : "Could not update password. Check your current password and try again.";
      onNotice?.("Password update failed", message, "warn");
    } finally {
      setBusyPassword(false);
    }
  }

  async function handleRevokeOthers() {
    setBusySessions(true);
    try {
      const revoked = await authService.revokeOtherSessions();
      onNotice?.(
        "Sessions revoked",
        revoked > 0
          ? `Signed out ${revoked} other device(s). This device stays signed in.`
          : "No other active sessions to revoke.",
        "success",
      );
      await loadSessions();
    } catch {
      onNotice?.("Session revoke failed", "Could not revoke other sessions.", "warn");
    } finally {
      setBusySessions(false);
    }
  }

  const shellClass = variant === "employer" ? "wm-er-card" : "wm-settingsGroup";
  const titleStyle =
    variant === "employer"
      ? { fontSize: 15, fontWeight: 800, color: "var(--wm-er-text)", margin: 0 }
      : undefined;

  return (
    <div className={shellClass} style={{ marginTop: variant === "employer" ? 12 : undefined }}>
      <div
        className={variant === "employee" ? "wm-ee-cardTitle" : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: variant === "employee" ? "8px 10px 0" : undefined,
          marginBottom: 12,
        }}
      >
        {variant === "employer" ? <h2 style={titleStyle}>Account &amp; Security</h2> : null}
        {variant === "employee" ? <>Account &amp; Security</> : null}
      </div>

      <div style={identityBoxStyle}>
        <div style={labelStyle}>Signed-in identity</div>
        <div style={valueStyle}>{user?.fullName?.trim() || "—"}</div>
        <div style={mutedStyle}>{user?.email?.trim() || "—"}</div>
        <div style={{ ...mutedStyle, marginTop: 4 }}>ID · {user?.id ?? "—"}</div>
      </div>

      <form onSubmit={handleChangePassword} style={{ marginTop: 14 }}>
        <div style={labelStyle}>Change password</div>
        <div style={mutedStyle}>WAVE-5.1 bound · updates server hash and revokes other sessions.</div>
        <input
          className="wm-input"
          type="password"
          autoComplete="current-password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(ev) => setCurrentPassword(ev.target.value)}
          required
          style={{ marginTop: 8 }}
        />
        <input
          className="wm-input"
          type="password"
          autoComplete="new-password"
          placeholder="New password (8+)"
          value={newPassword}
          onChange={(ev) => setNewPassword(ev.target.value)}
          required
          minLength={8}
          style={{ marginTop: 8 }}
        />
        <input
          className="wm-input"
          type="password"
          autoComplete="new-password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(ev) => setConfirmPassword(ev.target.value)}
          required
          minLength={8}
          style={{ marginTop: 8 }}
        />
        <button
          type="submit"
          className="wm-primarybtn"
          disabled={busyPassword}
          style={{ marginTop: 10 }}
        >
          {busyPassword ? "Updating…" : "Update password"}
        </button>
      </form>

      <div style={{ ...rowDividerStyle, marginTop: 16 }}>
        <div style={labelStyle}>Two-factor authentication</div>
        <div style={mutedStyle}>Status · Not enabled on this account yet.</div>
        <span style={statusBadgeStyle}>Off</span>
      </div>

      <div style={{ ...rowDividerStyle, marginTop: 14 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <div>
            <div style={labelStyle}>Active sessions</div>
            <div style={mutedStyle}>Revoke every device except this one.</div>
          </div>
          <button
            type="button"
            className="wm-outlineBtn"
            disabled={busySessions}
            onClick={() => void handleRevokeOthers()}
            style={{ fontSize: 12, padding: "6px 12px", flexShrink: 0 }}
          >
            {busySessions ? "Revoking…" : "Revoke others"}
          </button>
        </div>
        {sessionsError ? <div style={{ ...mutedStyle, color: "var(--wm-error)" }}>{sessionsError}</div> : null}
        {sessions.length === 0 && !sessionsError ? (
          <div style={mutedStyle}>No session list available.</div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {sessions.map((s) => (
              <li key={s.id} style={sessionRowStyle}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {shortUa(s.userAgent)}
                    {s.current ? " · This device" : ""}
                  </div>
                  <div style={mutedStyle}>Last seen · {formatWhen(s.lastSeenAt)}</div>
                </div>
                {s.current ? <span style={activeBadgeStyle}>Current</span> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const identityBoxStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: "var(--wm-radius-10, 10px)",
  border: "1px solid var(--wm-er-divider, rgba(15,23,42,0.08))",
  background: "rgba(15,23,42,0.02)",
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "var(--wm-er-text, var(--wm-text, #1e293b))",
};

const valueStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  marginTop: 4,
  color: "var(--wm-er-text, var(--wm-text, #1e293b))",
};

const mutedStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--wm-er-muted, var(--wm-muted, #64748b))",
  marginTop: 2,
  lineHeight: 1.4,
};

const rowDividerStyle: React.CSSProperties = {
  borderTop: "1px solid var(--wm-er-divider, rgba(15,23,42,0.08))",
  paddingTop: 12,
  position: "relative",
};

const statusBadgeStyle: React.CSSProperties = {
  position: "absolute",
  right: 0,
  top: 12,
  padding: "3px 10px",
  borderRadius: "var(--wm-radius-8, 8px)",
  fontSize: 11,
  fontWeight: 800,
  background: "rgba(100,116,139,0.08)",
  color: "#64748b",
};

const activeBadgeStyle: React.CSSProperties = {
  padding: "3px 10px",
  borderRadius: "var(--wm-radius-8, 8px)",
  fontSize: 11,
  fontWeight: 800,
  background: "color-mix(in srgb, var(--wm-brand-600, #2563eb) 12%, transparent)",
  color: "var(--wm-brand-700, #1d4ed8)",
  flexShrink: 0,
};

const sessionRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: "8px 0",
  borderBottom: "1px solid rgba(15,23,42,0.06)",
};
