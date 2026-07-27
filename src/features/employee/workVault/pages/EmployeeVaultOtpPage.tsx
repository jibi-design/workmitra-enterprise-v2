// src/features/employee/workVault/pages/EmployeeVaultOtpPage.tsx — facade

import { useCallback, useState } from "react";
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

export function EmployeeVaultOtpPage() {
  const nav = useNavigate();

  const [otp, setOtp] = useState<VaultOTP | null>(() => {
    const current = getCurrentOtp();
    return current && isOtpActive() ? current : null;
  });

  const [folders, setFolders] = useState<VaultFolder[]>(() => getAllFolders());
  const [notice, setNotice] = useState<NoticeData | null>(null);

  const refreshFolders = useCallback(() => {
    setFolders(getAllFolders());
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
        message,
        tone: "error",
      });
      return;
    }
    setOtp(result.otp);
  }

  function handleCancelOtp() {
    clearOtp();
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
            Generate a one-time code for an employer to view your documents.
          </div>
        </div>
      </div>

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
