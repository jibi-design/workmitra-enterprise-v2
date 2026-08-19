/** Job Mitra | ProfileDocumentsSection.tsx | Primary CV upload → WorkVault (no second store) */

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "react-router-dom";
import { VAULT_SENSITIVE_UPLOAD_NOTICE } from "../../workVault/constants/vaultConstants";
import { employeeNotificationsStorage } from "../../notifications/storage/employeeNotifications.storage";
import { NoticeModal, type NoticeData } from "../../../../shared/components/NoticeModal";
import { SectionHead, IconDocs } from "./ProfilePageIcons";
import {
  hasVaultCvDocument,
  listVaultCvDocuments,
  subscribeVaultCv,
  uploadProfileCvToVault,
} from "../helpers/profileCvVault.helpers";

function getCvSnapshot(): string {
  return hasVaultCvDocument()
    ? listVaultCvDocuments()
        .map((d) => d.id)
        .join(",")
    : "";
}

export function ProfileDocumentsSection() {
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<NoticeData | null>(null);
  const cvSnap = useSyncExternalStore(subscribeVaultCv, getCvSnapshot, getCvSnapshot);
  const hasCv = cvSnap.length > 0;

  const autoOpenRef = useRef(false);
  useEffect(() => {
    if (searchParams.get("uploadCv") !== "1" || autoOpenRef.current) return;
    autoOpenRef.current = true;
    inputRef.current?.click();
    const next = new URLSearchParams(searchParams);
    next.delete("uploadCv");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  async function handleFile(file: File | null) {
    if (!file || busy) return;
    setBusy(true);
    const result = await uploadProfileCvToVault(file);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
    if (!result.ok) {
      setNotice({ title: "Upload failed", message: result.reason, tone: "warn" });
      return;
    }
    employeeNotificationsStorage.pushCareer("Profile updated", "CV stored in Work Vault.");
    setNotice({
      title: "CV stored",
      message: `"${result.name}" is in Work Vault. You can stay on Profile.`,
      tone: "success",
    });
  }

  return (
    <section className="wm-profileSectionCard" data-testid="profile-cv-upload">
      <SectionHead
        icon={<IconDocs />}
        title="Career documents"
        sub="Upload a CV here. It is stored in Work Vault automatically."
      />

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        hidden
        data-testid="profile-cv-file"
        onChange={(event) => {
          void handleFile(event.target.files?.[0] ?? null);
        }}
      />

      <button
        type="button"
        className="wm-primarybtn"
        data-testid="profile-cv-upload-btn"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? "Uploading…" : "Upload CV / Resume"}
      </button>

      <p className="wm-profileHint">{hasCv ? "A CV is already in Work Vault." : "PDF or image. Max 2 MB."}</p>
      <p className="wm-profileHint">{VAULT_SENSITIVE_UPLOAD_NOTICE}</p>
      <NoticeModal notice={notice} onClose={() => setNotice(null)} />
    </section>
  );
}
