// src/features/employer/company/components/SettingsActionSections.tsx
// Preferences, Security, and Danger Zone sections for Employer Settings.
// Fix: Log Out removed (available in top bar). Danger Zone = Delete Account only.

import type { EmployerProfile } from "../storage/employerSettings.storage";
import { LANGUAGE_OPTIONS } from "../storage/employerSettings.storage";
import { SettingsSelectField } from "./SettingsFormFields";
import { IconPreferences, IconSecurity, IconDanger, IconDelete } from "../helpers/settingsIcons";
import {
  sectionHeadStyle,
  sectionIconStyle,
  sectionTitleStyle,
  comingSoonBadgeStyle,
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
    <div className="wm-settingsGroup">
      <div className="wm-settingsGroup__title">Preferences</div>
      <div style={sectionHeadStyle}>
        <div style={sectionIconStyle}>
          <IconPreferences />
        </div>
        <h2 style={sectionTitleStyle}>Language</h2>
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
    <>
      <div className="wm-settingsGroup wm-settingsGroup--danger">
        <div className="wm-settingsGroup__title">Danger zone</div>
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
          <h2 style={{ ...sectionTitleStyle, color: "var(--wm-error)" }}>Account deletion</h2>
        </div>

        <button
          type="button"
          className="wm-settingsRow wm-settingsRow--danger"
          onClick={onDeleteAccount}
        >
          <span className="wm-settingsRow__icon" style={{ color: "#b91c1c" }}>
            <IconDelete />
          </span>
          <span className="wm-settingsRow__label">Delete Account</span>
          <span className="wm-settingsRow__chevron">→</span>
        </button>

        <div style={dangerHintStyle}>
          Delete Account will permanently remove all your data including company profile, employee
          records, and settings. This action cannot be undone.
        </div>
      </div>
      <div className="wm-settingsVersion">WorkMitra v1.0 · Beta</div>
    </>
  );
}

/* ------------------------------------------------ */
/* Local layout styles                              */
/* ------------------------------------------------ */
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
