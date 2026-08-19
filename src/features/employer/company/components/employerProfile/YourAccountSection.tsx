/** Section 1 — Your account (personal, not the business). */

import { PhoneNumberField } from "../../../../../shared/phone";
import type { EmployerProfile } from "../../storage/employerSettings.storage";
import { SettingsTextField } from "../SettingsFormFields";
import {
  EXECUTIVE_CARD_SHELL,
  EXECUTIVE_HELPER,
  EXECUTIVE_SECTION_KICKER,
  EXECUTIVE_SECTION_TITLE,
} from "../../helpers/employerProfileCard.styles";
import { fieldGroupStyle, fieldLabelStyle } from "../../helpers/settingsStyles";

type Props = {
  readonly data: EmployerProfile;
  readonly editMode: boolean;
  readonly onFieldChange: (field: keyof EmployerProfile, value: string | boolean) => void;
};

export function YourAccountSection({ data, editMode, onFieldChange }: Props) {
  return (
    <section style={EXECUTIVE_CARD_SHELL} data-testid="employer-your-account-section">
      <div style={EXECUTIVE_SECTION_KICKER}>Your account</div>
      <h2 style={EXECUTIVE_SECTION_TITLE}>Your personal account</h2>
      <p style={EXECUTIVE_HELPER}>
        Your account is yours. Login, phone, and email stay private and never move with the
        business.
      </p>

      <div style={{ marginTop: 14 }}>
        <SettingsTextField
          label="Your name"
          value={data.fullName}
          disabled={!editMode}
          onChange={(v) => onFieldChange("fullName", v)}
          placeholder="Enter your full name"
          required
          capitalizeWords
          minLength={2}
        />
        <SettingsTextField
          label="Email"
          value={data.email}
          disabled={!editMode}
          onChange={(v) => onFieldChange("email", v)}
          placeholder="Enter your email"
          type="email"
        />
        <div style={fieldGroupStyle}>
          <label style={fieldLabelStyle}>Phone</label>
          <PhoneNumberField
            value={data.phone}
            disabled={!editMode}
            onChange={(v) => onFieldChange("phone", v)}
            placeholder="Mobile number"
            testId="employer-account-phone"
          />
        </div>
      </div>

      <div
        style={{
          ...fieldGroupStyle,
          marginTop: 4,
          padding: "12px 14px",
          borderRadius: "var(--wm-radius-chip)",
          background: "rgba(3,105,161,0.06)",
          border: "1px solid rgba(3,105,161,0.12)",
        }}
      >
        <div style={{ fontSize: 12, color: "#0f172a", fontWeight: 700, lineHeight: 1.5 }}>
          Your account is personal. The business profile belongs to the company.
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.45 }}>
          Security and notification settings are in Settings.
        </div>
      </div>
    </section>
  );
}
