// src/shared/utils/dataExportService.ts
//
// Data Export/Import — backup all localStorage to JSON file.
// Vault documents excluded (too large). Metadata only.
// Import: version gate + role check + date-aware confirmation.

/* ------------------------------------------------ */
/* Constants                                        */
/* ------------------------------------------------ */
const APP_ID = "WorkMitra";
const CURRENT_VERSION = "1.0";

/** Keys that contain large binary/base64 document data — excluded from export */
const EXCLUDED_KEYS = [
  "wm_employee_vault_documents_v1",
] as const;

/* ------------------------------------------------ */
/* Export types                                     */
/* ------------------------------------------------ */
export type ExportPayload = {
  app: string;
  version: string;
  exportedAt: number;
  role: "employee" | "employer";
  keyCount: number;
  data: Record<string, string>;
};

export type ImportValidation =
  | { valid: true; exportedAt: number; role: string; keyCount: number }
  | { valid: false; reason: string };

export type ImportResult =
  | { success: true; keysRestored: number }
  | { success: false; reason: string };

/* ------------------------------------------------ */
/* Role detection                                   */
/* ------------------------------------------------ */
function detectRole(): "employee" | "employer" {
  try {
    const raw = localStorage.getItem("wm_app_role_v1");
    if (raw === "employer") return "employer";
  } catch { /* safe */ }
  return "employee";
}

/* ------------------------------------------------ */
/* Export                                           */
/* ------------------------------------------------ */
export function exportData(): void {
  const role = detectRole();
  const data: Record<string, string> = {};
  const excludeSet = new Set<string>(EXCLUDED_KEYS);

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (excludeSet.has(key)) continue;
    const value = localStorage.getItem(key);
    if (value !== null) data[key] = value;
  }

  const payload: ExportPayload = {
    app: APP_ID,
    version: CURRENT_VERSION,
    exportedAt: Date.now(),
    role,
    keyCount: Object.keys(data).length,
    data,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `WorkMitra_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------ */
/* Validate import file (before confirmation)       */
/* ------------------------------------------------ */
export function validateImportFile(file: File): Promise<ImportValidation> {
  return new Promise((resolve) => {
    if (!file.name.endsWith(".json")) {
      resolve({ valid: false, reason: "Please select a JSON file." });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const parsed: unknown = JSON.parse(text);
        if (typeof parsed !== "object" || parsed === null) {
          resolve({ valid: false, reason: "Invalid file format." });
          return;
        }

        const obj = parsed as Record<string, unknown>;

        if (obj["app"] !== APP_ID) {
          resolve({ valid: false, reason: "This is not a WorkMitra backup file." });
          return;
        }

        if (obj["version"] !== CURRENT_VERSION) {
          resolve({
            valid: false,
            reason: "This backup is from an older version and cannot be imported.",
          });
          return;
        }

        const currentRole = detectRole();
        if (typeof obj["role"] === "string" && obj["role"] !== currentRole) {
          resolve({
            valid: false,
            reason: `This backup is for ${obj["role"]} account. You are logged in as ${currentRole}.`,
          });
          return;
        }

        const exportedAt = typeof obj["exportedAt"] === "number" ? obj["exportedAt"] : 0;
        const keyCount = typeof obj["keyCount"] === "number" ? obj["keyCount"] : 0;

        resolve({ valid: true, exportedAt, role: currentRole, keyCount });
      } catch {
        resolve({ valid: false, reason: "Could not read backup file." });
      }
    };

    reader.onerror = () => {
      resolve({ valid: false, reason: "Could not read file." });
    };

    reader.readAsText(file);
  });
}

/* ------------------------------------------------ */
/* Import (after user confirms)                     */
/* ------------------------------------------------ */
export function importData(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const parsed = JSON.parse(text) as ExportPayload;

        if (parsed.app !== APP_ID || parsed.version !== CURRENT_VERSION) {
          resolve({ success: false, reason: "Invalid or incompatible backup." });
          return;
        }

        const data = parsed.data;
        if (typeof data !== "object" || data === null) {
          resolve({ success: false, reason: "Backup contains no data." });
          return;
        }

        /* Clear current data — atomic replace */
        localStorage.clear();

        /* Restore all keys */
        let count = 0;
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === "string") {
            localStorage.setItem(key, value);
            count++;
          }
        }

        resolve({ success: true, keysRestored: count });
      } catch {
        resolve({ success: false, reason: "Import failed. Backup file may be corrupted." });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, reason: "Could not read file." });
    };

    reader.readAsText(file);
  });
}

/* ------------------------------------------------ */
/* Format date helper (for confirmation message)    */
/* ------------------------------------------------ */
export function formatExportDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}