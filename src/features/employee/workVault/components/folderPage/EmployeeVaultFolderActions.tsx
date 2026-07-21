// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeVaultFolderActions.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\folderPage\EmployeeVaultFolderActions.tsx

import type { VaultFolder } from "../../types/vaultTypes";

type Props = {
  folder: VaultFolder;
  isSystemFolder: boolean;
  onAddDocument: () => void;
  onRename: () => void;
  onToggleVisibility: () => void;
};

export function EmployeeVaultFolderActions({
  folder,
  isSystemFolder,
  onAddDocument,
  onRename,
  onToggleVisibility,
}: Props) {
  return (
    <div className="wm-vault-sticky-actions">
      <button type="button" className="wm-vault-cta wm-vault-cta--primary" onClick={onAddDocument}>
        Add Document
      </button>

      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {!isSystemFolder && (
          <button
            className="wm-outlineBtn wm-vault-tap"
            type="button"
            onClick={onRename}
            style={{ fontSize: 12 }}
          >
            Rename
          </button>
        )}

        <button
          className="wm-outlineBtn wm-vault-tap"
          type="button"
          onClick={onToggleVisibility}
          style={{ fontSize: 12 }}
        >
          {folder.visibility === "visible" ? "Hide Folder" : "Show Folder"}
        </button>
      </div>
    </div>
  );
}
