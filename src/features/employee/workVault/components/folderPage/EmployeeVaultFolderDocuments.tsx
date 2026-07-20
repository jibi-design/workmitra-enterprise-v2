// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeVaultFolderDocuments.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\folderPage\EmployeeVaultFolderDocuments.tsx

import { VAULT_ACCENT } from "../../constants/vaultConstants";
import type { VaultDocument } from "../../types/vaultTypes";
import { VaultDocumentCard } from "../VaultDocumentCard";

type Props = {
  docs: VaultDocument[];
  onAddDocument: () => void;
  onViewDocument: (docId: string) => void;
  onDeleteDocument: (docId: string) => void;
};

function IconEmptyFolder() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill={VAULT_ACCENT}
        opacity="0.25"
        d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2Z"
      />
      <path
        fill={VAULT_ACCENT}
        d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2Zm10 14H4V8h16v10Z"
      />
    </svg>
  );
}

export function EmployeeVaultFolderDocuments({
  docs,
  onAddDocument,
  onViewDocument,
  onDeleteDocument,
}: Props) {
  return (
    <div style={{ marginTop: 16 }}>
      {docs.length === 0 ? (
        <div
          style={{
            padding: "48px 16px",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: `${VAULT_ACCENT}08`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconEmptyFolder />
            </div>
          </div>

          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--wm-emp-text)" }}>
            No documents yet
          </div>

          <div
            style={{ marginTop: 6, fontSize: 13, color: "var(--wm-emp-muted)", lineHeight: 1.5 }}
          >
            Upload your documents here to keep them safe and share with employers when needed.
          </div>

          <button
            type="button"
            onClick={onAddDocument}
            style={{
              marginTop: 16,
              height: 40,
              padding: "0 24px",
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
        </div>
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
