// Facade — SettingsProfileSections.tsx

import { useMemo } from "react";
import { PhoneNumberField } from "../../../../shared/phone";
import { INDUSTRY_OPTIONS, COMPANY_SIZE_OPTIONS } from "../storage/employerSettings.storage";
import { SettingsTextField, SettingsSelectField } from "./SettingsFormFields";
import { IconCompany, IconAccount } from "../helpers/settingsIcons";
import {
  sectionHeadStyle,
  sectionIconStyle,
  sectionTitleStyle,
  fieldGroupStyle,
  fieldLabelStyle,
  fieldTextareaStyle,
  fieldTextareaDisabledStyle,
  fieldRowStyle,
} from "../helpers/settingsStyles";
import { CompanyLogoPicker } from "./SettingsCompanyLogoPicker";
import {
  SETTINGS_BORDER_RESET,
  SETTINGS_FOCUS_COLOR,
  type SettingsSectionProps,
} from "./settingsProfileSections.shared";

export { CompanyLogoPicker } from "./SettingsCompanyLogoPicker";

export function CompanyProfileSection({
  data,
  editMode,
  onFieldChange,
  onNotice,
  onLogoUploadRequest,
}: SettingsSectionProps) {
  const charCount = useMemo(() => data.companyDescription.length, [data.companyDescription]);
  const charOverLimit = charCount > 200;

  return (
    <div className="wm-er-card" style={{ marginTop: 12 }}>
      <div style={sectionHeadStyle}>
        <div style={sectionIconStyle}>
          <IconCompany />
        </div>
        <h2 style={sectionTitleStyle}>Company Profile</h2>
      </div>

      <CompanyLogoPicker
        logoDataUrl={data.companyLogo}
        editMode={editMode}
        onFieldChange={onFieldChange}
        onNotice={onNotice}
        onLogoUploadRequest={onLogoUploadRequest}
      />

      <SettingsTextField
        label="Company Name"
        value={data.companyName}
        disabled={!editMode}
        onChange={(v) => onFieldChange("companyName", v)}
        placeholder="Enter your company name"
        required
        capitalizeWords
        minLength={2}
      />

      <div style={fieldGroupStyle}>
        <SettingsTextField
          label="Company Registration / License No."
          value={data.registrationNo}
          disabled={!editMode}
          onChange={(v) => onFieldChange("registrationNo", v)}
          placeholder="Enter GST, CIN, or local trade license"
        />
        <div
          style={{
            marginTop: 5,
            fontSize: 11,
            color: "var(--wm-er-muted)",
            lineHeight: 1.45,
            fontWeight: 500,
          }}
        >
          GST, CIN, or local trade license number for official business verification.
        </div>
      </div>

      <div style={fieldRowStyle}>
        <SettingsSelectField
          label="Industry Type"
          value={data.industryType}
          disabled={!editMode}
          onChange={(v) => onFieldChange("industryType", v)}
          options={INDUSTRY_OPTIONS}
          placeholder="Select industry"
        />
        <SettingsSelectField
          label="Company Size"
          value={data.companySize}
          disabled={!editMode}
          onChange={(v) => onFieldChange("companySize", v)}
          options={COMPANY_SIZE_OPTIONS}
          placeholder="Select size"
        />
      </div>

      <div style={fieldRowStyle}>
        <SettingsTextField
          label="City"
          value={data.locationCity}
          disabled={!editMode}
          onChange={(v) => onFieldChange("locationCity", v)}
          placeholder="Enter your city"
          capitalizeWords
        />
        <SettingsTextField
          label="State / Province"
          value={data.locationState}
          disabled={!editMode}
          onChange={(v) => onFieldChange("locationState", v)}
          placeholder="Enter your state"
          capitalizeWords
        />
      </div>

      <div style={fieldGroupStyle}>
        <label style={fieldLabelStyle}>Company Description</label>
        <textarea
          value={data.companyDescription}
          placeholder="Brief description of your company (max 200 characters)"
          disabled={!editMode}
          maxLength={210}
          onChange={(e) => onFieldChange("companyDescription", e.target.value)}
          style={editMode ? fieldTextareaStyle : fieldTextareaDisabledStyle}
          onFocus={(e) => {
            if (editMode) e.currentTarget.style.borderColor = SETTINGS_FOCUS_COLOR;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = SETTINGS_BORDER_RESET;
          }}
        />
        {editMode && (
          <div
            style={{
              textAlign: "right",
              fontSize: 11,
              fontWeight: 600,
              marginTop: 3,
              color: charOverLimit ? "var(--wm-error)" : "var(--wm-er-muted)",
            }}
          >
            {charCount}/200
          </div>
        )}
      </div>
    </div>
  );
}

export function AccountInfoSection({ data, editMode, onFieldChange }: SettingsSectionProps) {
  return (
    <div className="wm-er-card" style={{ marginTop: 12 }}>
      <div style={sectionHeadStyle}>
        <div style={sectionIconStyle}>
          <IconAccount />
        </div>
        <h2 style={sectionTitleStyle}>Account Info</h2>
      </div>

      <SettingsTextField
        label="Full Name"
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
          testId="employer-settings-phone"
        />
      </div>
    </div>
  );
}
