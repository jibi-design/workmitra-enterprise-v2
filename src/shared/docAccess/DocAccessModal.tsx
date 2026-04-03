// src/shared/docAccess/DocAccessModal.tsx
//
// Document Access Modal — used in both Shift Jobs + Career Jobs.
// Step 1: OTP request sent → employee notified
// Step 2: Employer enters OTP
// Step 3: Documents shown (30 min session, view-only)
// Employee can revoke anytime.

import { useEffect, useRef, useState } from "react";
import { docAccessOtpService } from "./docAccessOtpService";
import { docAccessSessionStorage } from "./docAccessSessionStorage";
import { employerSettingsStorage } from "../../features/employer/company/storage/employerSettings.storage";
import { getVisibleFolders } from "../../features/employee/workVault/services/vaultFolderService";
import { getAllDocuments } from "../../features/employee/workVault/services/vaultDocumentService";
import { FullscreenDocViewer } from "../components/FullscreenDocViewer";
import type { VaultDocument, VaultFolder } from "../../features/employee/workVault/types/vaultTypes";
import { OTP_CODE_LENGTH, VAULT_ACCENT } from "../../features/employee/workVault/constants/vaultConstants";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  workerName: string;
  workerWmId: string;
  domain: "shift" | "career";
  onClose: () => void;
};

/* ------------------------------------------------ */
/* Session Timer                                    */
/* ------------------------------------------------ */
function SessionTimer() {
  const [ms, setMs] = useState(() => docAccessSessionStorage.getRemainingMs());

  useEffect(() => {
    const t = setInterval(() => setMs(docAccessSessionStorage.getRemainingMs()), 1000);
    return () => clearInterval(t);
  }, []);

  const secs = Math.ceil(ms / 1000);
  const min  = Math.floor(secs / 60);
  const sec  = secs % 60;
  const isLow = secs <= 120;

  if (ms <= 0) {
    return <span style={{ fontSize: 12, fontWeight: 600, color: "#dc2626" }}>Session expired</span>;
  }

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "5px 12px", borderRadius: 999,
      background: isLow ? "rgba(220,38,38,0.08)" : "rgba(124,58,237,0.08)",
      border: `1px solid ${isLow ? "rgba(220,38,38,0.2)" : "rgba(124,58,237,0.2)"}`,
    }}>
      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
        <path fill={isLow ? "#dc2626" : VAULT_ACCENT}
          d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2ZM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8Zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7Z" />
      </svg>
      <span style={{ fontSize: 12, fontWeight: 700, color: isLow ? "#dc2626" : VAULT_ACCENT }}>
        {min}:{String(sec).padStart(2, "0")} remaining
      </span>
    </div>
  );
}

/* ------------------------------------------------ */
/* OTP Input Boxes                                  */
/* ------------------------------------------------ */
function OtpInputBoxes({
  onSubmit,
  error,
}: {
  onSubmit: (code: string) => void;
  error: string;
}) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_CODE_LENGTH).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(i: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits]; next[i] = val; setDigits(next);
    if (val && i < OTP_CODE_LENGTH - 1) refs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, key: string) {
    if (key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_CODE_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    refs.current[Math.min(pasted.length, OTP_CODE_LENGTH - 1)]?.focus();
  }

  const isFilled = digits.every((d) => d !== "");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 12 }}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e.key)}
            onPaste={i === 0 ? handlePaste : undefined}
            autoFocus={i === 0}
            style={{
              width: 44, height: 52, borderRadius: 12,
              border: digit ? `2px solid ${VAULT_ACCENT}` : "2px solid var(--wm-er-border)",
              background: digit ? `${VAULT_ACCENT}06` : "#fff",
              fontSize: 22, fontWeight: 700, textAlign: "center",
              color: VAULT_ACCENT, outline: "none",
            }}
          />
        ))}
      </div>
      {error && (
        <div style={{ fontSize: 12, color: "#dc2626", fontWeight: 600, marginBottom: 10, textAlign: "center" }}>
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={() => { if (isFilled) onSubmit(digits.join("")); }}
        disabled={!isFilled}
        style={{
          width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
          background: isFilled ? VAULT_ACCENT : "#e5e7eb",
          color: isFilled ? "#fff" : "#9ca3af",
          fontWeight: 600, fontSize: 13,
          cursor: isFilled ? "pointer" : "not-allowed",
        }}
      >
        Verify &amp; View Documents
      </button>
    </div>
  );
}

/* ------------------------------------------------ */
/* Document List (view-only)                        */
/* ------------------------------------------------ */
function DocumentList({
  folders,
  documents,
}: {
  folders: VaultFolder[];
  documents: VaultDocument[];
}) {
  const [viewing, setViewing] = useState<VaultDocument | null>(null);

  if (folders.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: "center", fontSize: 12, color: "var(--wm-er-muted)" }}>
        No visible documents. The employee has not shared any folders.
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "grid", gap: 14, maxHeight: 400, overflowY: "auto" }}>
        {folders.map((folder) => {
          const folderDocs = documents.filter((d) => d.folderId === folder.id);
          return (
            <div key={folder.id}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-muted)", marginBottom: 6 }}>
                📁 {folder.name} ({folderDocs.length})
              </div>
              {folderDocs.length === 0 ? (
                <div style={{ fontSize: 11, color: "var(--wm-er-muted)", fontStyle: "italic", paddingLeft: 8 }}>
                  No documents in this folder.
                </div>
              ) : (
                <div style={{ display: "grid", gap: 6 }}>
                  {folderDocs.map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setViewing(doc)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px", borderRadius: 10, textAlign: "left",
                        border: "1px solid var(--wm-er-border)",
                        background: "var(--wm-er-bg)", cursor: "pointer", width: "100%",
                      }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: doc.fileType === "pdf" ? "rgba(220,38,38,0.08)" : `${VAULT_ACCENT}10`,
                      }}>
                        {doc.thumbnailBase64 && doc.fileType === "image" ? (
                          <img src={doc.thumbnailBase64} alt={doc.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                            <path fill={doc.fileType === "pdf" ? "#dc2626" : VAULT_ACCENT}
                              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 2 4 4h-4V4ZM6 20V4h6v6h6v10H6Z" />
                          </svg>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {doc.name}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--wm-er-muted)", marginTop: 2 }}>
                          {doc.fileType.toUpperCase()} · Tap to view
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {viewing && (
        <FullscreenDocViewer
          name={viewing.name}
          fileType={viewing.fileType}
          base64Data={viewing.base64Data}
          subtitle="View only · Cannot be downloaded"
          onClose={() => setViewing(null)}
        />
      )}
    </>
  );
}

/* ------------------------------------------------ */
/* Main Modal                                       */
/* ------------------------------------------------ */
type Step = "requesting" | "otp" | "viewing";

export function DocAccessModal({ workerName, workerWmId, domain, onClose }: Props) {
  const [step, setStep]           = useState<Step>("requesting");
  const [otpError, setOtpError]   = useState("");
  const [folders, setFolders]     = useState<VaultFolder[]>([]);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [sessionActive, setSessionActive] = useState(false);

  /* Auto-expire check */
  useEffect(() => {
    if (step !== "viewing") return;
    const t = setInterval(() => {
      if (!docAccessSessionStorage.isSessionValid()) {
        setSessionActive(false);
      }
    }, 2000);
    return () => clearInterval(t);
  }, [step]);

  /* Step 1: Generate OTP on mount */
  useEffect(() => {
    const employer     = employerSettingsStorage.get();
    const employerName = employer.companyName || employer.fullName || "Employer";
    const employerId   = employer.uniqueId ?? "unknown";

    docAccessOtpService.generate({ employerName, employerId, domain, workerWmId });

    const t = setTimeout(() => setStep("otp"), 1200);
    return () => clearTimeout(t);
  }, [domain, workerWmId]);

  function handleOtpSubmit(code: string) {
    const ok = docAccessOtpService.verify(code);
    if (!ok) {
      setOtpError("Invalid or expired code. Ask the employee for a new code.");
      return;
    }

    const employer = employerSettingsStorage.get();
    docAccessSessionStorage.createSession({
      employerId:   employer.uniqueId ?? "unknown",
      employerName: employer.companyName || employer.fullName || "Employer",
      workerWmId,
      domain,
    });

    const visibleFolders = getVisibleFolders();
    const allDocs        = getAllDocuments();
    const visibleIds     = new Set(visibleFolders.map((f) => f.id));
    setFolders(visibleFolders);
    setDocuments(allDocs.filter((d) => visibleIds.has(d.folderId)));
    setSessionActive(true);
    setOtpError("");
    setStep("viewing");
  }

  function handleEndSession() {
    docAccessSessionStorage.revokeSession();
    setSessionActive(false);
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(0,0,0,0.65)",
        display: "flex", alignItems: "flex-start",
        justifyContent: "center",
        overflowY: "auto", padding: "24px 16px 48px",
      }}
      onClick={step !== "viewing" ? onClose : undefined}
    >
      <div
        style={{
          width: "100%", maxWidth: 480,
          background: "var(--wm-er-card, #fff)",
          borderRadius: 16, padding: "20px 20px 24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Requesting */}
        {step === "requesting" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", margin: "0 auto 14px",
              background: `${VAULT_ACCENT}10`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
                <path fill={VAULT_ACCENT}
                  d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2Zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2Zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2Z" />
              </svg>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 6 }}>
              Sending access request...
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.6 }}>
              An OTP has been sent to <strong>{workerName}</strong>'s app.
              Ask them to share the 6-digit code with you.
            </div>
          </div>
        )}

        {/* OTP Entry */}
        {step === "otp" && (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 4 }}>
                Enter Access Code
              </div>
              <div style={{ fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
                Ask <strong>{workerName}</strong> to share the 6-digit OTP from their WorkMitra app.
                Code expires in 5 minutes.
              </div>
            </div>

            <div style={{
              marginBottom: 14, padding: "10px 12px", borderRadius: 10,
              background: `${VAULT_ACCENT}05`,
              border: `1px solid ${VAULT_ACCENT}20`,
              fontSize: 11, color: "#5b21b6", lineHeight: 1.5,
            }}>
              The employee must approve. They will see a notification with the OTP.
              Only proceed if they confirm.
            </div>

            <OtpInputBoxes onSubmit={handleOtpSubmit} error={otpError} />

            <button
              type="button"
              onClick={onClose}
              style={{
                width: "100%", marginTop: 10, padding: "10px 0", borderRadius: 10,
                border: "1px solid var(--wm-er-border)", background: "none",
                fontSize: 13, fontWeight: 600, color: "var(--wm-er-muted)", cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </>
        )}

        {/* Viewing Documents */}
        {step === "viewing" && sessionActive && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>
                  {workerName}'s Documents
                </div>
                <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
                  View only · Employee can revoke anytime
                </div>
              </div>
              <SessionTimer />
            </div>

            <div style={{
              marginBottom: 12, padding: "8px 12px", borderRadius: 8,
              background: "rgba(217,119,6,0.06)",
              border: "1px solid rgba(217,119,6,0.15)",
              fontSize: 11, color: "#92400e", fontWeight: 600,
            }}>
              Documents cannot be downloaded or saved. Access is logged and visible to the employee.
            </div>

            <DocumentList folders={folders} documents={documents} />

            <button
              type="button"
              onClick={handleEndSession}
              style={{
                width: "100%", marginTop: 16, padding: "10px 0", borderRadius: 10,
                border: "1px solid rgba(220,38,38,0.25)",
                background: "rgba(220,38,38,0.06)",
                color: "#dc2626", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              End Session
            </button>
          </>
        )}

        {/* Session expired */}
        {step === "viewing" && !sessionActive && (
          <div style={{ textAlign: "center", padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#dc2626", marginBottom: 6 }}>
              Session Expired
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 16 }}>
              The 30-minute access window has ended.
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 24px", borderRadius: 10, border: "none",
                background: VAULT_ACCENT, color: "#fff",
                fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}