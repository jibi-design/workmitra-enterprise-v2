// Preferences, Security (legacy Coming Soon), Danger Zone re-export from shared.

import type { EmployerProfile } from "../storage/employerSettings.storage";
import { LANGUAGE_OPTIONS } from "../storage/employerSettings.storage";
import { SettingsSelectField } from "./SettingsFormFields";
import { IconPreferences, IconSecurity } from "../helpers/settingsIcons";
import {
  sectionHeadStyle,
  sectionIconStyle,
  sectionTitleStyle,
  comingSoonBadgeStyle,
} from "../helpers/settingsStyles";

export { DangerZoneSection } from "../../../../shared/settings/DangerZoneSection";

interface PreferencesSectionProps {
  data: EmployerProfile;
  editMode: boolean;
  onFieldChange: (field: keyof EmployerProfile, value: string | boolean) => void;
}

export function PreferencesSection({ data, editMode, onFieldChange }: PreferencesSectionProps) {
  return (
    <div className="wm-settingsGroup">
      <div className="wm-settingsGroup__title">Preferences</div>
      <div style={sectionHeadStyle}>
        <div style={sectionIconStyle}>
          <IconPreferences />
        </div>
        <h2 style={sectionTitleStyle}>Language</h2>
      </div>

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
