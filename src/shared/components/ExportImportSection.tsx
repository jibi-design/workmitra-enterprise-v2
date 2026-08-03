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

export function ExportImportSection() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [exportDone, setExportDone] = useState(false);
  const [error, setError] = useState("");
  const [validation, setValidation] = useState<(ImportValidation & { valid: true }) | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  function handleExport() {
    exportData();
    setExportDone(true);
    setTimeout(() => setExportDone(false), 3000);
  }

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

  function handleCancel() {
    setValidation(null);
    setSelectedFile(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <section className="wm-settingsGroup">
      <div className="wm-settingsGroup__title">Backup and restore</div>
      <div className="wm-helpSectionSub">
        Export your data as a backup file. Import to restore on a new device.
      </div>
      <div className="wm-settingsBackupNote">
        Documents are not included in backup. Please keep copies of your uploaded documents
        separately.
      </div>

      <div className="wm-settingsBackupActions">
        <button
          type="button"
          className="wm-settingsBackupBtn wm-settingsBackupBtn--export"
          onClick={handleExport}
        >
          <IconDownload />
          {exportDone ? "Downloaded!" : "Export my data"}
        </button>

        <input
          ref={fileRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
        <button
          type="button"
          className="wm-settingsBackupBtn wm-settingsBackupBtn--import"
          onClick={() => fileRef.current?.click()}
        >
          <IconUpload />
          Import backup
        </button>
      </div>

      {error ? <div className="wm-settingsBackupError">{error}</div> : null}

      {validation && selectedFile ? (
        <div className="wm-settingsBackupConfirm">
          <div className="wm-settingsBackupConfirm__title">Confirm import</div>
          <div className="wm-settingsBackupConfirm__body">
            This backup is from <b>{formatExportDate(validation.exportedAt)}</b>. Importing will
            replace ALL your current data with this backup. Any data added after this date will be
            lost.
          </div>
          <div className="wm-settingsBackupConfirm__meta">
            {validation.keyCount} data entries will be restored.
          </div>
          <div className="wm-settingsBackupConfirm__actions">
            <button type="button" className="wm-outlineBtn" onClick={handleCancel}>
              Cancel
            </button>
            <button
              type="button"
              className="wm-dangerBtn"
              onClick={handleImportConfirm}
              disabled={importing}
            >
              {importing ? "Restoring..." : "Replace all data"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
