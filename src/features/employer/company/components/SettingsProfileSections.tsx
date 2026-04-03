// src/features/employer/company/components/SettingsProfileSections.tsx
// Company Profile + Account Info sections for Employer Settings.
// Session 7: universal placeholders, logo "Tap to upload", focus = purple.

import { useMemo } from "react";
import type { EmployerProfile } from "../storage/employerSettings.storage";
import {
  INDUSTRY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
} from "../storage/employerSettings.storage";
import { SettingsTextField, SettingsSelectField } from "./SettingsFormFields";
import { IconCompany, IconAccount, IconLogo } from "../helpers/settingsIcons";
import {
  sectionHeadStyle,
  sectionIconStyle,
  sectionTitleStyle,
  fieldGroupStyle,
  fieldLabelStyle,
  fieldTextareaStyle,
  fieldTextareaDisabledStyle,
  fieldRowStyle,
  logoPlaceholderStyle,
} from "../helpers/settingsStyles";

/* ------------------------------------------------ */
/* Constants                                        */
/* ------------------------------------------------ */
const FOCUS_COLOR = "var(--wm-er-accent-hr)";
const BORDER_RESET = "#d1d5db";

/* ------------------------------------------------ */
/* Shared prop types                                */
/* ------------------------------------------------ */
interface SectionProps {
  data: EmployerProfile;
  editMode: boolean;
  onFieldChange: (field: keyof EmployerProfile, value: string | boolean) => void;
}

/* ------------------------------------------------ */
/* Company Profile Section                          */
/* ------------------------------------------------ */
export function CompanyProfileSection({ data, editMode, onFieldChange }: SectionProps) {
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

      {/* Logo placeholder */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <div style={logoPlaceholderStyle}>
          <IconLogo />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>
            Company Logo
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 3, fontWeight: 500 }}>
            Tap to upload
          </div>
        </div>
      </div>

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

      {/* Description textarea */}
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
            if (editMode) e.currentTarget.style.borderColor = FOCUS_COLOR;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = BORDER_RESET;
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

/* ------------------------------------------------ */
/* Account Info Section                             */
/* ------------------------------------------------ */
export function AccountInfoSection({ data, editMode, onFieldChange }: SectionProps) {
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
      <SettingsTextField
        label="Phone"
        value={data.phone}
        disabled={!editMode}
        onChange={(v) => onFieldChange("phone", v)}
        placeholder="Enter phone number"
        type="tel"
      />
    </div>
  );
}