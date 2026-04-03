// src/features/employer/workVault/components/EmployerVaultFolderView.tsx

import { useState } from "react";
import type { VaultFolder, VaultDocument } from "../../../employee/workVault/types/vaultTypes";
import { VAULT_ACCENT } from "../../../employee/workVault/constants/vaultConstants";
import { FullscreenDocViewer } from "../../../../shared/components/FullscreenDocViewer";

/* ------------------------------------------------ */
/* Document Row (read-only)                         */
/* ------------------------------------------------ */
function ReadOnlyDocRow({
  doc,
  onView,
}: {
  doc: VaultDocument;
  onView: (doc: VaultDocument) => void;
}) {
  const uploadDate = new Date(doc.uploadedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView(doc)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView(doc);
        }
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid var(--wm-er-divider, rgba(15, 23, 42, 0.08))",
        background: "#fff",
        cursor: "pointer",
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          overflow: "hidden",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: doc.fileType === "pdf" ? "rgba(220, 38, 38, 0.08)" : `${VAULT_ACCENT}10`,
        }}
      >
        {doc.thumbnailBase64 && doc.fileType === "image" ? (
          <img src={doc.thumbnailBase64} alt={doc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill={doc.fileType === "pdf" ? "#dc2626" : VAULT_ACCENT}
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 2 4 4h-4V4ZM6 20V4h6v6h6v10H6Z"
            />
          </svg>
        )}
      </div>

      {/* Info */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--wm-er-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {doc.name}
        </div>
        <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
          {uploadDate} · {doc.fileType.toUpperCase()}
        </div>
      </div>

      {/* Tap to view hint */}
      <span
        style={{
          fontSize: 10,
          fontWeight: 800,
          color: VAULT_ACCENT,
          flexShrink: 0,
        }}
      >
        Tap to view
      </span>
    </div>
  );
}

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type EmployerVaultFolderViewProps = {
  folders: VaultFolder[];
  documents: VaultDocument[];
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EmployerVaultFolderView({ folders, documents }: EmployerVaultFolderViewProps) {
  const [viewingDoc, setViewingDoc] = useState<VaultDocument | null>(null);

  if (folders.length === 0) {
    return (
      <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--wm-er-muted)", fontSize: 13 }}>
        No visible folders. The employee has not shared any documents.
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "grid", gap: 16 }}>
        {folders.map((folder) => {
          const folderDocs = documents.filter((d) => d.folderId === folder.id);

          return (
            <div key={folder.id}>
              {/* Folder Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `${VAULT_ACCENT}10`,
                    color: VAULT_ACCENT,
                    flexShrink: 0,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2Z" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: "var(--wm-er-text)" }}>
                    {folder.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
                    {folderDocs.length} {folderDocs.length === 1 ? "document" : "documents"}
                  </div>
                </div>
              </div>

              {/* Documents */}
              {folderDocs.length === 0 ? (
                <div style={{ padding: "12px 16px", fontSize: 12, color: "var(--wm-er-muted)", fontStyle: "italic" }}>
                  No documents in this folder.
                </div>
              ) : (
                <div style={{ display: "grid", gap: 6 }}>
                  {folderDocs.map((doc) => (
                    <ReadOnlyDocRow key={doc.id} doc={doc} onView={setViewingDoc} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fullscreen Viewer */}
      {viewingDoc && (
        <FullscreenDocViewer
          name={viewingDoc.name}
          fileType={viewingDoc.fileType}
          base64Data={viewingDoc.base64Data}
          subtitle={`${viewingDoc.fileType.toUpperCase()} · View only`}
          onClose={() => setViewingDoc(null)}
        />
      )}
    </>
  );
}