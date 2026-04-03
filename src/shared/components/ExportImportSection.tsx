// src/shared/components/ExportImportSection.tsx
//
// Export/Import data section for Settings pages.
// Export: instant JSON download. Import: validate → confirm → restore → reload.
// Vault documents excluded — note shown to user.

import { useState, useRef } from "react";
import {
  exportData,
  validateImportFile,
  importData,
  formatExportDate,
} from "../utils/dataExportService";
import type { ImportValidation } from "../utils/dataExportService";

/* ------------------------------------------------ */
/* Icons                                            */
/* ------------------------------------------------ */
function IconDownload() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7ZM5 18v2h14v-2H5Z" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M9 16h6v-6h4l-7-7-7 7h4v6Zm-4 2h14v2H5v-2Z" />
    </svg>
  );
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function ExportImportSection() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [exportDone, setExportDone] = useState(false);
  const [error, setError] = useState("");
  const [validation, setValidation] = useState<(ImportValidation & { valid: true }) | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  /* ---- Export ---- */
  function handleExport() {
    exportData();
    setExportDone(true);
    setTimeout(() => setExportDone(false), 3000);
  }

  /* ---- File select ---- */
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setError("");
    setValidation(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await validateImportFile(file);
    if (!result.valid) {
      setError(result.reason);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setValidation(result);
  }

  /* ---- Import confirm ---- */
  async function handleImportConfirm() {
    if (!selectedFile) return;
    setImporting(true);
    const result = await importData(selectedFile);
    setImporting(false);

    if (!result.success) {
      setError(result.reason);
      return;
    }

    window.location.reload();
  }

  /* ---- Cancel ---- */
  function handleCancel() {
    setValidation(null);
    setSelectedFile(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div style={{
      marginTop: 14, padding: "16px", borderRadius: 14,
      border: "1px solid var(--wm-er-border)", background: "var(--wm-er-card, #fff)",
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>
        Backup and restore
      </div>
      <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4, lineHeight: 1.5 }}>
        Export your data as a backup file. Import to restore on a new device.
      </div>
      <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 4, fontStyle: "italic" }}>
        Documents are not included in backup. Please keep copies of your uploaded documents separately.
      </div>

      {/* Export */}
      <button
        type="button"
        onClick={handleExport}
        style={{
          marginTop: 12, width: "100%", padding: "11px 16px", borderRadius: 10,
          border: "1px solid var(--wm-er-accent-career, #1d4ed8)",
          background: "rgba(29,78,216,0.06)",
          color: "var(--wm-er-accent-career, #1d4ed8)",
          fontSize: 13, fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        <IconDownload />
        {exportDone ? "Downloaded!" : "Export my data"}
      </button>

      {/* Import */}
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        style={{
          marginTop: 8, width: "100%", padding: "11px 16px", borderRadius: 10,
          border: "1px solid var(--wm-er-border)",
          background: "#fff",
          color: "var(--wm-er-text)",
          fontSize: 13, fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        <IconUpload />
        Import backup
      </button>

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 10, padding: "10px 14px", borderRadius: 10,
          background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.18)",
          fontSize: 12, fontWeight: 600, color: "var(--wm-error, #dc2626)",
        }}>
          {error}
        </div>
      )}

      {/* Import confirmation */}
      {validation && selectedFile && (
        <div style={{
          marginTop: 10, padding: "14px", borderRadius: 10,
          background: "rgba(217,119,6,0.06)", border: "1px solid rgba(217,119,6,0.25)",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>
            Confirm import
          </div>
          <div style={{ fontSize: 12, color: "#92400e", marginTop: 6, lineHeight: 1.6 }}>
            This backup is from <b>{formatExportDate(validation.exportedAt)}</b>.
            Importing will replace ALL your current data with this backup.
            Any data added after this date will be lost.
          </div>
          <div style={{ fontSize: 11, color: "#92400e", marginTop: 4 }}>
            {validation.keyCount} data entries will be restored.
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: "8px 16px", borderRadius: 8,
                border: "1px solid var(--wm-er-border)", background: "#fff",
                fontSize: 12, fontWeight: 600, color: "var(--wm-er-text)", cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImportConfirm}
              disabled={importing}
              style={{
                padding: "8px 16px", borderRadius: 8, border: "none",
                background: "#dc2626", color: "#fff",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}
            >
              {importing ? "Restoring..." : "Replace all data"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}