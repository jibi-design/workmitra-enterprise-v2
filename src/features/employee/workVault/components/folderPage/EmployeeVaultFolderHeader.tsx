// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeVaultFolderHeader.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\folderPage\EmployeeVaultFolderHeader.tsx

import { VAULT_ACCENT } from "../../constants/vaultConstants";
import type { VaultFolder } from "../../types/vaultTypes";

type Props = {
  folder: VaultFolder;
  documentCount: number;
  onBackToDocuments: () => void;
};

export function EmployeeVaultFolderHeader({ folder, documentCount, onBackToDocuments }: Props) {
  return (
    <div className="wm-pageHead">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          type="button"
          onClick={onBackToDocuments}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${VAULT_ACCENT}12`,
            color: VAULT_ACCENT,
            flexShrink: 0,
            border: "none",
            cursor: "pointer",
          }}
          aria-label="Back to vault documents"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2Z"
            />
          </svg>
        </button>

        <div>
          <div className="wm-pageTitle">{folder.name}</div>

          <div className="wm-pageSub">
            {documentCount} {documentCount === 1 ? "document" : "documents"} ·{" "}
            <span
              style={{
                color: folder.visibility === "visible" ? "#15803d" : "#dc2626",
                fontWeight: 700,
              }}
            >
              {folder.visibility === "visible" ? "Visible" : "Hidden"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
