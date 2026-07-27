import { useRef, useState } from "react";
import { IconLogo } from "../helpers/settingsIcons";
import { MAX_COMPANY_LOGO_BYTES, readImageAsDataUrl } from "../helpers/employerProfileHelpers";
import type { SettingsSectionProps } from "./settingsProfileSections.shared";

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
  onFieldChange: SettingsSectionProps["onFieldChange"];
  onNotice?: SettingsSectionProps["onNotice"];
  onLogoUploadRequest?: SettingsSectionProps["onLogoUploadRequest"];
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
          borderRadius: "var(--wm-radius-chip)",
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
              borderRadius: "var(--wm-radius-pill)",
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
