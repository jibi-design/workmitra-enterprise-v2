// App: Job Mitra / WorkMitra_Enterprise_v2
// File: useDocAccessModalState.ts
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\docAccess\useDocAccessModalState.ts

import { useEffect, useState } from "react";
import type {
  DocAccessDocument,
  DocAccessFolder,
} from "../../../../shared/docAccess/docAccessTypes";
import { docAccessSessionStorage } from "../../../../shared/docAccess/docAccessSessionStorage";
import { docAccessService } from "../../../../shared/docAccess/docAccessService";
import type {
  DocAccessDomain,
  DocAccessStep,
} from "../../../../shared/docAccess/types/docAccessModal.types";
import {
  getAllDocuments,
  hydrateVaultDocumentsPlaintext,
} from "../../../shared/workVault/vaultPublic";
import { getVisibleFolders } from "../../../shared/workVault/vaultPublic";
import { docAccessOtpService } from "../../../../shared/docAccess/docAccessOtpService";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";
import { tryGetCareerEmployerScopeId } from "../../../shared/career/careerEmployerScope";
import { AUTH_BACKEND_ENABLED } from "../../../../shared/config/authConfig";
import { getCurrentActorId } from "../../../../app/identity/identity.adapter";

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

function resolveEmployerScopeId(): string | null {
  return tryGetCareerEmployerScopeId();
}

async function getVisibleSharedDocuments(workerMlId: string) {
  await hydrateVaultDocumentsPlaintext(workerMlId);
  const folders = getVisibleFolders(workerMlId);
  const allDocuments = getAllDocuments(workerMlId);
  const visibleFolderIds = new Set(folders.map((folder) => folder.id));
  const visibleDocs = allDocuments.filter((document) => visibleFolderIds.has(document.folderId));

  const employerScopeId = resolveEmployerScopeId() ?? undefined;
  const documents = await docAccessService.filterAuthorizedDocuments(
    workerMlId,
    visibleDocs,
    employerScopeId,
  );

  return {
    folders,
    documents,
  };
}

function getInitialAccessState(workerMlId: string, domain: DocAccessDomain): AccessState {
  const activeSession = docAccessSessionStorage.getActiveSession();
  const employerScopeId = resolveEmployerScopeId();

  if (
    employerScopeId &&
    activeSession &&
    activeSession.workerMlId === workerMlId &&
    activeSession.domain === domain &&
    activeSession.employerScopeId === employerScopeId
  ) {
    const folders = getVisibleFolders(workerMlId);
    const allDocuments = getAllDocuments(workerMlId);
    const visibleFolderIds = new Set(folders.map((folder) => folder.id));

    return {
      step: "viewing",
      otpError: "",
      folders,
      documents: allDocuments.filter((document) => visibleFolderIds.has(document.folderId)),
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
  const [requestError, setRequestError] = useState("");

  const employerScopeMissing =
    access.step === "otp" && Boolean(workerMlId.trim()) && !resolveEmployerScopeId();
  const scopeRequestError = employerScopeMissing
    ? "Complete your company profile before requesting document access."
    : "";

  useEffect(() => {
    if (access.step !== "otp") return;
    if (!workerMlId.trim()) return;

    const employerScopeId = resolveEmployerScopeId();
    if (!employerScopeId) return;

    try {
      const employer = employerSettingsStorage.get();
      docAccessOtpService.requestAccess({
        employerName: employer.companyName || employer.fullName || "Employer",
        employerId: employerScopeId,
        domain,
        workerMlId,
      });
      queueMicrotask(() => setRequestError(""));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not send document access request.";
      queueMicrotask(() => setRequestError(message));
    }
  }, [access.step, workerMlId, domain]);

  useEffect(() => {
    if (access.step !== "viewing") return;

    let cancelled = false;
    void getVisibleSharedDocuments(workerMlId).then((visible) => {
      if (cancelled) return;
      setAccess((current) =>
        current.step === "viewing"
          ? {
              ...current,
              folders: visible.folders,
              documents: visible.documents,
              sessionActive: true,
            }
          : current,
      );
    });

    const employerScopeId = resolveEmployerScopeId();
    const timer = window.setInterval(() => {
      const activeSession = docAccessSessionStorage.getActiveSession();

      if (
        !employerScopeId ||
        !activeSession ||
        activeSession.workerMlId !== workerMlId ||
        activeSession.domain !== domain ||
        activeSession.employerScopeId !== employerScopeId
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

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [access.step, workerMlId, domain]);

  async function handleOtpSubmit(code: string) {
    const employer = employerSettingsStorage.get();
    const employerScopeId = resolveEmployerScopeId();
    if (!employerScopeId) {
      setAccess((current) => ({
        ...current,
        otpError: "Complete your company profile before verifying document access.",
      }));
      return;
    }

    const isValid = await docAccessOtpService.verify(code, {
      workerMlId,
      employerScopeId,
    });

    if (!isValid) {
      setAccess((current) => ({
        ...current,
        otpError:
          "Invalid or expired code. Ask the employee to approve the document access request.",
      }));
      return;
    }

    const session = docAccessSessionStorage.createSession({
      employerId: employer.uniqueId ?? employerScopeId,
      employerScopeId,
      employerName: employer.companyName || employer.fullName || "Employer",
      workerMlId,
      domain,
      ...(AUTH_BACKEND_ENABLED ? { authUserId: getCurrentActorId("employer").authUserId } : {}),
    });

    if (!session) {
      setAccess((current) => ({
        ...current,
        otpError: "Session grant failed. Request a new OTP and try again.",
      }));
      return;
    }

    if (AUTH_BACKEND_ENABLED && !session.authUserId) {
      docAccessSessionStorage.revokeSession();
      setAccess((current) => ({
        ...current,
        otpError: "Authenticated employer identity required for document access.",
      }));
      return;
    }

    const visible = await getVisibleSharedDocuments(workerMlId);

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
    otpError: access.otpError || scopeRequestError || requestError,
    folders: access.folders,
    documents: access.documents,
    sessionActive: access.sessionActive,
    handleOtpSubmit,
    handleEndSession,
  };
}
