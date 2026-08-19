// WARNING DEC-012 / MIG-008: Client-side OTP path (plaintext)
// Server OTP path (Argon2 hashed) exists at server/modules/vault/
// This client path MUST BE REMOVED before production cutover
// See architecture-audits/Phase-DB-Migration-Readiness-Audit-001.md
// src/features/employee/workVault/pages/EmployeeVaultHomePage.tsx
//
// Work Vault home — 3 tabs: Profile, Documents, Verify Employer.

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import type { VaultFolder } from "../types/vaultTypes";
import { validateFolderLimit } from "../helpers/vaultValidation";
import {
  getAllFolders,
  initializeDefaultFolders,
  createFolder,
  deleteFolder,
  setFolderVisibility,
  setAllFoldersVisibility,
} from "../services/vaultFolderService";
import { getDocumentCount, deleteDocumentsByFolder } from "../services/vaultDocumentService";
import { getVaultSectionData } from "../services/vaultDataAggregator";
import {
  getActiveSession as getVaultActiveSession,
  isSessionValid,
  getSessionRemainingMs,
  revokeSession as revokeVaultSession,
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
import { useVaultWorkReviewsHydrate } from "../../../shared/workVault/useVaultWorkReviewsHydrate";
import { ratingStorage } from "../../../../shared/rating/ratingStorage";

/* ── Tab system ────────────────────────────────── */
type TabId = "profile" | "documents" | "verify";
const TAB_LABELS: Record<TabId, string> = {
  profile: "Profile",
  documents: "Documents",
  verify: "Verify Employer",
};
const TAB_ORDER: TabId[] = ["profile", "documents", "verify"];

/* ── Active session detector (both systems) ────── */
type ActiveInfo = { employerName: string; source: "vault" | "docAccess"; sessionId: string };
function detectActiveSession(): ActiveInfo | null {
  const vs = getVaultActiveSession();
  if (vs && isSessionValid(vs.id))
    return { employerName: vs.employerName, source: "vault", sessionId: vs.id };
  const ds = docAccessSessionStorage.getActiveSession();
  if (ds) return { employerName: ds.employerName, source: "docAccess", sessionId: ds.id };
  return null;
}

/* ── Inner component (remounts on navigation) ──── */
function EmployeeVaultHomeContent({ initialTab }: { initialTab: TabId }) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [sessionInfo, setSessionInfo] = useState<ActiveInfo | null>(() => detectActiveSession());
  useEffect(() => {
    const t = setInterval(() => setSessionInfo(detectActiveSession()), 2000);
    return () => clearInterval(t);
  }, []);

  const reviewHydrateTick = useVaultWorkReviewsHydrate("employee");
  const reviewCount = useSyncExternalStore(
    ratingStorage.subscribe,
    () => ratingStorage.getAllERRatings().length + ratingStorage.getAllWRRatings().length,
    () => 0,
  );

  /* Profile data */
  const vaultData = useMemo(
    () => getVaultSectionData(),
    [reviewHydrateTick, reviewCount],
  );

  /* Documents state */
  const [folders, setFolders] = useState<VaultFolder[]>(() => {
    const existing = getAllFolders();
    return existing.length > 0 ? existing : initializeDefaultFolders();
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeData | null>(null);
  const refreshFolders = useCallback(() => setFolders(getAllFolders()), []);
  const docCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const f of folders) m[f.id] = getDocumentCount(f.id);
    return m;
  }, [folders]);
  const totalDocs = useMemo(() => Object.values(docCounts).reduce((s, c) => s + c, 0), [docCounts]);

  /* Document handlers */
  function handleCreateFolder(name: string, icon: string) {
    const check = validateFolderLimit(folders.length);
    if (!check.valid) {
      setNotice({ title: "Limit Reached", message: check.reason, tone: "warn" });
      setShowCreateModal(false);
      return;
    }
    try {
      createFolder(name, icon);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save this folder.";
      setNotice({ title: "Save Failed", message, tone: "warn" });
      setShowCreateModal(false);
      return;
    }
    refreshFolders();
    setShowCreateModal(false);
    setNotice({
      title: "Folder Created",
      message: `"${name}" has been added to your vault.`,
      tone: "success",
    });
  }
  function handleDeleteFolder() {
    if (!deletingFolderId) return;
    const folder = folders.find((f) => f.id === deletingFolderId);
    deleteDocumentsByFolder(deletingFolderId);
    deleteFolder(deletingFolderId);
    refreshFolders();
    setDeletingFolderId(null);
    setNotice({
      title: "Folder Deleted",
      message: `"${folder?.name ?? "Folder"}" and its documents have been removed.`,
      tone: "success",
    });
  }
  function handleToggleVisibility(folderId: string) {
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return;
    setFolderVisibility(folderId, folder.visibility === "visible" ? "hidden" : "visible");
    refreshFolders();
  }
  function handleBulkVisibility(vis: "visible" | "hidden") {
    setAllFoldersVisibility(vis);
    refreshFolders();
    setNotice({
      title: vis === "visible" ? "All Visible" : "All Hidden",
      message:
        vis === "visible"
          ? "All folders are now visible to employers with OTP."
          : "All folders are now hidden from employers.",
      tone: "success",
    });
  }
  function handleRevokeSession() {
    if (!sessionInfo) return;
    if (sessionInfo.source === "vault") {
      void revokeVaultSession(sessionInfo.sessionId);
    } else {
      docAccessSessionStorage.revokeSession();
    }
    setSessionInfo(null);
    window.dispatchEvent(new Event("wm:doc-access-session-changed"));
    setNotice({
      title: "Access Revoked",
      message: "Employer access has been terminated.",
      tone: "success",
    });
  }

  const deletingFolder = folders.find((f) => f.id === deletingFolderId);

  const [shellReady, setShellReady] = useState(false);
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setShellReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div className="wm-vault-home wm-stackGrid" data-testid="employee-vault-home">
      {/* Header — L-V1 slate luxury hero */}
      <header className="wm-vault-page-hero">
        <div className="wm-vault-page-hero__eyebrow">Labor identity</div>
        <div className="wm-vault-page-hero__title">
          <IconShield /> Work Vault
        </div>
        <div className="wm-vault-page-hero__sub">Your verified work record & secured documents</div>
      </header>

      {/* Tab bar — pill shell */}
      <div className="wm-vault-tabs" role="tablist" aria-label="Work Vault sections">
        {TAB_ORDER.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`wm-typeHelper wm-vault-tap wm-vault-tab${
              activeTab === tab ? " wm-vault-tab--active" : ""
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {!shellReady ? (
        <div className="wm-vault-skeleton" aria-hidden="true" data-testid="vault-home-skeleton">
          <div className="wm-vault-skeleton__block wm-vault-skeleton__block--sm" />
          <div className="wm-vault-skeleton__block wm-vault-skeleton__block--lg" />
          <div className="wm-vault-skeleton__block" />
          <div className="wm-vault-skeleton__block" />
        </div>
      ) : (
        <>
          {/* Active session banner */}
          {sessionInfo && (
            <div style={{ marginTop: "var(--wm-stack-gap)" }}>
              <ActiveSessionBanner
                employerName={sessionInfo.employerName}
                onRevoke={handleRevokeSession}
                getRemainingMs={
                  sessionInfo.source === "vault"
                    ? () => getSessionRemainingMs(sessionInfo.sessionId)
                    : undefined
                }
              />
            </div>
          )}

          {/* Tab content */}
          {activeTab === "profile" && <VaultProfileTab data={vaultData} />}
          {activeTab === "documents" && (
            <VaultDocumentsTab
              folders={folders}
              docCounts={docCounts}
              totalDocs={totalDocs}
              onCreateFolder={() => setShowCreateModal(true)}
              onDeleteFolder={setDeletingFolderId}
              onToggleVisibility={handleToggleVisibility}
              onBulkVisibility={handleBulkVisibility}
            />
          )}
          {activeTab === "verify" && <VaultVerifyEmployerTab />}
        </>
      )}

      <div style={{ height: 88 }} />

      {/* Modals */}
      <VaultCreateFolderModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onConfirm={handleCreateFolder}
      />
      <ConfirmModal
        confirm={
          deletingFolderId
            ? {
                title: "Delete Folder?",
                message: `"${deletingFolder?.name ?? ""}" and all its documents will be permanently deleted.`,
                confirmLabel: "Delete",
                tone: "danger",
              }
            : null
        }
        onConfirm={handleDeleteFolder}
        onCancel={() => setDeletingFolderId(null)}
      />
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
