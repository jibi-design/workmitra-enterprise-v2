// src/features/employee/profile/components/ProfileDocumentsSection.tsx

import { useRef, useState } from "react";
import { SectionHead, IconDocs, IconUpload } from "./ProfilePageIcons";

type Props = { disabled: boolean };

export function ProfileDocumentsSection({ disabled }: Props) {
  const resumeInputRef = useRef<HTMLInputElement | null>(null);
  const [resumeFileName, setResumeFileName] = useState("");

  function onResumePicked(file: File | null): void {
    if (!file) return;
    setResumeFileName(file.name);
  }

  function clearResume(): void {
    setResumeFileName("");
    if (resumeInputRef.current) resumeInputRef.current.value = "";
  }

  return (
    <section className="wm-ee-card" style={{ marginTop: 12 }}>
      <SectionHead icon={<IconDocs />} title="Documents" sub="Upload your resume and ID proof" />

      <div className="wm-field">
        <label className="wm-label">Resume (optional)</label>
        <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }}
          onChange={(e) => onResumePicked(e.target.files?.[0] ?? null)} />
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 6 }}>
          <button className="wm-outlineBtn" type="button" disabled={disabled}
            onClick={() => resumeInputRef.current?.click()}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <IconUpload /> Upload Resume
          </button>
          {resumeFileName && (
            <>
              <div style={{ fontSize: 12, color: "var(--wm-emp-text)", fontWeight: 600 }}>{resumeFileName}</div>
              {!disabled && (
                <button type="button" onClick={clearResume}
                  style={{ border: 0, background: "transparent", fontSize: 12, fontWeight: 700, color: "var(--wm-error)", cursor: "pointer", padding: 0 }}>
                  Remove
                </button>
              )}
            </>
          )}
          {!resumeFileName && (
            <div style={{ fontSize: 11, color: "var(--wm-emp-muted)" }}>No file selected</div>
          )}
        </div>
      </div>

      
    </section>
  );
}