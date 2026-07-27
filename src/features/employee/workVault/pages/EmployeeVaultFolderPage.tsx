// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeVaultFolderPage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\pages\EmployeeVaultFolderPage.tsx

import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ConfirmModal } from "../../../../shared/components/ConfirmModal";
import { FullscreenDocViewer } from "../../../../shared/components/FullscreenDocViewer";
import { NoticeModal, type NoticeData } from "../../../../shared/components/NoticeModal";
import { isSystemFolderName } from "../constants/vaultConstants";
import {
  validateDocumentLimit,
  validateVaultStorageQuota,
  estimateDataUrlBytes,
} from "../helpers/vaultValidation";
import { EmployeeVaultFolderActions } from "../components/folderPage/EmployeeVaultFolderActions";
import { EmployeeVaultFolderDocuments } from "../components/folderPage/EmployeeVaultFolderDocuments";
import { EmployeeVaultFolderHeader } from "../components/folderPage/EmployeeVaultFolderHeader";
import { EmployeeVaultFolderNotFound } from "../components/folderPage/EmployeeVaultFolderNotFound";
import { VaultCreateFolderModal } from "../components/VaultCreateFolderModal";
import { VaultUploadModal } from "../components/VaultUploadModal";
import {
  addDocument,
  deleteDocument,
  getDocumentCount,
  getDocumentsByFolder,
  getVaultStorageUsedBytes,
} from "../services/vaultDocumentService";
import { getFolderById, renameFolder, setFolderVisibility } from "../services/vaultFolderService";
import type { VaultDocument, VaultFileType } from "../types/vaultTypes";

export function EmployeeVaultFolderPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const nav = useNavigate();

  const [folder, setFolder] = useState(() => getFolderById(folderId ?? ""));
  const [docs, setDocs] = useState<VaultDocument[]>(() => getDocumentsByFolder(folderId ?? ""));

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);
  const [notice, setNotice] = useState<NoticeData | null>(null);

  const isSystemFolder = useMemo(
    () => (folder ? isSystemFolderName(folder.name) : false),
    [folder],
  );

  const refreshDocs = useCallback(() => {
    setDocs(getDocumentsByFolder(folderId ?? ""));
  }, [folderId]);

  const refreshFolder = useCallback(() => {
    setFolder(getFolderById(folderId ?? ""));
  }, [folderId]);

  const deletingDoc = useMemo(
    () => docs.find((doc) => doc.id === deletingDocId),
    [docs, deletingDocId],
  );

  if (!folder) {
    return <EmployeeVaultFolderNotFound onBackToVault={() => nav("/employee/vault")} />;
  }

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

    const incomingBytes =
      estimateDataUrlBytes(data.base64Data) + estimateDataUrlBytes(data.thumbnailBase64);
    const quotaCheck = validateVaultStorageQuota(incomingBytes, getVaultStorageUsedBytes());

    if (!quotaCheck.valid) {
      setNotice({ title: "Storage Full", message: quotaCheck.reason, tone: "warn" });
      setShowUploadModal(false);
      return;
    }

    try {
      addDocument(
        folderId,
        data.name,
        data.fileType,
        data.base64Data,
        data.thumbnailBase64,
        data.expiryDate,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save this document.";
      setNotice({ title: "Upload Failed", message, tone: "warn" });
      setShowUploadModal(false);
      return;
    }

    refreshDocs();
    setShowUploadModal(false);
    setNotice({
      title: "Uploaded",
      message: `"${data.name}" added to this folder.`,
      tone: "success",
    });
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
    const doc = docs.find((item) => item.id === docId);

    if (doc) {
      setPreviewDoc(doc);
    }
  }

  return (
    <div className="wm-stackGrid">
      <EmployeeVaultFolderHeader
        folder={folder}
        documentCount={docs.length}
        onBackToDocuments={() => nav("/employee/vault", { state: { tab: "documents" } })}
      />

      <EmployeeVaultFolderActions
        folder={folder}
        isSystemFolder={isSystemFolder}
        onAddDocument={() => setShowUploadModal(true)}
        onRename={() => setShowRenameModal(true)}
        onToggleVisibility={handleToggleVisibility}
      />

      <EmployeeVaultFolderDocuments
        docs={docs}
        onAddDocument={() => setShowUploadModal(true)}
        onViewDocument={handleViewDoc}
        onDeleteDocument={setDeletingDocId}
      />

      <div style={{ height: 80 }} />

      <VaultUploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
      />

      <VaultCreateFolderModal
        open={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        onConfirm={(name) => handleRename(name)}
        editMode={{ currentName: folder.name }}
      />

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

      {previewDoc && (
        <FullscreenDocViewer
          name={previewDoc.name}
          fileType={previewDoc.fileType}
          base64Data={previewDoc.base64Data}
          subtitle={previewDoc.fileType.toUpperCase()}
          onClose={() => setPreviewDoc(null)}
        />
      )}

      <NoticeModal notice={notice} onClose={() => setNotice(null)} />
    </div>
  );
}
