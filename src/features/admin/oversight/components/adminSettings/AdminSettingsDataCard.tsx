// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminSettingsDataCard.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\oversight\components\adminSettings\AdminSettingsDataCard.tsx

type Props = {
  storageKeys: number;
  storageBytes: number;
  importResult: string | null;
  formatBytes: (bytes: number) => string;
  onExportAllData: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function AdminSettingsDataCard({
  storageKeys,
  storageBytes,
  importResult,
  formatBytes,
  onExportAllData,
  onImport,
}: Props) {
  return (
    <div className="wm-ad-domainCard" style={{ paddingLeft: 20 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: "var(--wm-ad-navy)", marginBottom: 4 }}>
        Storage Overview
      </div>

      <div style={{ fontSize: 12, color: "var(--wm-ad-navy-400)", lineHeight: 1.6 }}>
        {storageKeys} keys stored · {formatBytes(storageBytes)} used
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
        <button
          type="button"
          className="wm-ad-actionBtn"
          data-variant="green"
          onClick={onExportAllData}
        >
          Export All Data
        </button>

        <label style={{ display: "inline-block" }}>
          <input type="file" accept=".json" onChange={onImport} style={{ display: "none" }} />
          <span
            className="wm-ad-actionBtn"
            data-variant="default"
            style={{ display: "inline-block", cursor: "pointer" }}
          >
            Import Data
          </span>
        </label>
      </div>

      {importResult && (
        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            fontWeight: 700,
            color: importResult.includes("failed") ? "var(--wm-ad-danger)" : "var(--wm-ad-green)",
            padding: "8px 12px",
            borderRadius: 8,
            background: importResult.includes("failed")
              ? "var(--wm-ad-danger-dim)"
              : "var(--wm-ad-green-dim)",
          }}
        >
          {importResult}
        </div>
      )}
    </div>
  );
}
