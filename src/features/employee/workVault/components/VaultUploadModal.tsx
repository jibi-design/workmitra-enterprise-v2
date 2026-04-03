// src/features/employee/workVault/components/VaultUploadModal.tsx

import { useRef, useState } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import { VAULT_ACCENT, ALLOWED_FILE_TYPES } from "../constants/vaultConstants";
import { validateDocumentName, validateFile } from "../helpers/vaultValidation";
import type { VaultFileType } from "../types/vaultTypes";

/* ------------------------------------------------ */
/* Helpers                                          */
/* ------------------------------------------------ */
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("File read failed."));
    reader.readAsDataURL(file);
  });
}

function generateThumbnail(base64: string, maxSize: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.6));
      } else {
        resolve("");
      }
    };
    img.onerror = () => resolve("");
    img.src = base64;
  });
}

function detectFileType(file: File): VaultFileType {
  return file.type === "application/pdf" ? "pdf" : "image";
}

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type VaultUploadModalProps = {
  open: boolean;
  onClose: () => void;
  onUpload: (data: {
    name: string;
    fileType: VaultFileType;
    base64Data: string;
    thumbnailBase64: string;
    expiryDate: string | null;
  }) => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function VaultUploadModal({ open, onClose, onUpload }: VaultUploadModalProps) {
  const [name, setName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function resetForm() {
    setName("");
    setExpiryDate("");
    setSelectedFile(null);
    setFileName("");
    setError("");
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleFilePick(file: File | null) {
    if (!file) return;
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.reason);
      return;
    }
    setSelectedFile(file);
    setFileName(file.name);
    setError("");

    if (!name.trim()) {
      const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ");
      setName(baseName);
    }
  }

  async function handleUpload() {
    const nameCheck = validateDocumentName(name);
    if (!nameCheck.valid) {
      setError(nameCheck.reason);
      return;
    }
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const base64Data = await readFileAsBase64(selectedFile);
      const fileType = detectFileType(selectedFile);

      let thumbnailBase64 = "";
      if (fileType === "image") {
        thumbnailBase64 = await generateThumbnail(base64Data, 120);
      }

      onUpload({
        name: name.trim(),
        fileType,
        base64Data,
        thumbnailBase64,
        expiryDate: expiryDate.trim() || null,
      });

      resetForm();
    } catch {
      setError("Failed to read the file. Please try again.");
      setUploading(false);
    }
  }

  const acceptTypes = ALLOWED_FILE_TYPES.join(",");

  return (
    <CenterModal open={open} onBackdropClose={handleClose} ariaLabel="Upload document">
      <div style={{ padding: "20px 20px 16px" }}>
        {/* Header */}
        <div style={{ fontWeight: 900, fontSize: 16, color: "var(--wm-emp-text)", marginBottom: 16 }}>
          Upload Document
        </div>

        {/* Document name */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-emp-muted)", marginBottom: 6, display: "block" }}>
            Document name <span style={{ color: "var(--wm-error)" }}>*</span>
          </label>
          <input
            className="wm-input"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError("");
            }}
            placeholder="e.g. Driving License"
            autoFocus
          />
        </div>

        {/* File picker */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-emp-muted)", marginBottom: 6, display: "block" }}>
            Select file <span style={{ color: "var(--wm-error)" }}>*</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptTypes}
            style={{ display: "none" }}
            onChange={(e) => handleFilePick(e.target.files?.[0] ?? null)}
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

        {/* Expiry date (optional) */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-emp-muted)", marginBottom: 6, display: "block" }}>
            Expiry date (optional)
          </label>
          <input
            className="wm-input"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
          <div style={{ fontSize: 11, color: "var(--wm-emp-muted)", marginTop: 4 }}>
            For licenses, passports, or certificates with a validity period.
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ fontSize: 12, color: "var(--wm-error)", fontWeight: 600, marginBottom: 12 }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="wm-outlineBtn" type="button" onClick={handleClose} disabled={uploading}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleUpload()}
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
    </CenterModal>
  );
}