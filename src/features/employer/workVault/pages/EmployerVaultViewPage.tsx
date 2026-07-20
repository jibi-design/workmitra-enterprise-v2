// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerVaultViewPage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workVault\pages\EmployerVaultViewPage.tsx

import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getVaultSectionData,
  type VaultSectionData,
} from "../../../employee/workVault/services/vaultDataAggregator";
import { getAllDocuments } from "../../../employee/workVault/services/vaultDocumentService";
import { getVisibleFolders } from "../../../employee/workVault/services/vaultFolderService";
import { verifyOtp } from "../../../employee/workVault/services/vaultOtpService";
import {
  createSession,
  expireOldSessions,
  getActiveSession,
  isSessionValid,
  revokeSession,
} from "../../../employee/workVault/services/vaultAccessService";
import type {
  VaultDocument,
  VaultFolder,
  VaultSession,
} from "../../../employee/workVault/types/vaultTypes";
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

  const loadVaultData = useCallback(() => {
    setSectionData(getVaultSectionData());

    const visibleFolders = getVisibleFolders();
    const allDocs = getAllDocuments();
    const visibleIds = visibleFolders.map((folder) => folder.id);

    setFolders(visibleFolders);
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
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [session]);

  function handleOtpSubmit(code: string) {
    const verified = verifyOtp(code);

    if (!verified) {
      setOtpError("Invalid or expired code. Please ask the employee for a new code.");
      return;
    }

    setOtpError("");

    const employer = employerSettingsStorage.get();
    const employerName = employer.companyName || employer.fullName || "Unknown Employer";
    const employerId = employer.uniqueId ?? "unknown";

    const newSession = createSession(employerId, employerName);

    if (!newSession.ok) {
      setOtpError("Could not start vault session. Free up browser storage and try again.");
      return;
    }

    setSession(newSession.session);
    loadVaultData();
  }

  function handleEndSession() {
    if (session) {
      revokeSession(session.id);
    }

    setSession(null);
    setSectionData(null);
    setFolders([]);
    setDocuments([]);
    nav("/employer/vault");
  }

  const isActive = session ? isSessionValid(session.id) : false;

  return (
    <div>
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

          <div style={{ marginTop: 16 }}>
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
