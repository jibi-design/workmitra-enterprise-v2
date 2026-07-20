/** Section 2 — Business profile (company / shop identity). */

import { useMemo } from "react";
import type { EmployerProfile } from "../../storage/employerSettings.storage";
import { INDUSTRY_OPTIONS, COMPANY_SIZE_OPTIONS } from "../../storage/employerSettings.storage";
import { SettingsTextField, SettingsSelectField } from "../SettingsFormFields";
import { CompanyLogoPicker } from "../SettingsProfileSections";
import { IconCompany } from "../../helpers/settingsIcons";
import { getPublicProfilePath, resolvePublicHandle } from "../../helpers/employerIdentity.helpers";
import {
  EXECUTIVE_CARD_SHELL,
  EXECUTIVE_HELPER,
  EXECUTIVE_SECTION_KICKER,
  EXECUTIVE_SECTION_TITLE,
} from "../../helpers/employerProfileCard.styles";
import {
  fieldGroupStyle,
  fieldLabelStyle,
  fieldTextareaStyle,
  fieldTextareaDisabledStyle,
  fieldRowStyle,
} from "../../helpers/settingsStyles";
import type { NoticeData } from "../../../../../shared/components/NoticeModal";

const FOCUS_COLOR = "var(--wm-er-accent-hr)";
const BORDER_RESET = "#d1d5db";

type Props = {
  readonly data: EmployerProfile;
  readonly editMode: boolean;
  readonly onFieldChange: (field: keyof EmployerProfile, value: string | boolean) => void;
  readonly onNotice?: (notice: NoticeData) => void;
  readonly onLogoPersist?: (logoDataUrl: string) => void;
};

export function BusinessProfileSection({
  data,
  editMode,
  onFieldChange,
  onNotice,
  onLogoPersist,
}: Props) {
  const charCount = useMemo(() => data.companyDescription.length, [data.companyDescription]);
  const charOverLimit = charCount > 200;
  const publicHandle = resolvePublicHandle(data);
  const publicLink = getPublicProfilePath(publicHandle);

  function handleLogoChange(field: keyof EmployerProfile, value: string | boolean): void {
    onFieldChange(field, value);
    if (field === "companyLogo" && typeof value === "string") {
      onLogoPersist?.(value);
    }
  }

  return (
    <section style={EXECUTIVE_CARD_SHELL} data-testid="employer-business-profile-section">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 12,
            background: "rgba(124,58,237,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#7c3aed",
          }}
        >
          <IconCompany />
        </div>
        <div>
          <div style={EXECUTIVE_SECTION_KICKER}>Business profile</div>
          <h2 style={{ ...EXECUTIVE_SECTION_TITLE, marginTop: 2 }}>
            നിങ്ങളുടെ സ്ഥാപനത്തിന്റെ പ്രൊഫൈൽ
          </h2>
        </div>
      </div>

      <p style={EXECUTIVE_HELPER}>
        Business name can change. Ratings and history stay with this business profile.
      </p>

      <CompanyLogoPicker
        logoDataUrl={data.companyLogo}
        editMode={editMode}
        onFieldChange={handleLogoChange}
        onNotice={onNotice}
        onLogoUploadRequest={undefined}
        alwaysAllowUpload
      />

      <SettingsTextField
        label="Business name"
        value={data.companyName}
        disabled={!editMode}
        onChange={(v) => onFieldChange("companyName", v)}
        placeholder="Enter your business name"
        required
        capitalizeWords
        minLength={2}
      />

      <div style={fieldRowStyle}>
        <SettingsSelectField
          label="Category"
          value={data.industryType}
          disabled={!editMode}
          onChange={(v) => onFieldChange("industryType", v)}
          options={INDUSTRY_OPTIONS}
          placeholder="Select category"
        />
        <SettingsSelectField
          label="Business size"
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

      <SettingsTextField
        label="Public profile link"
        value={editMode ? (data.publicHandle ?? publicHandle) : publicHandle}
        disabled={!editMode}
        onChange={(v) => onFieldChange("publicHandle", v.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
        placeholder="your-business-name"
      />
      <div style={{ marginTop: 5, fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.45 }}>
        {publicLink}
      </div>

      <div style={{ ...fieldGroupStyle, marginTop: 12 }}>
        <label style={fieldLabelStyle}>About your business</label>
        <textarea
          value={data.companyDescription}
          placeholder="Brief description (max 200 characters)"
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
        {editMode ? (
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
        ) : null}
      </div>
    </section>
  );
}
