// src/features/employee/workVault/pages/EmployeeVaultHomePage.tsx
//
// Work Vault home — 3 tabs: Profile, Documents, Verify Employer.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { VAULT_ACCENT } from "../constants/vaultConstants";
import type { VaultFolder } from "../types/vaultTypes";
import { validateFolderLimit } from "../helpers/vaultValidation";
import {
  getAllFolders, initializeDefaultFolders, createFolder,
  deleteFolder, setFolderVisibility, setAllFoldersVisibility,
} from "../services/vaultFolderService";
import { getDocumentCount, deleteDocumentsByFolder } from "../services/vaultDocumentService";
import { getVaultSectionData } from "../services/vaultDataAggregator";
import {
  getActiveSession as getVaultActiveSession, isSessionValid,
  getSessionRemainingMs, revokeSession as revokeVaultSession,
} from "../services/vaultAccessService";
import { docAccessSessionStorage } from "../../../../shared/docAccess/docAccessSessionStorage";
import { VaultCreateFolderModal } from "../components/VaultCreateFolderModal";
import { ConfirmModal } from "../../../../shared/components/ConfirmModal";
import { NoticeModal, type NoticeData } from "../../../../shared/components/NoticeModal";
import { IconShield } from "../components/vaultHomeIcons";
import { ActiveSessionBanner } from "../components/VaultActiveSessionBanner";
import { VaultProfileTab } from "../components/VaultProfileTab";
import { VaultDocumentsTab } from "../components/VaultDocumentsTab";
import { VaultVerifyEmployerTab } from "../components/VaultVerifyEmployerTab";

/* ── Tab system ────────────────────────────────── */
type TabId = "profile" | "documents" | "verify";
const TAB_LABELS: Record<TabId, string> = { profile: "Profile", documents: "Documents", verify: "Verify Employer" };
const TAB_ORDER: TabId[] = ["profile", "documents", "verify"];

/* ── Active session detector (both systems) ────── */
type ActiveInfo = { employerName: string; source: "vault" | "docAccess"; sessionId: string };
function detectActiveSession(): ActiveInfo | null {
  const vs = getVaultActiveSession();
  if (vs && isSessionValid(vs.id)) return { employerName: vs.employerName, source: "vault", sessionId: vs.id };
  const ds = docAccessSessionStorage.getActiveSession();
  if (ds) return { employerName: ds.employerName, source: "docAccess", sessionId: ds.id };
  return null;
}

/* ── Inner component (remounts on navigation) ──── */
function EmployeeVaultHomeContent({ initialTab }: { initialTab: TabId }) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [sessionInfo, setSessionInfo] = useState<ActiveInfo | null>(() => detectActiveSession());
  useEffect(() => { const t = setInterval(() => setSessionInfo(detectActiveSession()), 2000); return () => clearInterval(t); }, []);

  /* Profile data */
  const vaultData = useMemo(() => getVaultSectionData(), []);

  /* Documents state */
  const [folders, setFolders] = useState<VaultFolder[]>(() => {
    const existing = getAllFolders(); return existing.length > 0 ? existing : initializeDefaultFolders();
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeData | null>(null);
  const refreshFolders = useCallback(() => setFolders(getAllFolders()), []);
  const docCounts = useMemo(() => {
    const m: Record<string, number> = {}; for (const f of folders) m[f.id] = getDocumentCount(f.id); return m;
  }, [folders]);
  const totalDocs = useMemo(() => Object.values(docCounts).reduce((s, c) => s + c, 0), [docCounts]);

  /* Document handlers */
  function handleCreateFolder(name: string, icon: string) {
    const check = validateFolderLimit(folders.length);
    if (!check.valid) { setNotice({ title: "Limit Reached", message: check.reason, tone: "warn" }); setShowCreateModal(false); return; }
    createFolder(name, icon); refreshFolders(); setShowCreateModal(false);
    setNotice({ title: "Folder Created", message: `"${name}" has been added to your vault.`, tone: "success" });
  }
  function handleDeleteFolder() {
    if (!deletingFolderId) return;
    const folder = folders.find((f) => f.id === deletingFolderId);
    deleteDocumentsByFolder(deletingFolderId); deleteFolder(deletingFolderId); refreshFolders(); setDeletingFolderId(null);
    setNotice({ title: "Folder Deleted", message: `"${folder?.name ?? "Folder"}" and its documents have been removed.`, tone: "success" });
  }
  function handleToggleVisibility(folderId: string) {
    const folder = folders.find((f) => f.id === folderId); if (!folder) return;
    setFolderVisibility(folderId, folder.visibility === "visible" ? "hidden" : "visible"); refreshFolders();
  }
  function handleBulkVisibility(vis: "visible" | "hidden") {
    setAllFoldersVisibility(vis); refreshFolders();
    setNotice({ title: vis === "visible" ? "All Visible" : "All Hidden", message: vis === "visible" ? "All folders are now visible to employers with OTP." : "All folders are now hidden from employers.", tone: "success" });
  }
  function handleRevokeSession() {
    if (!sessionInfo) return;
    if (sessionInfo.source === "vault") revokeVaultSession(sessionInfo.sessionId);
    else docAccessSessionStorage.revokeSession();
    setSessionInfo(null); window.dispatchEvent(new Event("wm:doc-access-session-changed"));
    setNotice({ title: "Access Revoked", message: "Employer access has been terminated.", tone: "success" });
  }

  const deletingFolder = folders.find((f) => f.id === deletingFolderId);

  return (
    <div>
      {/* Header */}
      <div className="wm-pageHead">
        <div>
          <div className="wm-pageTitle" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IconShield /> My Work Vault
          </div>
          <div className="wm-pageSub">Your complete digital work identity</div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", marginTop: 12, borderBottom: "1px solid var(--wm-emp-border, rgba(15,23,42,0.08))" }}>
        {TAB_ORDER.map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: "10px 0", border: "none",
            borderBottom: activeTab === tab ? `2px solid ${VAULT_ACCENT}` : "2px solid transparent",
            background: "transparent", fontSize: 12, fontWeight: activeTab === tab ? 700 : 500,
            color: activeTab === tab ? VAULT_ACCENT : "var(--wm-emp-muted)",
            cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap",
          }}>
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Active session banner */}
      {sessionInfo && (
        <div style={{ marginTop: 12 }}>
          <ActiveSessionBanner employerName={sessionInfo.employerName} onRevoke={handleRevokeSession}
            getRemainingMs={sessionInfo.source === "vault" ? () => getSessionRemainingMs(sessionInfo.sessionId) : undefined} />
        </div>
      )}

      {/* Tab content */}
      {activeTab === "profile" && <VaultProfileTab data={vaultData} />}
      {activeTab === "documents" && (
        <VaultDocumentsTab folders={folders} docCounts={docCounts} totalDocs={totalDocs}
          onCreateFolder={() => setShowCreateModal(true)} onDeleteFolder={setDeletingFolderId}
          onToggleVisibility={handleToggleVisibility} onBulkVisibility={handleBulkVisibility} />
      )}
      {activeTab === "verify" && <VaultVerifyEmployerTab />}

      <div style={{ height: 80 }} />

      {/* Modals */}
      <VaultCreateFolderModal open={showCreateModal} onClose={() => setShowCreateModal(false)} onConfirm={handleCreateFolder} />
      <ConfirmModal confirm={deletingFolderId ? { title: "Delete Folder?", message: `"${deletingFolder?.name ?? ""}" and all its documents will be permanently deleted.`, confirmLabel: "Delete", tone: "danger" } : null}
        onConfirm={handleDeleteFolder} onCancel={() => setDeletingFolderId(null)} />
      <NoticeModal notice={notice} onClose={() => setNotice(null)} />
    </div>
  );
}

/* ── Wrapper (remounts on navigation) ──────────── */
export function EmployeeVaultHomePage() {
  const location = useLocation();
  const navState = location.state as { tab?: TabId } | null;
  return <EmployeeVaultHomeContent key={location.key} initialTab={navState?.tab ?? "profile"} />;
}