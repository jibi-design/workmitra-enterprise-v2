// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeVaultFolderActions.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\folderPage\EmployeeVaultFolderActions.tsx

import { VAULT_ACCENT } from "../../constants/vaultConstants";
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
    <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button
        type="button"
        onClick={onAddDocument}
        style={{
          height: 38,
          padding: "0 16px",
          borderRadius: 10,
          border: "none",
          background: VAULT_ACCENT,
          color: "#fff",
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        Add Document
      </button>

      {!isSystemFolder && (
        <button className="wm-outlineBtn" type="button" onClick={onRename} style={{ fontSize: 12 }}>
          Rename
        </button>
      )}

      <button
        className="wm-outlineBtn"
        type="button"
        onClick={onToggleVisibility}
        style={{ fontSize: 12 }}
      >
        {folder.visibility === "visible" ? "Hide Folder" : "Show Folder"}
      </button>
    </div>
  );
}
