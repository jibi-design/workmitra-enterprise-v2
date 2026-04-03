// src/features/admin/oversight/pages/AdminSettingsPage.tsx
//
// Settings & Configuration — Export/Import, selective clear, about.
// Phase-0 localStorage. v5 light premium theme.

import { useState, useCallback } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import { pushAdminAuditEntry } from "../helpers/adminDataHelpers";

// ─────────────────────────────────────────────────────────────────────────────
// Domain Clear Keys
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function exportAllData(): void {
  try {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      try { data[k] = JSON.parse(localStorage.getItem(k) ?? "null"); }
      catch { data[k] = localStorage.getItem(k); }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workmitra-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    pushAdminAuditEntry("data_exported", "Data exported", `Full localStorage export. ${localStorage.length} keys.`);
  } catch { /* ignore */ }
}

function importData(file: File): Promise<{ success: boolean; keysImported: number; error?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const data = JSON.parse(text) as Record<string, unknown>;
        if (typeof data !== "object" || data === null || Array.isArray(data)) {
          resolve({ success: false, keysImported: 0, error: "Invalid JSON format. Expected an object." });
          return;
        }
        let count = 0;
        for (const [key, value] of Object.entries(data)) {
          try {
            localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
            count++;
          } catch { /* skip */ }
        }
        pushAdminAuditEntry("data_imported", "Data imported", `${count} keys imported from file.`);
        resolve({ success: true, keysImported: count });
      } catch {
        resolve({ success: false, keysImported: 0, error: "Failed to parse JSON file." });
      }
    };
    reader.onerror = () => resolve({ success: false, keysImported: 0, error: "Failed to read file." });
    reader.readAsText(file);
  });
}

function clearDomainKeys(keys: string[], domainName: string): number {
  let cleared = 0;
  for (const k of keys) {
    if (localStorage.getItem(k) !== null) {
      localStorage.removeItem(k);
      cleared++;
    }
  }
  if (cleared > 0) {
    pushAdminAuditEntry("selective_clear", `${domainName} data cleared`, `${cleared} storage keys removed.`);
  }
  return cleared;
}

function fmtBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(2)} MB`;
}

function getStorageInfo(): { keys: number; bytes: number } {
  let bytes = 0;
  const keys = localStorage.length;
  for (let i = 0; i < keys; i++) {
    const k = localStorage.key(i);
    if (k) {
      const v = localStorage.getItem(k);
      if (v) bytes += k.length + v.length;
    }
  }
  return { keys, bytes };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function AdminSettingsPage() {
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; body: string; action: () => void }>({ open: false, title: "", body: "", action: () => {} });
  const [importResult, setImportResult] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const storage = getStorageInfo();
  void refreshKey;

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await importData(file);
    if (result.success) {
      setImportResult(`Imported ${result.keysImported} keys successfully. Reload recommended.`);
    } else {
      setImportResult(`Import failed: ${result.error}`);
    }
    e.target.value = "";
    setRefreshKey((k) => k + 1);
  }, []);

  const openClear = useCallback((title: string, body: string, action: () => void) => {
    setConfirmModal({ open: true, title, body, action });
  }, []);

  const executeClear = () => {
    confirmModal.action();
    setConfirmModal((p) => ({ ...p, open: false }));
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="wm-ad-fadeIn">
      <CenterModal open={confirmModal.open} onBackdropClose={() => setConfirmModal((p) => ({ ...p, open: false }))} ariaLabel="Confirm Action">
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 1000, color: "var(--wm-ad-danger)" }}>{confirmModal.title}</div>
          <div style={{ fontSize: 13, color: "var(--wm-ad-navy-500)", marginTop: 8, lineHeight: 1.6 }}>{confirmModal.body}</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
            <button type="button" onClick={() => setConfirmModal((p) => ({ ...p, open: false }))} style={{ fontSize: 13, fontWeight: 800, padding: "8px 16px", borderRadius: 10, border: "1px solid var(--wm-ad-border)", background: "var(--wm-ad-white)", color: "var(--wm-ad-navy)", cursor: "pointer" }}>Cancel</button>
            <button type="button" onClick={executeClear} style={{ fontSize: 13, fontWeight: 900, padding: "8px 20px", borderRadius: 10, border: "none", background: "var(--wm-ad-danger)", color: "#fff", cursor: "pointer" }}>Confirm</button>
          </div>
        </div>
      </CenterModal>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.6, color: "var(--wm-ad-navy)" }}>Settings</div>
        <div style={{ fontSize: 13, color: "var(--wm-ad-navy-400)", marginTop: 4 }}>Configuration and data management</div>
      </div>

      {/* Data Management */}
      <Sec label="Data Management" />
      <div className="wm-ad-domainCard" style={{ paddingLeft: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "var(--wm-ad-navy)", marginBottom: 4 }}>Storage Overview</div>
        <div style={{ fontSize: 12, color: "var(--wm-ad-navy-400)", lineHeight: 1.6 }}>
          {storage.keys} keys stored · {fmtBytes(storage.bytes)} used
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
          <button type="button" className="wm-ad-actionBtn" data-variant="green" onClick={exportAllData}>Export All Data</button>
          <label style={{ display: "inline-block" }}>
            <input type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
            <span className="wm-ad-actionBtn" data-variant="default" style={{ display: "inline-block", cursor: "pointer" }}>Import Data</span>
          </label>
        </div>
        {importResult && (
          <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: importResult.includes("failed") ? "var(--wm-ad-danger)" : "var(--wm-ad-green)", padding: "8px 12px", borderRadius: 8, background: importResult.includes("failed") ? "var(--wm-ad-danger-dim)" : "var(--wm-ad-green-dim)" }}>
            {importResult}
          </div>
        )}
      </div>

      {/* Selective Clear */}
      <Sec label="Selective Clear" />
      <div className="wm-ad-domainCard" style={{ paddingLeft: 20 }}>
        <div style={{ fontSize: 13, color: "var(--wm-ad-navy-400)", marginBottom: 14, lineHeight: 1.6 }}>
          Clear data for a specific domain without affecting others. This cannot be undone.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <ClearRow
            label="Clear Shift Jobs Data"
            description="Posts, applications, workspaces, activity logs"
            color="var(--wm-ad-shift)"
            onClear={() => openClear("Clear Shift Jobs Data?", "This will remove all shift job posts, applications, workspaces, and activity logs. Cannot be undone.", () => { clearDomainKeys(SHIFT_KEYS, "Shift Jobs"); window.location.reload(); })}
          />
          <ClearRow
            label="Clear Career Jobs Data"
            description="Posts, applications, workspaces, activity logs"
            color="var(--wm-ad-career-light)"
            onClear={() => openClear("Clear Career Jobs Data?", "This will remove all career job posts, applications, workspaces, and activity logs. Cannot be undone.", () => { clearDomainKeys(CAREER_KEYS, "Career Jobs"); window.location.reload(); })}
          />
          <ClearRow
            label="Clear Workforce Data"
            description="No data stored yet (Phase-0)"
            color="var(--wm-ad-workforce)"
            disabled={WORKFORCE_KEYS.length === 0}
            onClear={() => {}}
          />
          <div style={{ borderTop: "1px solid var(--wm-ad-divider)", paddingTop: 12 }}>
            <ClearRow
              label="Reset All Data"
              description="Clear everything — all domains, profiles, settings"
              color="var(--wm-ad-danger)"
              onClear={() => openClear("Reset All Data?", "This will clear ALL localStorage data across all domains. Profiles, posts, applications — everything. Cannot be undone.", () => { localStorage.clear(); window.location.reload(); })}
            />
          </div>
        </div>
      </div>

      {/* About */}
      <Sec label="About" />
      <div className="wm-ad-domainCard" style={{ paddingLeft: 20 }}>
        <div style={{ display: "grid", gap: 10 }}>
          <AboutRow label="Application" value="WorkMitra Enterprise" />
          <AboutRow label="Version" value="0.1.0-demo" />
          <AboutRow label="Phase" value="Phase-0 (localStorage only)" />
          <AboutRow label="Build" value="React + TypeScript + Vite" />
          <AboutRow label="Backend" value="None (client-side demo)" />
          <AboutRow label="Data Storage" value="Browser localStorage" />
        </div>
        <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 10, background: "var(--wm-ad-card-inner)", border: "1px solid var(--wm-ad-border)" }}>
          <div style={{ fontSize: 12, color: "var(--wm-ad-navy-400)", lineHeight: 1.6 }}>
            This is a Phase-0 demonstration build. All data is stored locally in your browser.
            No real OTP verification, payments, or backend messaging is active.
            Play Store compliance verified — no restricted APIs in use.
          </div>
        </div>
      </div>

      <div style={{ height: 32 }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Components
// ─────────────────────────────────────────────────────────────────────────────

function Sec({ label }: { label: string }) {
  return <div className="wm-ad-secHead"><span className="wm-ad-secLabel">{label}</span><div className="wm-ad-secLine" /></div>;
}

function ClearRow({ label, description, color, disabled, onClear }: {
  label: string; description: string; color: string; disabled?: boolean; onClear: () => void;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, opacity: disabled ? 0.4 : 1 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-ad-navy)" }}>{label}</div>
        <div style={{ fontSize: 11, color: "var(--wm-ad-navy-400)", marginTop: 2 }}>{description}</div>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onClear}
        style={{
          fontSize: 11, fontWeight: 800, padding: "6px 14px", borderRadius: 8,
          background: `${color}12`, border: `1px solid ${color}22`, color,
          cursor: disabled ? "default" : "pointer", transition: "all 0.15s",
          flexShrink: 0,
        }}
      >
        Clear
      </button>
    </div>
  );
}

function AboutRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--wm-ad-divider)" }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--wm-ad-navy-500)" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-ad-navy)" }}>{value}</span>
    </div>
  );
}