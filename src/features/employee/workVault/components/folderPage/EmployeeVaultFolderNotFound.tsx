// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeVaultFolderNotFound.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\folderPage\EmployeeVaultFolderNotFound.tsx

type Props = {
  onBackToVault: () => void;
};

export function EmployeeVaultFolderNotFound({ onBackToVault }: Props) {
  return (
    <div style={{ padding: 32, textAlign: "center", color: "var(--wm-emp-muted)" }}>
      Folder not found.
      <div style={{ marginTop: 12 }}>
        <button className="wm-outlineBtn" type="button" onClick={onBackToVault}>
          Back to Vault
        </button>
      </div>
    </div>
  );
}
