// App: Job Mitra / WorkMitra_Enterprise_v2
// File: useDocAccessModalState.ts
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\docAccess\useDocAccessModalState.ts

import { useEffect, useState } from "react";
import type {
  DocAccessDocument,
  DocAccessFolder,
} from "../../../../shared/docAccess/docAccessTypes";
import { docAccessSessionStorage } from "../../../../shared/docAccess/docAccessSessionStorage";
import type {
  DocAccessDomain,
  DocAccessStep,
} from "../../../../shared/docAccess/types/docAccessModal.types";
import { getAllDocuments } from "../../../employee/workVault/services/vaultDocumentService";
import { getVisibleFolders } from "../../../employee/workVault/services/vaultFolderService";
import { verifyOtp } from "../../../employee/workVault/services/vaultOtpService";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";

type UseDocAccessModalStateArgs = {
  workerWmId: string;
  domain: DocAccessDomain;
  onClose: () => void;
};

type AccessState = {
  step: DocAccessStep;
  otpError: string;
  folders: DocAccessFolder[];
  documents: DocAccessDocument[];
  sessionActive: boolean;
};

function getVisibleSharedDocuments() {
  const folders = getVisibleFolders();
  const allDocuments = getAllDocuments();
  const visibleFolderIds = new Set(folders.map((folder) => folder.id));

  return {
    folders,
    documents: allDocuments.filter((document) => visibleFolderIds.has(document.folderId)),
  };
}

function getInitialAccessState(workerWmId: string, domain: DocAccessDomain): AccessState {
  const activeSession = docAccessSessionStorage.getActiveSession();

  if (activeSession && activeSession.workerWmId === workerWmId && activeSession.domain === domain) {
    const visible = getVisibleSharedDocuments();

    return {
      step: "viewing",
      otpError: "",
      folders: visible.folders,
      documents: visible.documents,
      sessionActive: true,
    };
  }

  return {
    step: "otp",
    otpError: "",
    folders: [],
    documents: [],
    sessionActive: false,
  };
}

export function useDocAccessModalState({
  workerWmId,
  domain,
  onClose,
}: UseDocAccessModalStateArgs) {
  const [access, setAccess] = useState<AccessState>(() =>
    getInitialAccessState(workerWmId, domain),
  );

  useEffect(() => {
    if (access.step !== "viewing") return;

    const timer = window.setInterval(() => {
      const activeSession = docAccessSessionStorage.getActiveSession();

      if (
        !activeSession ||
        activeSession.workerWmId !== workerWmId ||
        activeSession.domain !== domain
      ) {
        setAccess({
          step: "otp",
          otpError: "",
          folders: [],
          documents: [],
          sessionActive: false,
        });
      }
    }, 2000);

    return () => window.clearInterval(timer);
  }, [access.step, workerWmId, domain]);

  function handleOtpSubmit(code: string) {
    const isValid = verifyOtp(code);

    if (!isValid) {
      setAccess((current) => ({
        ...current,
        otpError: "Invalid or expired code. Ask the employee to generate a new Work Vault code.",
      }));
      return;
    }

    const employer = employerSettingsStorage.get();

    docAccessSessionStorage.createSession({
      employerId: employer.uniqueId ?? "unknown",
      employerName: employer.companyName || employer.fullName || "Employer",
      workerWmId,
      domain,
    });

    const visible = getVisibleSharedDocuments();

    setAccess({
      step: "viewing",
      otpError: "",
      folders: visible.folders,
      documents: visible.documents,
      sessionActive: true,
    });
  }

  function handleEndSession() {
    docAccessSessionStorage.revokeSession();

    setAccess({
      step: "otp",
      otpError: "",
      folders: [],
      documents: [],
      sessionActive: false,
    });

    onClose();
  }

  return {
    step: access.step,
    otpError: access.otpError,
    folders: access.folders,
    documents: access.documents,
    sessionActive: access.sessionActive,
    handleOtpSubmit,
    handleEndSession,
  };
}
