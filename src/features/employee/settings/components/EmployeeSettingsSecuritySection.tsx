// src/features/employee/settings/components/EmployeeSettingsSecuritySection.tsx
// Account & Security section for the Employee settings dashboard.
// Phase 3: added Change Password, 2FA, Active Sessions (Coming Soon placeholders).

import type { EmployeeSettings } from "../storage/employeeSettings.storage";

type Props = {
  settings: EmployeeSettings;
  onToggle: <K extends keyof EmployeeSettings>(key: K) => void;
  onClearLocalData: () => void;
  onDeleteAccount: () => void;
  onLogout: () => void;
};

export function EmployeeSettingsSecuritySection({
  settings,
  onToggle,
  onClearLocalData,
  onDeleteAccount,
  onLogout,
}: Props) {
  return (
    <section className="wm-settingsGroup">
      <div
        className="wm-ee-cardTitle"
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px 0" }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          aria-hidden="true"
          style={{ color: "#0ea5e9", flexShrink: 0 }}
        >
          <path
            fill="currentColor"
            d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Zm0 2.18 7 3.12V11c0 4.52-3.07 8.74-7 9.93-3.93-1.19-7-5.41-7-9.93V6.3l7-3.12ZM11 7v6h2V7h-2Zm0 8v2h2v-2h-2Z"
          />
        </svg>
        Account &amp; Security
      </div>

      {/* App Lock */}
      <div className="wm-toggleRow" style={{ marginTop: 8 }}>
        <label className="wm-toggle">
          <input
            type="checkbox"
            checked={settings.appLockEnabled}
            onChange={() => onToggle("appLockEnabled")}
          />
          <span>App lock (PIN)</span>
        </label>
      </div>
      <div className="wm-ee-helperText" style={{ marginTop: 2, marginBottom: 12 }}>
        Require PIN to open the app. Phase-0 demo toggle.
      </div>

      {/* Change Password — Coming Soon */}
      <div style={securityRowStyle}>
        <div>
          <div style={securityLabelStyle}>Change password</div>
          <div style={securityDescStyle}>Update your account password securely.</div>
        </div>
        <span style={comingSoonStyle}>Soon</span>
      </div>

      {/* 2FA — Coming Soon */}
      <div style={{ ...securityRowStyle, borderTop: "1px solid rgba(0,0,0,0.07)", paddingTop: 10 }}>
        <div>
          <div style={securityLabelStyle}>Two-factor authentication</div>
          <div style={securityDescStyle}>Add an extra layer of security to your account.</div>
        </div>
        <span style={comingSoonStyle}>Soon</span>
      </div>

      {/* Active Sessions — Coming Soon */}
      <div
        style={{
          ...securityRowStyle,
          borderTop: "1px solid rgba(0,0,0,0.07)",
          paddingTop: 10,
          marginBottom: 0,
        }}
      >
        <div>
          <div style={securityLabelStyle}>Active sessions</div>
          <div style={securityDescStyle}>
            This device only (Phase-0). Multi-device list in Phase 1.
          </div>
        </div>
        <span
          style={{
            padding: "3px 10px",
            borderRadius: "var(--wm-radius-8)",
            fontSize: 11,
            fontWeight: 800,
            background: "rgba(14,165,233,0.10)",
            color: "#0ea5e9",
          }}
        >
          1 Active
        </span>
      </div>

      {/* Log out all devices — Coming Soon */}
      <div
        style={{
          ...securityRowStyle,
          borderTop: "1px solid rgba(0,0,0,0.07)",
          paddingTop: 10,
          marginBottom: 14,
        }}
      >
        <div>
          <div style={securityLabelStyle}>Log out all devices</div>
          <div style={securityDescStyle}>Revoke access from every signed-in device.</div>
        </div>
        <span style={comingSoonStyle}>Soon</span>
      </div>

      {/* Action buttons */}
      <div className="wm-settingsGroup wm-settingsGroup--danger" style={{ marginTop: 12 }}>
        <div className="wm-settingsGroup__title">Danger zone</div>
        <button className="wm-settingsRow" type="button" onClick={onClearLocalData}>
          <span className="wm-settingsRow__label">Clear local data</span>
          <span className="wm-settingsRow__chevron">→</span>
        </button>

        <button className="wm-settingsRow wm-settingsRow--danger" type="button" onClick={onLogout}>
          <span className="wm-settingsRow__label">Logout</span>
          <span className="wm-settingsRow__chevron">→</span>
        </button>

        <button
          className="wm-settingsRow wm-settingsRow--danger"
          type="button"
          onClick={onDeleteAccount}
        >
          <span className="wm-settingsRow__label">Delete account</span>
          <span className="wm-settingsRow__chevron">→</span>
        </button>
      </div>
    </section>
  );
}

const securityRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 10,
};

const securityLabelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "var(--wm-text, #1e293b)",
};

const securityDescStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--wm-muted, #64748b)",
  marginTop: 2,
};

const comingSoonStyle: React.CSSProperties = {
  padding: "3px 10px",
  borderRadius: "var(--wm-radius-8)",
  fontSize: 11,
  fontWeight: 800,
  background: "rgba(100,116,139,0.08)",
  color: "#64748b",
  flexShrink: 0,
};
