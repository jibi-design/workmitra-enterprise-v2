// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeVaultFolderDocuments.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\folderPage\EmployeeVaultFolderDocuments.tsx

import { VaultEmptyState } from "../../../../vault/components/VaultEmptyState";
import type { VaultDocument } from "../../types/vaultTypes";
import { VaultDocumentCard } from "../VaultDocumentCard";
import { VaultSensitiveUploadDisclaimer } from "../VaultSensitiveUploadDisclaimer";

type Props = {
  docs: VaultDocument[];
  onAddDocument: () => void;
  onViewDocument: (docId: string) => void;
  onDeleteDocument: (docId: string) => void;
};

export function EmployeeVaultFolderDocuments({
  docs,
  onAddDocument,
  onViewDocument,
  onDeleteDocument,
}: Props) {
  return (
    <div style={{ marginTop: 16 }}>
      <VaultSensitiveUploadDisclaimer />

      {docs.length === 0 ? (
        <VaultEmptyState
          title="No documents yet"
          subtitle="Upload educational and professional career records here. Share visible folders with employers only via OTP when needed."
          ctaLabel="Add Document"
          onCta={onAddDocument}
        />
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {[...docs]
            .sort((a, b) => b.uploadedAt - a.uploadedAt)
            .map((doc) => (
              <VaultDocumentCard
                key={doc.id}
                doc={doc}
                onView={onViewDocument}
                onDelete={onDeleteDocument}
              />
            ))}
        </div>
      )}
    </div>
  );
}
