// src/features/employer/company/components/SettingsActionSections.tsx
// Preferences, Security, and Danger Zone sections for Employer Settings.
// Fix: Log Out removed (available in top bar). Danger Zone = Delete Account only.

import type { EmployerProfile } from "../storage/employerSettings.storage";
import { LANGUAGE_OPTIONS } from "../storage/employerSettings.storage";
import { SettingsSelectField } from "./SettingsFormFields";
import {
  IconPreferences,
  IconSecurity,
  IconDanger,
  IconDelete,
} from "../helpers/settingsIcons";
import {
  sectionHeadStyle,
  sectionIconStyle,
  sectionTitleStyle,
  comingSoonBadgeStyle,
  toggleTrackStyle,
  toggleThumbStyle,
  dangerBtnStyle,
} from "../helpers/settingsStyles";

/* ------------------------------------------------ */
/* Shared prop types                                */
/* ------------------------------------------------ */
interface PreferencesSectionProps {
  data: EmployerProfile;
  editMode: boolean;
  onFieldChange: (field: keyof EmployerProfile, value: string | boolean) => void;
}

/* ------------------------------------------------ */
/* Preferences Section                              */
/* ------------------------------------------------ */
export function PreferencesSection({ data, editMode, onFieldChange }: PreferencesSectionProps) {
  return (
    <div className="wm-er-card" style={{ marginTop: 12 }}>
      <div style={sectionHeadStyle}>
        <div style={sectionIconStyle}>
          <IconPreferences />
        </div>
        <h2 style={sectionTitleStyle}>Preferences</h2>
      </div>

      {/* Notification toggle */}
      <div style={toggleRowStyle}>
        <div>
          <div style={toggleLabelStyle}>Notifications</div>
          <div style={toggleDescStyle}>Receive alerts for applications and updates</div>
        </div>
        <button
          type="button"
          disabled={!editMode}
          onClick={() => onFieldChange("notificationsEnabled", !data.notificationsEnabled)}
          style={toggleTrackStyle(data.notificationsEnabled as boolean)}
          aria-label={data.notificationsEnabled ? "Disable notifications" : "Enable notifications"}
        >
          <div style={toggleThumbStyle(data.notificationsEnabled as boolean)} />
        </button>
      </div>

      

      {/* Language */}
      <SettingsSelectField
        label="Language"
        value={data.language}
        disabled={!editMode}
        onChange={(v) => onFieldChange("language", v)}
        options={LANGUAGE_OPTIONS}
        placeholder="Select language"
      />
    </div>
  );
}

/* ------------------------------------------------ */
/* Security Section                                 */
/* ------------------------------------------------ */
export function SecuritySection() {
  return (
    <div className="wm-er-card" style={{ marginTop: 12 }}>
      <div style={sectionHeadStyle}>
        <div style={sectionIconStyle}>
          <IconSecurity />
        </div>
        <h2 style={sectionTitleStyle}>Security</h2>
      </div>

      <div style={securityRowStyle}>
        <div>
          <div style={toggleLabelStyle}>Change Password</div>
          <div style={toggleDescStyle}>Update your account password</div>
        </div>
        <span style={comingSoonBadgeStyle}>Coming Soon</span>
      </div>

      <div style={securityRowDividerStyle}>
        <div>
          <div style={toggleLabelStyle}>Two-Factor Authentication</div>
          <div style={toggleDescStyle}>Add an extra layer of security</div>
        </div>
        <span style={comingSoonBadgeStyle}>Coming Soon</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Danger Zone Section                              */
/* ------------------------------------------------ */
interface DangerZoneSectionProps {
  onDeleteAccount: () => void;
}

export function DangerZoneSection({ onDeleteAccount }: DangerZoneSectionProps) {
  return (
    <div
      className="wm-er-card"
      style={{ marginTop: 12, marginBottom: 32, borderColor: "rgba(220, 38, 38, 0.18)" }}
    >
      <div style={sectionHeadStyle}>
        <div
          style={{
            ...sectionIconStyle,
            border: "1px solid rgba(220, 38, 38, 0.18)",
            color: "var(--wm-error)",
          }}
        >
          <IconDanger />
        </div>
        <h2 style={{ ...sectionTitleStyle, color: "var(--wm-error)" }}>Danger Zone</h2>
      </div>

      <button
        type="button"
        style={{
          ...dangerBtnStyle,
          background: "rgba(220, 38, 38, 0.10)",
          borderColor: "rgba(220, 38, 38, 0.30)",
        }}
        onClick={onDeleteAccount}
      >
        <IconDelete />
        Delete Account
      </button>

      <div style={dangerHintStyle}>
        Delete Account will permanently remove all your data including company profile,
        employee records, and settings. This action cannot be undone.
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Local layout styles                              */
/* ------------------------------------------------ */
const toggleRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 14,
};



const toggleLabelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "var(--wm-er-text)",
};

const toggleDescStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--wm-er-muted)",
  marginTop: 2,
};

const securityRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 12,
};

const securityRowDividerStyle: React.CSSProperties = {
  borderTop: "1px solid var(--wm-er-divider)",
  paddingTop: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const dangerHintStyle: React.CSSProperties = {
  marginTop: 10,
  fontSize: 11,
  color: "var(--wm-er-muted)",
  fontWeight: 500,
  lineHeight: 1.5,
};