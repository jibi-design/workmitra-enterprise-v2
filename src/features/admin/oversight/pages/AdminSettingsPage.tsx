// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminSettingsPage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\oversight\pages\AdminSettingsPage.tsx

import { useCallback, useState } from "react";
import { AdminSettingsAboutCard } from "../components/adminSettings/AdminSettingsAboutCard";
import { AdminSettingsClearCard } from "../components/adminSettings/AdminSettingsClearCard";
import { AdminSettingsConfirmModal } from "../components/adminSettings/AdminSettingsConfirmModal";
import { AdminSettingsDataCard } from "../components/adminSettings/AdminSettingsDataCard";
import { AdminSettingsHeader } from "../components/adminSettings/AdminSettingsHeader";
import { AdminSettingsSectionHeader } from "../components/adminSettings/AdminSettingsSharedUi";
import { pushAdminAuditEntry } from "../helpers/adminDataHelpers";
import { buildSanitizedLocalStorageExport } from "../../../../shared/security/piiExportSanitize";

const SHIFT_KEYS = [
  "wm_employer_shift_posts_v1",
  "wm_employee_shift_applications_v1",
  "wm_employee_shift_workspaces_v1",
  "wm_employer_shift_activity_log_v1",
  "wm_employee_shift_posts_demo_v1",
];

const CAREER_KEYS = [
  "wm_employer_career_posts_v1",
  "wm_employee_career_applications_v1",
  "wm_employee_career_workspaces_v1",
  "wm_employer_career_activity_log_v1",
  "wm_employee_career_posts_search_v1",
];

const WORKFORCE_KEYS: string[] = [];

function exportAllData(): void {
  try {
    const data = buildSanitizedLocalStorageExport();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `job-mitra-export-sanitized-${Date.now()}.json`;
    anchor.click();

    URL.revokeObjectURL(url);
    pushAdminAuditEntry(
      "data_exported",
      "Data exported",
      `Sanitized localStorage export (PII redacted/hashed). ${localStorage.length} keys scanned.`,
    );
  } catch {
    // Phase-0 local export failure is intentionally non-blocking.
  }
}

function importData(
  file: File,
): Promise<{ success: boolean; keysImported: number; error?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = reader.result as string;
        const data = JSON.parse(text) as Record<string, unknown>;

        if (typeof data !== "object" || data === null || Array.isArray(data)) {
          resolve({
            success: false,
            keysImported: 0,
            error: "Invalid JSON format. Expected an object.",
          });
          return;
        }

        let count = 0;

        for (const [key, value] of Object.entries(data)) {
          if (key === "_meta" || key === "wm_pii_device_key_v1") continue;
          if (value && typeof value === "object" && !Array.isArray(value) && "sealed" in value) {
            continue; // never restore export stubs as real PII
          }
          try {
            localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
            count++;
          } catch {
            // Skip keys that cannot be restored.
          }
        }

        pushAdminAuditEntry("data_imported", "Data imported", `${count} keys imported from file.`);
        resolve({ success: true, keysImported: count });
      } catch {
        resolve({ success: false, keysImported: 0, error: "Failed to parse JSON file." });
      }
    };

    reader.onerror = () =>
      resolve({ success: false, keysImported: 0, error: "Failed to read file." });
    reader.readAsText(file);
  });
}

function clearDomainKeys(keys: string[], domainName: string): number {
  let cleared = 0;

  for (const key of keys) {
    if (localStorage.getItem(key) !== null) {
      localStorage.removeItem(key);
      cleared++;
    }
  }

  if (cleared > 0) {
    pushAdminAuditEntry(
      "selective_clear",
      `${domainName} data cleared`,
      `${cleared} storage keys removed.`,
    );
  }

  return cleared;
}

function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / 1048576).toFixed(2)} MB`;
}

function getStorageInfo(): { keys: number; bytes: number } {
  let bytes = 0;
  const keys = localStorage.length;

  for (let index = 0; index < keys; index++) {
    const key = localStorage.key(index);

    if (key) {
      const value = localStorage.getItem(key);

      if (value) {
        bytes += key.length + value.length;
      }
    }
  }

  return { keys, bytes };
}

export function AdminSettingsPage() {
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    body: string;
    action: () => void;
  }>({ open: false, title: "", body: "", action: () => {} });
  const [importResult, setImportResult] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const storage = getStorageInfo();
  void refreshKey;

  const handleImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const result = await importData(file);

    if (result.success) {
      setImportResult(`Imported ${result.keysImported} keys successfully. Reload recommended.`);
    } else {
      setImportResult(`Import failed: ${result.error}`);
    }

    event.target.value = "";
    setRefreshKey((key) => key + 1);
  }, []);

  const openClear = useCallback((title: string, body: string, action: () => void) => {
    setConfirmModal({ open: true, title, body, action });
  }, []);

  const executeClear = () => {
    confirmModal.action();
    setConfirmModal((previous) => ({ ...previous, open: false }));
    setRefreshKey((key) => key + 1);
  };

  return (
    <div className="wm-ad-fadeIn">
      <AdminSettingsConfirmModal
        confirmModal={confirmModal}
        onCancel={() => setConfirmModal((previous) => ({ ...previous, open: false }))}
        onConfirm={executeClear}
      />

      <AdminSettingsHeader />

      <AdminSettingsSectionHeader label="Data Management" />
      <AdminSettingsDataCard
        storageKeys={storage.keys}
        storageBytes={storage.bytes}
        importResult={importResult}
        formatBytes={fmtBytes}
        onExportAllData={exportAllData}
        onImport={handleImport}
      />

      <AdminSettingsSectionHeader label="Selective Clear" />
      <AdminSettingsClearCard
        hasWorkforceKeys={WORKFORCE_KEYS.length > 0}
        onClearShiftJobs={() =>
          openClear(
            "Clear Shift Jobs Data?",
            "This will remove all shift job posts, applications, workspaces, and activity logs. Cannot be undone.",
            () => {
              clearDomainKeys(SHIFT_KEYS, "Shift Jobs");
              window.location.reload();
            },
          )
        }
        onClearCareerJobs={() =>
          openClear(
            "Clear Career Jobs Data?",
            "This will remove all career job posts, applications, workspaces, and activity logs. Cannot be undone.",
            () => {
              clearDomainKeys(CAREER_KEYS, "Career Jobs");
              window.location.reload();
            },
          )
        }
        onResetAllData={() =>
          openClear(
            "Reset All Data?",
            "This will clear ALL localStorage data across all domains. Profiles, posts, applications — everything. Cannot be undone.",
            () => {
              // DANGER MIG-010: nuclear clear — remove before production cutover
              if (!window.confirm("WARNING: This will clear ALL local data. Continue?")) return;
              localStorage.clear();
              window.location.reload();
            },
          )
        }
      />

      <AdminSettingsSectionHeader label="About" />
      <AdminSettingsAboutCard />

      <div style={{ height: 32 }} />
    </div>
  );
}
