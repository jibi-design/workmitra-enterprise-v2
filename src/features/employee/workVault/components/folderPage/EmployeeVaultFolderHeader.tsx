// App name: Job Mitra | EmployeeVaultFolderHeader.tsx — DomainHero (Wave 5)

import { DomainHero } from "../../../../../shared/components/layout/DomainHero";
import type { VaultFolder } from "../../types/vaultTypes";

type Props = {
  folder: VaultFolder;
  documentCount: number;
  onBackToDocuments: () => void;
};

export function EmployeeVaultFolderHeader({ folder, documentCount, onBackToDocuments }: Props) {
  return (
    <DomainHero
      variant="settings"
      audience="employee"
      icon={
        <button
          type="button"
          className="wm-domainHeroIconBtn"
          onClick={onBackToDocuments}
          aria-label="Back to vault documents"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2Z"
            />
          </svg>
        </button>
      }
      title={folder.name}
      subtitle={`${documentCount} ${documentCount === 1 ? "document" : "documents"} · ${
        folder.visibility === "visible" ? "Visible" : "Hidden"
      }`}
      description="Folder documents and visibility controls for your Work Vault."
      trailing={
        <span className="wm-domainHeroBadge">
          {folder.visibility === "visible" ? "Visible" : "Hidden"}
        </span>
      }
    />
  );
}
