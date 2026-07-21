// src/features/employee/workVault/pages/EmployeeVaultOtpPage.tsx — facade

import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { VAULT_ACCENT } from "../constants/vaultConstants";
import type { VaultFolder, VaultOTP } from "../types/vaultTypes";
import { generateOtp, getCurrentOtp, isOtpActive, clearOtp } from "../services/vaultOtpService";
import {
  getAllFolders,
  setFolderVisibility,
  setAllFoldersVisibility,
} from "../services/vaultFolderService";
import { NoticeModal, type NoticeData } from "../../../../shared/components/NoticeModal";
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
    <div>
      <div className="wm-pageHead">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={() => nav("/employee/vault", { state: { tab: "documents" } })}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: "1px solid var(--wm-emp-border, rgba(15, 23, 42, 0.08))",
              background: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--wm-emp-text)",
              flexShrink: 0,
            }}
            aria-label="Back to vault documents"
          >
            <IconBack />
          </button>
          <div>
            <div className="wm-pageTitle" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: VAULT_ACCENT }}>
                <IconShield />
              </span>
              Share Access
            </div>
            <div className="wm-pageSub">
              Generate a one-time code for an employer to view your documents.
            </div>
          </div>
        </div>
      </div>

      <VaultOtpSection
        otp={otp}
        onGenerate={handleGenerate}
        onCancelOtp={handleCancelOtp}
        onOtpExpired={() => setOtp(null)}
      />

      <div
        style={{
          marginTop: 12,
          padding: "10px 14px",
          borderRadius: 10,
          background: "rgba(22, 163, 74, 0.06)",
          border: "1px solid rgba(22, 163, 74, 0.15)",
          fontSize: 12,
          color: "#15803d",
          fontWeight: 600,
          lineHeight: 1.5,
        }}
      >
        Only folders marked "Visible" will be shown. The employer gets read-only access for 30
        minutes.
      </div>

      <OtpFolderVisibility
        folders={folders}
        visibleCount={visibleCount}
        hiddenCount={hiddenCount}
        onToggleFolder={handleToggleFolder}
        onBulkVisibility={handleBulkVisibility}
      />

      <div style={{ height: 80 }} />
      <NoticeModal notice={notice} onClose={() => setNotice(null)} />
    </div>
  );
}
