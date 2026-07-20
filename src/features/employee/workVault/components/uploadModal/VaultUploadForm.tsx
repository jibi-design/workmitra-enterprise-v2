// App: Job Mitra / WorkMitra_Enterprise_v2
// File: VaultUploadForm.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\uploadModal\VaultUploadForm.tsx

import type { RefObject } from "react";
import { VAULT_ACCENT } from "../../constants/vaultConstants";

type Props = {
  name: string;
  expiryDate: string;
  fileName: string;
  error: string;
  uploading: boolean;
  acceptTypes: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onNameChange: (value: string) => void;
  onExpiryDateChange: (value: string) => void;
  onFilePick: (file: File | null) => void;
  onClose: () => void;
  onUpload: () => void;
};

export function VaultUploadForm({
  name,
  expiryDate,
  fileName,
  error,
  uploading,
  acceptTypes,
  fileInputRef,
  onNameChange,
  onExpiryDateChange,
  onFilePick,
  onClose,
  onUpload,
}: Props) {
  return (
    <div style={{ padding: "20px 20px 16px" }}>
      <div style={{ fontWeight: 900, fontSize: 16, color: "var(--wm-emp-text)", marginBottom: 16 }}>
        Upload Document
      </div>

      <div style={{ marginBottom: 12 }}>
        <label
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--wm-emp-muted)",
            marginBottom: 6,
            display: "block",
          }}
        >
          Document name <span style={{ color: "var(--wm-error)" }}>*</span>
        </label>

        <input
          className="wm-input"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="e.g. Driving License"
          autoFocus
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--wm-emp-muted)",
            marginBottom: 6,
            display: "block",
          }}
        >
          Select file <span style={{ color: "var(--wm-error)" }}>*</span>
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptTypes}
          style={{ display: "none" }}
          onChange={(event) => onFilePick(event.target.files?.[0] ?? null)}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              height: 36,
              padding: "0 14px",
              borderRadius: 10,
              border: `1.5px solid ${VAULT_ACCENT}`,
              background: "transparent",
              color: VAULT_ACCENT,
              fontWeight: 800,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Choose File
          </button>

          <span style={{ fontSize: 12, color: "var(--wm-emp-muted)", fontWeight: 600 }}>
            {fileName || "No file selected"}
          </span>
        </div>

        <div style={{ fontSize: 11, color: "var(--wm-emp-muted)", marginTop: 4 }}>
          JPEG, PNG, WebP, or PDF. Max 1 MB.
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--wm-emp-muted)",
            marginBottom: 6,
            display: "block",
          }}
        >
          Expiry date (optional)
        </label>

        <input
          className="wm-input"
          type="date"
          value={expiryDate}
          onChange={(event) => onExpiryDateChange(event.target.value)}
        />

        <div style={{ fontSize: 11, color: "var(--wm-emp-muted)", marginTop: 4 }}>
          For licenses, passports, or certificates with a validity period.
        </div>
      </div>

      {error && (
        <div style={{ fontSize: 12, color: "var(--wm-error)", fontWeight: 600, marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button className="wm-outlineBtn" type="button" onClick={onClose} disabled={uploading}>
          Cancel
        </button>

        <button
          type="button"
          onClick={onUpload}
          disabled={uploading}
          style={{
            height: 38,
            padding: "0 20px",
            borderRadius: 10,
            border: "none",
            background: uploading ? "var(--wm-emp-muted)" : VAULT_ACCENT,
            color: "#fff",
            fontWeight: 900,
            fontSize: 13,
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.6 : 1,
          }}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}
