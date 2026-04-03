// src/features/employee/workVault/pages/EmployeeVaultFolderPage.tsx

import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { VAULT_ACCENT, DEFAULT_FOLDER_SUGGESTIONS } from "../constants/vaultConstants";
import type { VaultDocument, VaultFileType } from "../types/vaultTypes";
import { validateDocumentLimit } from "../helpers/vaultValidation";
import {
  getFolderById,
  setFolderVisibility,
  renameFolder,
} from "../services/vaultFolderService";
import {
  getDocumentsByFolder,
  getDocumentCount,
  addDocument,
  deleteDocument,
} from "../services/vaultDocumentService";
import { VaultDocumentCard } from "../components/VaultDocumentCard";
import { VaultUploadModal } from "../components/VaultUploadModal";
import { VaultCreateFolderModal } from "../components/VaultCreateFolderModal";
import { ConfirmModal } from "../../../../shared/components/ConfirmModal";
import { FullscreenDocViewer } from "../../../../shared/components/FullscreenDocViewer";
import { NoticeModal, type NoticeData } from "../../../../shared/components/NoticeModal";

/* ------------------------------------------------ */
/* System folder names (cannot rename)              */
/* ------------------------------------------------ */
const SYSTEM_FOLDER_NAMES = new Set(
  DEFAULT_FOLDER_SUGGESTIONS.map((s) => s.name),
);

/* ------------------------------------------------ */
/* Icons                                            */
/* ------------------------------------------------ */
function IconEmptyFolder() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" aria-hidden="true">
      <path fill={VAULT_ACCENT} opacity="0.25" d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2Z" />
      <path fill={VAULT_ACCENT} d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2Zm10 14H4V8h16v10Z" />
    </svg>
  );
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EmployeeVaultFolderPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const nav = useNavigate();

  const [folder, setFolder] = useState(() => getFolderById(folderId ?? ""));
  const [docs, setDocs] = useState<VaultDocument[]>(() =>
    getDocumentsByFolder(folderId ?? ""),
  );

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);
  const [notice, setNotice] = useState<NoticeData | null>(null);

  const isSystemFolder = useMemo(
    () => folder ? SYSTEM_FOLDER_NAMES.has(folder.name) : false,
    [folder],
  );

  const refreshDocs = useCallback(() => {
    setDocs(getDocumentsByFolder(folderId ?? ""));
  }, [folderId]);

  const refreshFolder = useCallback(() => {
    setFolder(getFolderById(folderId ?? ""));
  }, [folderId]);

  const deletingDoc = useMemo(
    () => docs.find((d) => d.id === deletingDocId),
    [docs, deletingDocId],
  );

  if (!folder) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "var(--wm-emp-muted)" }}>
        Folder not found.
        <div style={{ marginTop: 12 }}>
          <button className="wm-outlineBtn" type="button" onClick={() => nav("/employee/vault")}>
            Back to Vault
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Handlers ---------- */
  function handleUpload(data: {
    name: string;
    fileType: VaultFileType;
    base64Data: string;
    thumbnailBase64: string;
    expiryDate: string | null;
  }) {
    if (!folderId) return;

    const limitCheck = validateDocumentLimit(getDocumentCount(folderId));
    if (!limitCheck.valid) {
      setNotice({ title: "Limit Reached", message: limitCheck.reason, tone: "warn" });
      setShowUploadModal(false);
      return;
    }

    addDocument(folderId, data.name, data.fileType, data.base64Data, data.thumbnailBase64, data.expiryDate);
    refreshDocs();
    setShowUploadModal(false);
    setNotice({ title: "Uploaded", message: `"${data.name}" added to this folder.`, tone: "success" });
  }

  function handleRename(newName: string) {
    if (!folderId) return;
    renameFolder(folderId, newName);
    refreshFolder();
    setShowRenameModal(false);
    setNotice({ title: "Renamed", message: `Folder renamed to "${newName}".`, tone: "success" });
  }

  function handleToggleVisibility() {
    if (!folder || !folderId) return;
    const next = folder.visibility === "visible" ? "hidden" : "visible";
    setFolderVisibility(folderId, next);
    refreshFolder();
  }

  function handleDeleteDoc() {
    if (!deletingDocId) return;
    deleteDocument(deletingDocId);
    refreshDocs();
    setDeletingDocId(null);
    setNotice({ title: "Deleted", message: "Document has been removed.", tone: "success" });
  }

  function handleViewDoc(docId: string) {
    const doc = docs.find((d) => d.id === docId);
    if (doc) setPreviewDoc(doc);
  }

  /* ---------- Render ---------- */
  return (
    <div>
      {/* Header */}
      <div className="wm-pageHead">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
           <button
            type="button"
            onClick={() => nav("/employee/vault", { state: { tab: "documents" } })}
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
              <path fill="currentColor" d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2Z" />
            </svg>
          </button>
          <div>
            <div className="wm-pageTitle">{folder.name}</div>
            <div className="wm-pageSub">
              {docs.length} {docs.length === 1 ? "document" : "documents"} ·{" "}
              <span style={{ color: folder.visibility === "visible" ? "#15803d" : "#dc2626", fontWeight: 700 }}>
                {folder.visibility === "visible" ? "Visible" : "Hidden"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Folder Actions */}
      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
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
          + Add Document
        </button>
        {!isSystemFolder && (
          <button
            className="wm-outlineBtn"
            type="button"
            onClick={() => setShowRenameModal(true)}
            style={{ fontSize: 12 }}
          >
            Rename
          </button>
        )}
        <button
          className="wm-outlineBtn"
          type="button"
          onClick={handleToggleVisibility}
          style={{ fontSize: 12 }}
        >
          {folder.visibility === "visible" ? "Hide Folder" : "Show Folder"}
        </button>
      </div>

      {/* Documents List */}
      <div style={{ marginTop: 16 }}>
        {docs.length === 0 ? (
          <div
            style={{
              padding: "48px 16px",
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: `${VAULT_ACCENT}08`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <IconEmptyFolder />
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--wm-emp-text)" }}>
              No documents yet
            </div>
            <div style={{ marginTop: 6, fontSize: 13, color: "var(--wm-emp-muted)", lineHeight: 1.5 }}>
              Upload your documents here to keep them safe and share with employers when needed.
            </div>
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              style={{
                marginTop: 16, height: 40, padding: "0 24px",
                borderRadius: 10, border: "none",
                background: VAULT_ACCENT, color: "#fff",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}
            >
              + Add Document
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {docs
              .sort((a, b) => b.uploadedAt - a.uploadedAt)
              .map((doc) => (
                <VaultDocumentCard
                  key={doc.id}
                  doc={doc}
                  onView={handleViewDoc}
                  onDelete={setDeletingDocId}
                />
              ))}
          </div>
        )}
      </div>

      <div style={{ height: 80 }} />

      {/* Upload Modal */}
      <VaultUploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
      />

      {/* Rename Modal */}
      <VaultCreateFolderModal
        open={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        onConfirm={(name) => handleRename(name)}
        editMode={{ currentName: folder.name }}
      />

      {/* Delete Doc Confirm */}
      <ConfirmModal
        confirm={
          deletingDocId
            ? {
                title: "Delete Document?",
                message: `"${deletingDoc?.name ?? ""}" will be permanently deleted.`,
                confirmLabel: "Delete",
                tone: "danger",
              }
            : null
        }
        onConfirm={handleDeleteDoc}
        onCancel={() => setDeletingDocId(null)}
      />

      {/* Preview Overlay */}
      {previewDoc && (
        <FullscreenDocViewer
          name={previewDoc.name}
          fileType={previewDoc.fileType}
          base64Data={previewDoc.base64Data}
          subtitle={previewDoc.fileType.toUpperCase()}
          onClose={() => setPreviewDoc(null)}
        />
      )}

      {/* Notice */}
      <NoticeModal notice={notice} onClose={() => setNotice(null)} />
    </div>
  );
}