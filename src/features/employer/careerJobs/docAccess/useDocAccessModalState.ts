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
import { getAllDocuments } from "../../../shared/workVault/vaultPublic";
import { getVisibleFolders } from "../../../shared/workVault/vaultPublic";
import { docAccessOtpService } from "../../../../shared/docAccess/docAccessOtpService";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";

type UseDocAccessModalStateArgs = {
  workerMlId: string;
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

function getInitialAccessState(workerMlId: string, domain: DocAccessDomain): AccessState {
  const activeSession = docAccessSessionStorage.getActiveSession();

  if (activeSession && activeSession.workerMlId === workerMlId && activeSession.domain === domain) {
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
  workerMlId,
  domain,
  onClose,
}: UseDocAccessModalStateArgs) {
  const [access, setAccess] = useState<AccessState>(() =>
    getInitialAccessState(workerMlId, domain),
  );

  useEffect(() => {
    if (access.step !== "viewing") return;

    const timer = window.setInterval(() => {
      const activeSession = docAccessSessionStorage.getActiveSession();

      if (
        !activeSession ||
        activeSession.workerMlId !== workerMlId ||
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
  }, [access.step, workerMlId, domain]);

  async function handleOtpSubmit(code: string) {
    const isValid = await docAccessOtpService.verify(code);

    if (!isValid) {
      setAccess((current) => ({
        ...current,
        otpError:
          "Invalid or expired code. Ask the employee to approve the document access request.",
      }));
      return;
    }

    const employer = employerSettingsStorage.get();

    docAccessSessionStorage.createSession({
      employerId: employer.uniqueId ?? "unknown",
      employerName: employer.companyName || employer.fullName || "Employer",
      workerMlId,
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
