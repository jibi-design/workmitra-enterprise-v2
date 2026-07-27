// Phase 14: employer vault view — verify via server when AUTH_BACKEND_ENABLED.
// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerVaultViewPage.tsx

import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  clearStoredEmployerSessionId,
  createSession,
  createSessionFromApiResult,
  endEmployerLocalSession,
  expireOldSessions,
  getActiveSession,
  getAllDocuments,
  getVaultSectionData,
  getVisibleFolders,
  isSessionValid,
  isVaultApiSyncEnabled,
  verifyOtp,
  verifyOtpViaApi,
  type VaultDocument,
  type VaultFolder,
  type VaultSectionData,
  type VaultSession,
} from "../../../shared/workVault/vaultPublic";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";
import { EmployerVaultProfileView } from "../components/EmployerVaultProfileView";
import { EmployerVaultOtpSection } from "../components/vaultView/EmployerVaultOtpSection";
import { EmployerVaultSecurityNote } from "../components/vaultView/EmployerVaultSecurityNote";
import { EmployerVaultSessionControls } from "../components/vaultView/EmployerVaultSessionControls";
import { EmployerVaultViewHeader } from "../components/vaultView/EmployerVaultViewHeader";

export function EmployerVaultViewPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const nav = useNavigate();

  const [session, setSession] = useState<VaultSession | null>(() => {
    expireOldSessions();
    return getActiveSession();
  });

  const [otpError, setOtpError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [sectionData, setSectionData] = useState<VaultSectionData | null>(() => {
    if (session && isSessionValid(session.id)) {
      return getVaultSectionData();
    }

    return null;
  });

  const [folders, setFolders] = useState<VaultFolder[]>(() => {
    if (session && isSessionValid(session.id)) {
      return getVisibleFolders();
    }

    return [];
  });

  const [documents, setDocuments] = useState<VaultDocument[]>(() => {
    if (session && isSessionValid(session.id)) {
      const visibleFolders = getVisibleFolders();
      const visibleIds = visibleFolders.map((folder) => folder.id);

      return getAllDocuments().filter((document) => visibleIds.includes(document.folderId));
    }

    return [];
  });

  const loadVaultData = useCallback((visibleFolderIds?: string[]) => {
    setSectionData(getVaultSectionData());

    const visibleFolders = getVisibleFolders();
    const scoped =
      visibleFolderIds && visibleFolderIds.length > 0
        ? visibleFolders.filter((f) => visibleFolderIds.includes(f.id))
        : visibleFolders;
    const allDocs = getAllDocuments();
    const visibleIds = scoped.map((folder) => folder.id);

    setFolders(scoped);
    setDocuments(allDocs.filter((document) => visibleIds.includes(document.folderId)));
  }, []);

  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      if (!isSessionValid(session.id)) {
        setSession(null);
        setSectionData(null);
        setFolders([]);
        setDocuments([]);
        clearStoredEmployerSessionId();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [session]);

  async function handleOtpSubmit(code: string) {
    if (submitting) return;
    setSubmitting(true);
    setOtpError("");

    try {
      const employer = employerSettingsStorage.get();
      const employerName = employer.companyName || employer.fullName || "Unknown Employer";
      const employerMlId = employer.uniqueId ?? "unknown";

      if (isVaultApiSyncEnabled()) {
        const verified = await verifyOtpViaApi({
          code,
          employeeRouteId: employeeId ?? "",
          employerName,
          employerMlId,
        });

        if (!verified.ok) {
          setOtpError(
            verified.message ?? "Invalid or expired code. Please ask the employee for a new code.",
          );
          return;
        }

        const newSession = createSessionFromApiResult({
          sessionId: verified.sessionId,
          employerIdentifier: employerMlId,
          employerName,
          visibleFolderIds: verified.visibleFolderIds,
          expiresAt: verified.expiresAt,
        });

        if (!newSession.ok) {
          setOtpError("Could not start vault session. Free up browser storage and try again.");
          return;
        }

        setSession(newSession.session);
        loadVaultData(verified.visibleFolderIds);
        return;
      }

      const verified = await verifyOtp(code);

      if (!verified) {
        setOtpError("Invalid or expired code. Please ask the employee for a new code.");
        return;
      }

      const newSession = createSession(employerMlId, employerName);

      if (!newSession.ok) {
        setOtpError("Could not start vault session. Free up browser storage and try again.");
        return;
      }

      setSession(newSession.session);
      loadVaultData();
    } finally {
      setSubmitting(false);
    }
  }

  function handleEndSession() {
    if (session) {
      endEmployerLocalSession(session.id);
    }

    setSession(null);
    setSectionData(null);
    setFolders([]);
    setDocuments([]);
    nav("/employer/vault");
  }

  const isActive = session ? isSessionValid(session.id) : false;

  return (
    <div className="wm-stackGrid">
      <EmployerVaultViewHeader isActive={isActive} onBack={() => nav("/employer/vault")} />

      {!isActive && (
        <EmployerVaultOtpSection
          employeeName={employeeId ?? "Employee"}
          onSubmit={handleOtpSubmit}
          onCancel={() => nav("/employer/vault")}
          error={otpError}
        />
      )}

      {isActive && session && sectionData && (
        <>
          <EmployerVaultSessionControls session={session} onEndSession={handleEndSession} />

          <EmployerVaultSecurityNote />

          <div>
            <EmployerVaultProfileView
              data={sectionData}
              unlocked={true}
              folders={folders}
              documents={documents}
            />
          </div>
        </>
      )}

      <div style={{ height: 80 }} />
    </div>
  );
}
