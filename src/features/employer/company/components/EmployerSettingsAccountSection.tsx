// src/features/employer/company/components/EmployerSettingsAccountSection.tsx
// Account & Security section for the Employer settings dashboard (Mitra Executive).

import { IconSecurity } from "../helpers/settingsIcons";
import {
  sectionHeadStyle,
  sectionIconStyle,
  sectionTitleStyle,
  comingSoonBadgeStyle,
} from "../helpers/settingsStyles";

type EmployerSettingsAccountSectionProps = {
  readonly onLogoutAllDevices?: () => void;
};

export function EmployerSettingsAccountSection({
  onLogoutAllDevices,
}: EmployerSettingsAccountSectionProps) {
  return (
    <div className="wm-er-card" style={{ marginTop: 12 }}>
      <div style={sectionHeadStyle}>
        <div style={sectionIconStyle}>
          <IconSecurity />
        </div>
        <h2 style={sectionTitleStyle}>Account &amp; Security</h2>
      </div>

      <div style={rowStyle}>
        <div>
          <div style={rowLabelStyle}>Phone &amp; email</div>
          <div style={rowDescStyle}>Update contact details from your Employer Profile.</div>
        </div>
        <span style={comingSoonBadgeStyle}>Profile</span>
      </div>

      <div style={{ ...rowStyle, ...rowDividerStyle }}>
        <div>
          <div style={rowLabelStyle}>Change password</div>
          <div style={rowDescStyle}>Update your account password securely.</div>
        </div>
        <span style={comingSoonBadgeStyle}>Coming Soon</span>
      </div>

      <div style={{ ...rowStyle, ...rowDividerStyle }}>
        <div>
          <div style={rowLabelStyle}>Two-factor authentication</div>
          <div style={rowDescStyle}>Add a second verification layer to your sign-in.</div>
        </div>
        <span style={comingSoonBadgeStyle}>Coming Soon</span>
      </div>

      <div style={{ ...rowStyle, ...rowDividerStyle }}>
        <div>
          <div style={rowLabelStyle}>Active sessions</div>
          <div style={rowDescStyle}>This device · Windows · Chrome</div>
        </div>
        <span
          style={{
            ...comingSoonBadgeStyle,
            background: "rgba(139,92,246,0.10)",
            color: "#7c3aed",
          }}
        >
          1 Active
        </span>
      </div>

      <div style={{ ...rowStyle, ...rowDividerStyle, marginBottom: 0 }}>
        <div>
          <div style={rowLabelStyle}>Log out of all other devices</div>
          <div style={rowDescStyle}>Revoke access from every other signed-in device.</div>
        </div>
        <button
          type="button"
          className="wm-outlineBtn"
          onClick={onLogoutAllDevices}
          style={{ fontSize: 12, padding: "6px 12px", flexShrink: 0 }}
        >
          Log out all
        </button>
      </div>
    </div>
  );
}

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 12,
  gap: 12,
};

const rowDividerStyle: React.CSSProperties = {
  borderTop: "1px solid var(--wm-er-divider)",
  paddingTop: 12,
};

const rowLabelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "var(--wm-er-text)",
};

const rowDescStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--wm-er-muted)",
  marginTop: 2,
};
