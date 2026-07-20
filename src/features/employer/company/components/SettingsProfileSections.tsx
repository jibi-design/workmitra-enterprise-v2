// src/features/employer/company/components/SettingsProfileSections.tsx
// Company Profile + Account Info sections for Employer Settings.
// Session 7: universal placeholders, logo upload, focus = purple.

import { useMemo, useRef, useState } from "react";
import type { EmployerProfile } from "../storage/employerSettings.storage";
import { INDUSTRY_OPTIONS, COMPANY_SIZE_OPTIONS } from "../storage/employerSettings.storage";
import { SettingsTextField, SettingsSelectField } from "./SettingsFormFields";
import { IconCompany, IconAccount, IconLogo } from "../helpers/settingsIcons";
import { MAX_COMPANY_LOGO_BYTES, readImageAsDataUrl } from "../helpers/employerProfileHelpers";
import type { NoticeData } from "../../../../shared/components/NoticeModal";
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
  onNotice?: (notice: NoticeData) => void;
  /** When set, logo tap can enter edit mode before opening the file picker. */
  onLogoUploadRequest?: () => void;
}

const LOGO_SIZE_PX = 72;

export function CompanyLogoPicker({
  logoDataUrl,
  editMode,
  onFieldChange,
  onNotice,
  onLogoUploadRequest,
  alwaysAllowUpload = false,
}: {
  logoDataUrl?: string;
  editMode: boolean;
  onFieldChange: SectionProps["onFieldChange"];
  onNotice?: SectionProps["onNotice"];
  onLogoUploadRequest?: SectionProps["onLogoUploadRequest"];
  alwaysAllowUpload?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const hasLogo = Boolean(logoDataUrl?.trim());

  async function onLogoPicked(file: File | null): Promise<void> {
    if (!file) return;

    if (!editMode && !alwaysAllowUpload) {
      onLogoUploadRequest?.();
    }

    if (file.size > MAX_COMPANY_LOGO_BYTES) {
      onNotice?.({
        title: "Logo Too Large",
        message: "Please choose an image under 2 MB.",
        tone: "warn",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      onNotice?.({
        title: "Invalid File",
        message: "Please choose a valid image file.",
        tone: "warn",
      });
      return;
    }

    try {
      const dataUrl = await readImageAsDataUrl(file);
      onFieldChange("companyLogo", dataUrl);
    } catch {
      onNotice?.({
        title: "Upload Failed",
        message: "Could not read the image. Please try another file.",
        tone: "error",
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function openPicker(): void {
    if (!editMode && !alwaysAllowUpload) {
      onLogoUploadRequest?.();
    }
    fileInputRef.current?.click();
  }

  function removeLogo(event: React.MouseEvent): void {
    event.stopPropagation();
    onFieldChange("companyLogo", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        style={{ display: "none" }}
        aria-hidden="true"
        tabIndex={-1}
        onChange={(event) => void onLogoPicked(event.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        data-testid="employer-company-logo-picker"
        onClick={openPicker}
        disabled={false}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={hasLogo ? "Change company logo" : "Upload company logo"}
        style={{
          width: LOGO_SIZE_PX,
          height: LOGO_SIZE_PX,
          borderRadius: 16,
          padding: 0,
          border: hasLogo ? "1px solid rgba(148, 163, 184, 0.45)" : "2px dashed #d1d5db",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: hasLogo
            ? "#ffffff"
            : "linear-gradient(135deg, rgba(124, 58, 237, 0.14), rgba(99, 102, 241, 0.08))",
          overflow: "hidden",
          flexShrink: 0,
          position: "relative",
          cursor: "pointer",
          touchAction: "manipulation",
        }}
      >
        {hasLogo ? (
          <img
            src={logoDataUrl}
            alt="Company logo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <IconLogo />
        )}

        {hasLogo && (editMode || alwaysAllowUpload) && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(15, 23, 42, 0.48)",
              color: "#ffffff",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 0.2,
              opacity: isHovered ? 1 : 0.82,
              transition: "opacity 0.18s ease",
            }}
          >
            Change
          </div>
        )}

        {hasLogo && (editMode || alwaysAllowUpload) && (
          <button
            type="button"
            aria-label="Remove company logo"
            onClick={removeLogo}
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              width: 22,
              height: 22,
              borderRadius: 999,
              border: "1px solid rgba(255, 255, 255, 0.65)",
              background: "rgba(15, 23, 42, 0.72)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
              zIndex: 2,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 1 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4Z"
              />
            </svg>
          </button>
        )}
      </button>

      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>
          Business logo
        </div>
        <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 3, fontWeight: 500 }}>
          {hasLogo ? "Tap to change · Max 2 MB" : "Tap to upload · Max 2 MB"}
        </div>
        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4, lineHeight: 1.4 }}>
          Logo is saved on this device until cloud sync is available.
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Company Profile Section                          */
/* ------------------------------------------------ */
export function CompanyProfileSection({
  data,
  editMode,
  onFieldChange,
  onNotice,
  onLogoUploadRequest,
}: SectionProps) {
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
