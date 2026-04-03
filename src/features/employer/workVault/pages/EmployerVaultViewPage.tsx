// src/features/employer/workVault/pages/EmployerVaultViewPage.tsx

import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { VAULT_ACCENT } from "../../../employee/workVault/constants/vaultConstants";
import type { VaultFolder, VaultDocument, VaultSession } from "../../../employee/workVault/types/vaultTypes";
import { verifyOtp } from "../../../employee/workVault/services/vaultOtpService";
import {
  createSession,
  getActiveSession,
  isSessionValid,
  getSessionRemainingMs,
  revokeSession,
  expireOldSessions,
} from "../../../employee/workVault/services/vaultAccessService";
import { getVisibleFolders } from "../../../employee/workVault/services/vaultFolderService";
import { getAllDocuments } from "../../../employee/workVault/services/vaultDocumentService";
import { getVaultSectionData } from "../../../employee/workVault/services/vaultDataAggregator";
import type { VaultSectionData } from "../../../employee/workVault/services/vaultDataAggregator";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";
import { EmployerVaultOtpInput } from "../components/EmployerVaultOtpInput";
import { EmployerVaultProfileView } from "../components/EmployerVaultProfileView";

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

/* ------------------------------------------------ */
/* Session Timer                                    */
/* ------------------------------------------------ */
function SessionTimer({ session }: { session: VaultSession }) {
  const [remainingMs, setRemainingMs] = useState(() => getSessionRemainingMs(session.id));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingMs(getSessionRemainingMs(session.id));
    }, 1000);
    return () => clearInterval(interval);
  }, [session.id]);

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const isLow = totalSeconds <= 120;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 999,
        background: isLow ? "rgba(220, 38, 38, 0.08)" : `${VAULT_ACCENT}08`,
        border: isLow
          ? "1px solid rgba(220, 38, 38, 0.20)"
          : `1px solid ${VAULT_ACCENT}18`,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill={isLow ? "#dc2626" : VAULT_ACCENT}
          d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2ZM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8Zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7Z"
        />
      </svg>
 <span style={{ fontSize: 13, fontWeight: 700, color: isLow ? "#dc2626" : VAULT_ACCENT }}>
        {remainingMs <= 0 ? "Session expired" : `${minutes}:${String(seconds).padStart(2, "0")} remaining`}
      </span>
    </div>
  );
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
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
      const visibleIds = visibleFolders.map((f) => f.id);
      return getAllDocuments().filter((d) => visibleIds.includes(d.folderId));
    }
    return [];
  });

  const loadVaultData = useCallback(() => {
    setSectionData(getVaultSectionData());
    const visibleFolders = getVisibleFolders();
    const allDocs = getAllDocuments();
    const visibleIds = visibleFolders.map((f) => f.id);
    setFolders(visibleFolders);
    setDocuments(allDocs.filter((d) => visibleIds.includes(d.folderId)));
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
    setSession(newSession);
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
      {/* Header */}
      <div className="wm-pageHead">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={() => nav("/employer/vault")}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: "1px solid var(--wm-er-divider, rgba(15, 23, 42, 0.08))",
              background: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--wm-er-text)",
              flexShrink: 0,
            }}
            aria-label="Back"
          >
            <IconBack />
          </button>
          <div>
            <div className="wm-pageTitle">Employee Profile</div>
            <div className="wm-pageSub">
              {isActive ? "Full access · session active" : "OTP verification required to unlock"}
            </div>
          </div>
        </div>
      </div>

      {/* OTP Input (if no active session) */}
      {!isActive && (
        <section
          className="wm-ee-card"
          style={{
            marginTop: 16,
            padding: "24px 16px",
            borderRadius: 16,
            border: `1px solid ${VAULT_ACCENT}18`,
            background: `${VAULT_ACCENT}04`,
          }}
        >
          <EmployerVaultOtpInput
            employeeName={employeeId ?? "Employee"}
            onSubmit={handleOtpSubmit}
            onCancel={() => nav("/employer/vault")}
            error={otpError}
          />
        </section>
      )}

      {/* Active Session — Full Profile View */}
      {isActive && session && sectionData && (
        <>
          {/* Timer + End Session */}
          <div
            style={{
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <SessionTimer session={session} />
            <button
              type="button"
              onClick={handleEndSession}
              style={{
                height: 32,
                padding: "0 14px",
                borderRadius: 8,
                border: "1px solid rgba(220, 38, 38, 0.25)",
                background: "rgba(220, 38, 38, 0.08)",
                color: "#dc2626",
               fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              End Session
            </button>
          </div>

          {/* Security Note */}
          <div
            style={{
              marginTop: 10,
              padding: "8px 12px",
              borderRadius: 8,
              background: "rgba(217, 119, 6, 0.06)",
              border: "1px solid rgba(217, 119, 6, 0.15)",
              fontSize: 11,
              color: "#92400e",
              fontWeight: 600,
            }}
          >
            View-only access. Documents cannot be downloaded or saved. The employee can see this access in their history.
          </div>

          {/* Full Profile + Documents */}
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