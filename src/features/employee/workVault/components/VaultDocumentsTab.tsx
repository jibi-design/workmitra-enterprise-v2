// WARNING DEC-012 / MIG-008: Client-side OTP path (plaintext)
// Server OTP path (Argon2 hashed) exists at server/modules/vault/
// This client path MUST BE REMOVED before production cutover
// See architecture-audits/Phase-DB-Migration-Readiness-Audit-001.md
// src/features/employee/workVault/components/VaultDocumentsTab.tsx

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { EnterpriseEmpty } from "../../../../shared/components/enterprise/EnterpriseEmpty";
import { EnterpriseResponsiveGrid } from "../../../../shared/components/enterprise/EnterpriseResponsiveGrid";
import { StatusBadge } from "../../../../shared/components/enterprise/StatusBadge";
import { TrustStrip } from "../../../../shared/components/enterprise/TrustStrip";
import { isSystemFolderName } from "../constants/vaultConstants";
import { getVaultStorageUsedBytes } from "../services/vaultDocumentService";
import type { VaultFolder } from "../types/vaultTypes";
import { IconPlus } from "./vaultHomeIcons";
import { VaultFolderCard } from "./VaultFolderCard";
import { VaultSensitiveUploadDisclaimer } from "./VaultSensitiveUploadDisclaimer";
import { VaultStorageMeter } from "./VaultStorageMeter";

type VaultDocumentsTabProps = {
  folders: VaultFolder[];
  docCounts: Record<string, number>;
  totalDocs: number;
  onCreateFolder: () => void;
  onDeleteFolder: (folderId: string) => void;
  onToggleVisibility: (folderId: string) => void;
  onBulkVisibility: (visibility: "visible" | "hidden") => void;
};

export function VaultDocumentsTab({
  folders,
  docCounts,
  totalDocs,
  onCreateFolder,
  onDeleteFolder,
  onToggleVisibility,
  onBulkVisibility,
}: VaultDocumentsTabProps) {
  const nav = useNavigate();
  const usedBytes = useMemo(() => getVaultStorageUsedBytes(), []);
  const sortedFolders = useMemo(
    () => [...folders].sort((a, b) => a.sortOrder - b.sortOrder),
    [folders],
  );

  return (
    <div className="wm-vault-documents-tab">
      <TrustStrip
        kind="info"
        tone="neutral"
        title="Your documents are private"
        message="Visible folders can be shared via OTP for 30 minutes. Hidden folders stay invisible even with OTP."
        badgeLabel="Privacy"
      />

      <VaultSensitiveUploadDisclaimer />

      <VaultStorageMeter usedBytes={usedBytes} />

      <div className="wm-vault-docs-toolbar">
        <div className="wm-vault-docs-toolbar__stats">
          <StatusBadge label={`${folders.length} folders`} tone="neutral" />
          <StatusBadge label={`${totalDocs} documents`} tone="neutral" />
        </div>
        <div className="wm-vault-docs-toolbar__actions">
          <button
            type="button"
            className="wm-vault-docs-chip-btn wm-vault-docs-chip-btn--show"
            onClick={() => onBulkVisibility("visible")}
          >
            Show All
          </button>
          <button
            type="button"
            className="wm-vault-docs-chip-btn wm-vault-docs-chip-btn--hide"
            onClick={() => onBulkVisibility("hidden")}
          >
            Hide All
          </button>
        </div>
      </div>

      <div className="wm-vault-docs-cta-row">
        <button
          type="button"
          className="wm-vault-docs-cta wm-vault-docs-cta--primary"
          onClick={onCreateFolder}
        >
          <IconPlus /> New Folder
        </button>
        <button
          type="button"
          className="wm-vault-docs-cta wm-vault-docs-cta--ghost"
          onClick={() => nav("/employee/vault/otp")}
        >
          Generate OTP
        </button>
      </div>

      <button
        type="button"
        onClick={() => nav("/employee/vault/access-log")}
        className="wm-vault-access-history-link"
      >
        <span>Access History</span>
        <span className="wm-vault-access-history-link__chevron" aria-hidden="true">
          {"\u203A"}
        </span>
      </button>

      <div className="wm-vault-docs-folder-block">
        <div className="wm-vault-docs-folder-block__label">Your folders</div>

        {sortedFolders.length === 0 ? (
          <EnterpriseEmpty
            title="No folders yet"
            subtitle='Tap "New Folder" to organize educational and professional career records.'
            primaryLabel="New Folder"
            onPrimary={onCreateFolder}
          />
        ) : (
          <EnterpriseResponsiveGrid minItemWidth={280} gap={10} testId="vault-folder-grid">
            {sortedFolders.map((folder) => {
              const isSystem = isSystemFolderName(folder.name);
              return (
                <div key={folder.id} className="wm-vault-folder-grid-item">
                  <VaultFolderCard
                    folder={folder}
                    documentCount={docCounts[folder.id] ?? 0}
                    onTap={(id) => nav(`/employee/vault/folder/${id}`)}
                    onToggleVisibility={onToggleVisibility}
                  />
                  {!isSystem && (
                    <button
                      type="button"
                      onClick={() => onDeleteFolder(folder.id)}
                      aria-label={`Delete ${folder.name}`}
                      className="wm-vault-folder-delete"
                    >
                      {"\u00D7"}
                    </button>
                  )}
                </div>
              );
            })}
          </EnterpriseResponsiveGrid>
        )}
      </div>
    </div>
  );
}
