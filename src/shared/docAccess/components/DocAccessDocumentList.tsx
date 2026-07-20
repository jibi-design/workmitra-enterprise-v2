// App: Job Mitra / WorkMitra_Enterprise_v2
// File: DocAccessDocumentList.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\shared\docAccess\components\DocAccessDocumentList.tsx

import { useMemo, useState } from "react";
import { FullscreenDocViewer } from "../../components/FullscreenDocViewer";
import { DOC_ACCESS_ACCENT } from "../docAccessConstants";
import type { DocAccessDocument, DocAccessFolder } from "../docAccessTypes";

type DocAccessDocumentListProps = {
  folders: DocAccessFolder[];
  documents: DocAccessDocument[];
};

export function DocAccessDocumentList({ folders, documents }: DocAccessDocumentListProps) {
  const [viewing, setViewing] = useState<DocAccessDocument | null>(null);

  const visibleFolders = useMemo(
    () =>
      folders
        .filter((folder) => folder.visibility === "visible")
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [folders],
  );

  const visibleFolderIds = useMemo(
    () => new Set(visibleFolders.map((folder) => folder.id)),
    [visibleFolders],
  );

  const visibleDocuments = useMemo(
    () => documents.filter((document) => visibleFolderIds.has(document.folderId)),
    [documents, visibleFolderIds],
  );

  if (visibleFolders.length === 0) {
    return (
      <div
        style={{
          padding: 18,
          borderRadius: 14,
          textAlign: "center",
          fontSize: 12.5,
          fontWeight: 650,
          color: "var(--wm-er-muted)",
          background: "rgba(248,250,252,0.96)",
          border: "1px solid rgba(148,163,184,0.16)",
        }}
      >
        No visible folders are shared by the employee.
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "grid", gap: 10 }}>
        {visibleFolders.map((folder) => (
          <DocAccessFolderCard
            key={folder.id}
            folder={folder}
            documents={visibleDocuments.filter((document) => document.folderId === folder.id)}
            onView={setViewing}
          />
        ))}
      </div>

      {viewing && (
        <FullscreenDocViewer
          name={viewing.name}
          fileType={viewing.fileType}
          base64Data={viewing.base64Data}
          subtitle="View only - cannot be downloaded"
          onClose={() => setViewing(null)}
        />
      )}
    </>
  );
}

function DocAccessFolderCard({
  folder,
  documents,
  onView,
}: {
  folder: DocAccessFolder;
  documents: DocAccessDocument[];
  onView: (document: DocAccessDocument) => void;
}) {
  return (
    <section
      style={{
        borderRadius: 15,
        border: "1px solid rgba(148,163,184,0.16)",
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 13px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
          <FolderIcon />

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 850,
                color: "var(--wm-er-text)",
                lineHeight: 1.25,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {folder.name}
            </div>

            <div
              style={{ marginTop: 3, fontSize: 11.5, fontWeight: 600, color: "var(--wm-er-muted)" }}
            >
              {documents.length} document{documents.length === 1 ? "" : "s"} shared
            </div>
          </div>
        </div>

        <span
          style={{
            flexShrink: 0,
            padding: "4px 9px",
            borderRadius: 999,
            background: "rgba(22,163,74,0.08)",
            border: "1px solid rgba(22,163,74,0.18)",
            color: "#15803d",
            fontSize: 10.5,
            fontWeight: 800,
          }}
        >
          Visible
        </span>
      </div>

      {documents.length > 0 && (
        <div
          style={{
            display: "grid",
            gap: 7,
            padding: "0 13px 12px",
          }}
        >
          {documents.map((document) => (
            <DocAccessDocumentButton key={document.id} document={document} onView={onView} />
          ))}
        </div>
      )}
    </section>
  );
}

function DocAccessDocumentButton({
  document,
  onView,
}: {
  document: DocAccessDocument;
  onView: (document: DocAccessDocument) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onView(document)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 11px",
        borderRadius: 13,
        textAlign: "left",
        border: "1px solid rgba(148,163,184,0.16)",
        background: "rgba(248,250,252,0.9)",
        cursor: "pointer",
        width: "100%",
      }}
    >
      <DocumentIcon document={document} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12.3,
            fontWeight: 800,
            color: "var(--wm-er-text)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {document.name}
        </div>

        <div style={{ fontSize: 10.8, color: "var(--wm-er-muted)", marginTop: 2, fontWeight: 600 }}>
          {document.fileType.toUpperCase()} - Tap to view
        </div>
      </div>
    </button>
  );
}

function FolderIcon() {
  return (
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: 14,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `${DOC_ACCESS_ACCENT}10`,
        color: DOC_ACCESS_ACCENT,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M10 4 12 6h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6Z"
        />
      </svg>
    </div>
  );
}

function DocumentIcon({ document }: { document: DocAccessDocument }) {
  const isPdf = document.fileType === "pdf";

  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 11,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isPdf ? "rgba(220,38,38,0.08)" : `${DOC_ACCESS_ACCENT}10`,
      }}
    >
      {document.thumbnailBase64 && document.fileType === "image" ? (
        <img
          src={document.thumbnailBase64}
          alt={document.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 11 }}
        />
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill={isPdf ? "#dc2626" : DOC_ACCESS_ACCENT}
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 2 4 4h-4V4ZM6 20V4h6v6h6v10H6Z"
          />
        </svg>
      )}
    </div>
  );
}
