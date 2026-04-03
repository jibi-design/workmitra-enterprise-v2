// src/features/employee/workVault/pages/EmployeeVaultOtpPage.tsx

import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { VAULT_ACCENT } from "../constants/vaultConstants";
import type { VaultOTP, VaultFolder } from "../types/vaultTypes";
import {
  generateOtp,
  getCurrentOtp,
  isOtpActive,
  clearOtp,
} from "../services/vaultOtpService";
import {
  getAllFolders,
  setFolderVisibility,
  setAllFoldersVisibility,
} from "../services/vaultFolderService";
import { VaultOtpDisplay } from "../components/VaultOtpDisplay";
import { NoticeModal, type NoticeData } from "../../../../shared/components/NoticeModal";
import { OtpFolderVisibility } from "../components/OtpFolderVisibility";

/* ------------------------------------------------ */
/* Icons                                            */
/* ------------------------------------------------ */
function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2Z" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8Z" />
    </svg>
  );
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
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

  /* ---- Handlers ---- */
  function handleGenerate() {
    if (visibleCount === 0) {
      setNotice({
        title: "No Visible Folders",
        message: "Make at least one folder visible before generating an OTP.",
        tone: "warn",
      });
      return;
    }
    const newOtp = generateOtp();
    setOtp(newOtp);
  }

  function handleCancelOtp() {
    clearOtp();
    setOtp(null);
    setNotice({ title: "OTP Cancelled", message: "The access code has been invalidated.", tone: "success" });
  }

  function handleOtpExpired() {
    setOtp(null);
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
      {/* Header */}
      <div className="wm-pageHead">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={() => nav("/employee/vault", { state: { tab: "documents" } })}
            style={{
              width: 36, height: 36, borderRadius: 10,
              border: "1px solid var(--wm-emp-border, rgba(15, 23, 42, 0.08))",
              background: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--wm-emp-text)", flexShrink: 0,
            }}
            aria-label="Back to vault documents"
          >
            <IconBack />
          </button>
          <div>
            <div className="wm-pageTitle" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: VAULT_ACCENT }}><IconShield /></span>
              Share Access
            </div>
            <div className="wm-pageSub">
              Generate a one-time code for an employer to view your documents.
            </div>
          </div>
        </div>
      </div>

      {/* OTP Section */}
      <section
        className="wm-ee-card"
        style={{
          marginTop: 16, padding: "24px 16px", borderRadius: 16,
          border: `1px solid ${VAULT_ACCENT}18`, background: `${VAULT_ACCENT}04`,
        }}
      >
        {otp ? (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-emp-muted)", textAlign: "center", marginBottom: 16 }}>
              Share this code with the employer
            </div>

            <VaultOtpDisplay code={otp.code} expiresAt={otp.expiresAt} onExpired={handleOtpExpired} />

            <div style={{ marginTop: 20, textAlign: "center" }}>
              <button type="button" onClick={handleGenerate}
                style={{
                  height: 40, padding: "0 20px", borderRadius: 10, border: "none",
                  background: VAULT_ACCENT, color: "#fff", fontWeight: 700, fontSize: 13,
                  cursor: "pointer", marginRight: 8,
                }}>
                New Code
              </button>
              <button type="button" onClick={handleCancelOtp}
                style={{
                  height: 40, padding: "0 20px", borderRadius: 10,
                  border: "1px solid rgba(220, 38, 38, 0.25)", background: "rgba(220, 38, 38, 0.08)",
                  color: "#dc2626", fontWeight: 700, fontSize: 13, cursor: "pointer",
                }}>
                Cancel Code
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-emp-text)", marginBottom: 8 }}>
              No active access code
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-emp-muted)", marginBottom: 20, lineHeight: 1.6 }}>
              Generate a 6-digit code to share with an employer. The code expires after 5 minutes and can only be used once.
            </div>
            <button type="button" onClick={handleGenerate}
              style={{
                height: 44, padding: "0 28px", borderRadius: 12, border: "none",
                background: VAULT_ACCENT, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}>
              Generate Access Code
            </button>
          </div>
        )}
      </section>

      {/* Security Note */}
      <div
        style={{
          marginTop: 12, padding: "10px 14px", borderRadius: 10,
          background: "rgba(22, 163, 74, 0.06)", border: "1px solid rgba(22, 163, 74, 0.15)",
          fontSize: 12, color: "#15803d", fontWeight: 600, lineHeight: 1.5,
        }}
      >
        Only folders marked "Visible" will be shown. The employer gets read-only access for 30 minutes.
      </div>

      {/* Folder Visibility */}
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