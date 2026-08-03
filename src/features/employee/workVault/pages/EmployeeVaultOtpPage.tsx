// src/features/employee/workVault/pages/EmployeeVaultOtpPage.tsx — facade
// B-P0-4: Generate Access Code wires docAccessOtpService for Career/Shift Doc Access.

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { VaultFolder, VaultOTP } from "../types/vaultTypes";
import { generateOtp, getCurrentOtp, isOtpActive, clearOtp } from "../services/vaultOtpService";
import {
  getAllFolders,
  setFolderVisibility,
  setAllFoldersVisibility,
} from "../services/vaultFolderService";
import { NoticeModal, type NoticeData } from "../../../../shared/components/NoticeModal";
import { TrustStrip } from "../../../../shared/components/enterprise/TrustStrip";
import { OtpFolderVisibility } from "../components/OtpFolderVisibility";
import { IconBack, IconShield } from "./EmployeeVaultOtpPage.icons";
import { VaultOtpSection } from "./EmployeeVaultOtpPage.parts";
import { docAccessOtpService } from "../../../../shared/docAccess/docAccessOtpService";
import { AUTH_BACKEND_ENABLED } from "../../../../shared/config/authConfig";
import { getCurrentVaultWorkerScopeId } from "../../../shared/workVault/vaultWorkerScope";

function toDisplayOtp(params: { code: string; generatedAt: number; expiresAt: number }): VaultOTP {
  return {
    code: params.code,
    generatedAt: params.generatedAt,
    expiresAt: params.expiresAt,
    used: false,
  };
}

function readInitialDisplayOtp(): VaultOTP | null {
  const docCurrent = docAccessOtpService.getCurrent();
  if (docCurrent && docAccessOtpService.isActive()) {
    return toDisplayOtp(docCurrent);
  }
  const vaultCurrent = getCurrentOtp();
  return vaultCurrent && isOtpActive() ? vaultCurrent : null;
}

export function EmployeeVaultOtpPage() {
  const nav = useNavigate();

  const [otp, setOtp] = useState<VaultOTP | null>(() => readInitialDisplayOtp());
  const [pendingEmployer, setPendingEmployer] = useState<string | null>(() => {
    const workerId = getCurrentVaultWorkerScopeId();
    return docAccessOtpService.getPendingRequestForWorker(workerId)?.employerName ?? null;
  });

  const [folders, setFolders] = useState<VaultFolder[]>(() => getAllFolders());
  const [notice, setNotice] = useState<NoticeData | null>(null);

  const refreshFolders = useCallback(() => {
    setFolders(getAllFolders());
  }, []);

  useEffect(() => {
    const refreshPending = () => {
      const workerId = getCurrentVaultWorkerScopeId();
      setPendingEmployer(
        docAccessOtpService.getPendingRequestForWorker(workerId)?.employerName ?? null,
      );
      const docCurrent = docAccessOtpService.getCurrent();
      if (docCurrent && docAccessOtpService.isActive() && docCurrent.code) {
        setOtp(toDisplayOtp(docCurrent));
      }
    };
    refreshPending();
    return docAccessOtpService.subscribe(refreshPending);
  }, []);

  const visibleCount = folders.filter((f) => f.visibility === "visible").length;
  const hiddenCount = folders.filter((f) => f.visibility === "hidden").length;

  async function handleGenerate() {
    if (visibleCount === 0) {
      setNotice({
        title: "No Visible Folders",
        message: "Make at least one folder visible before generating an OTP.",
        tone: "warn",
      });
      return;
    }

    const workerMlId = getCurrentVaultWorkerScopeId();
    const pending = docAccessOtpService.getPendingRequestForWorker(workerMlId);

    // B-P0-4 / B-P1-5: Prefer Doc Access OTP when an employer requested Career/Shift review.
    // AUTH on: generateForPendingWorker uses server Argon2 vault OTP (single code).
    if (pending) {
      try {
        const docOtp = await docAccessOtpService.generateForPendingWorker(workerMlId);
        setOtp(toDisplayOtp(docOtp));
        setPendingEmployer(null);

        // AUTH off only: also mint local HR vault OTP for EmployerVaultViewPage demo path.
        if (!AUTH_BACKEND_ENABLED) {
          const vaultResult = await generateOtp();
          if (!vaultResult.ok && !docOtp.code) {
            setNotice({
              title: "Partial Success",
              message:
                "Document access code was created. HR vault OTP could not be saved — Doc Access still works.",
              tone: "warn",
            });
          }
        }
        return;
      } catch (err) {
        setNotice({
          title: "Document Access Error",
          message:
            err instanceof Error
              ? err.message.replace(/^\[WorkMitra\]\s*/, "")
              : "Could not generate document access code.",
          tone: "error",
        });
        return;
      }
    }

    // No pending Doc Access request — HR vault OTP only.
    const result = await generateOtp();
    if (!result.ok) {
      const message =
        result.reason === "api_error"
          ? (result.message ?? "Could not generate access code. Try again.")
          : result.reason === "no_visible_folders"
            ? "Make at least one folder visible before generating an OTP."
            : "Could not save the access code. Free up browser storage and try again.";
      setNotice({
        title: result.reason === "api_error" ? "Server Error" : "Storage Error",
        message:
          message +
          " If a Career employer is waiting, ask them to open Profile & Documents review first so a request is sent.",
        tone: "error",
      });
      return;
    }
    setOtp(result.otp);
  }

  function handleCancelOtp() {
    clearOtp();
    docAccessOtpService.clear();
    setOtp(null);
    setNotice({
      title: "OTP Cancelled",
      message: "The access code has been invalidated.",
      tone: "success",
    });
  }

  function handleToggleFolder(folderId: string) {
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return;
    setFolderVisibility(folderId, folder.visibility === "visible" ? "hidden" : "visible");
    refreshFolders();
  }

  function handleBulkVisibility(visibility: "visible" | "hidden") {
    setAllFoldersVisibility(visibility);
    refreshFolders();
  }

  return (
    <div className="wm-vault-otp-page wm-vault-otp-page--glass wm-stackGrid">
      <div className="wm-vault-page-hero wm-vault-otp-page__hero">
        <button
          type="button"
          className="wm-vault-otp-back"
          onClick={() => nav("/employee/vault", { state: { tab: "documents" } })}
          aria-label="Back to vault documents"
        >
          <IconBack />
        </button>
        <div className="wm-vault-otp-page__hero-copy">
          <div className="wm-vault-page-hero__eyebrow">
            <IconShield /> Secure share
          </div>
          <div className="wm-vault-page-hero__title">Share Access</div>
          <div className="wm-vault-page-hero__sub">
            {pendingEmployer
              ? `${pendingEmployer} requested document access. Generate a one-time code to share.`
              : "Generate a one-time code for an employer to view your documents."}
          </div>
        </div>
      </div>

      {pendingEmployer && !otp ? (
        <TrustStrip
          kind="info"
          tone="pending"
          title="Pending employer request"
          message={`${pendingEmployer} is waiting. Tap Generate Access Code, then tell them the 6-digit code.`}
          badgeLabel="Action"
        />
      ) : null}

      <VaultOtpSection
        otp={otp}
        onGenerate={handleGenerate}
        onCancelOtp={handleCancelOtp}
        onOtpExpired={() => setOtp(null)}
      />

      <TrustStrip
        kind="info"
        tone="neutral"
        title="Visible folders only"
        message="The employer gets read-only access for 30 minutes. Hidden folders stay invisible."
        badgeLabel="Privacy"
      />

      <OtpFolderVisibility
        folders={folders}
        visibleCount={visibleCount}
        hiddenCount={hiddenCount}
        onToggleFolder={handleToggleFolder}
        onBulkVisibility={handleBulkVisibility}
      />

      <div className="wm-vault-otp-page__spacer" />
      <NoticeModal notice={notice} onClose={() => setNotice(null)} />
    </div>
  );
}
