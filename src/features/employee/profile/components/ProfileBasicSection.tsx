// src/features/employee/profile/components/ProfileBasicSection.tsx

import { useRef } from "react";
import type { ProfileSectionProps } from "../types/profileTypes";
import { clampString, readImageAsDataUrl } from "../helpers/profileHelpers";
import { SectionHead, IconUser, IconCamera } from "./ProfilePageIcons";
import type { NoticeData } from "../../../../shared/components/NoticeModal";

type Props = ProfileSectionProps & {
  sectionRef: React.RefObject<HTMLElement | null>;
  onNotice: (n: NoticeData) => void;
};

const avatarContainerStyle: React.CSSProperties = {
  width: 72, height: 72, borderRadius: 16,
  border: "2px dashed var(--wm-emp-border, rgba(15, 23, 42, 0.10))",
  display: "flex", alignItems: "center", justifyContent: "center",
  background: "var(--wm-emp-bg)", overflow: "hidden", flexShrink: 0,
};

export function ProfileBasicSection({ draft, disabled, onUpdate, sectionRef, onNotice }: Props) {
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  async function onPhotoPicked(file: File | null): Promise<void> {
    if (!file) return;
    if (file.size > 1_000_000) {
      onNotice({ title: "Photo Too Large", message: "Please choose an image under 1 MB.", tone: "warn" });
      return;
    }
    try {
      const dataUrl = await readImageAsDataUrl(file);
      onUpdate("photoDataUrl", dataUrl);
    } catch {
      onNotice({ title: "Upload Failed", message: "Could not read the image. Please try another file.", tone: "error" });
    }
  }

  return (
    <section className="wm-ee-card" style={{ marginTop: 12 }} ref={sectionRef}>
      <SectionHead icon={<IconUser />} title="Basic Profile" />

      <div className="wm-field">
        <label className="wm-label">Full name <span style={{ color: "var(--wm-error)" }}>*</span></label>
        <input className="wm-input" value={draft.fullName} disabled={disabled}
          onChange={(e) => {
            const val = e.target.value.replace(/\b\w/g, (c) => c.toUpperCase());
            onUpdate("fullName", val);
          }}
          onBlur={() => onUpdate("fullName", clampString(draft.fullName.trim().replace(/\s+/g, " "), 60))}
          placeholder="Your name" minLength={2} />
        {draft.fullName.trim().length > 0 && draft.fullName.trim().length < 2 && (
          <div style={{ fontSize: 11, color: "var(--wm-error)", marginTop: 4 }}>Minimum 2 characters required</div>
        )}
      </div>

      <div className="wm-field" style={{ marginTop: 10 }}>
        <label className="wm-label">City <span style={{ color: "var(--wm-error)" }}>*</span></label>
        <input className="wm-input" value={draft.city} disabled={disabled}
          onChange={(e) => {
            const val = e.target.value.replace(/\b\w/g, (c) => c.toUpperCase());
            onUpdate("city", val);
          }}
          onBlur={() => onUpdate("city", clampString(draft.city.trim().replace(/\s+/g, " "), 40))}
          placeholder="Enter your city" />
      </div>

      <div className="wm-field" style={{ marginTop: 10 }}>
        <label className="wm-label">Profile photo (optional)</label>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6 }}>
          <div style={avatarContainerStyle}>
            {draft.photoDataUrl ? (
              <img src={draft.photoDataUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <IconUser />
            )}
          </div>
          <div style={{ display: "grid", gap: 8, flex: 1 }}>
            <input ref={photoInputRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={(e) => void onPhotoPicked(e.target.files?.[0] ?? null)} />
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <button className="wm-outlineBtn" type="button" disabled={disabled}
                onClick={() => photoInputRef.current?.click()}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <IconCamera /> {draft.photoDataUrl ? "Change" : "Upload"}
              </button>
              {draft.photoDataUrl && !disabled && (
                <button type="button" onClick={() => onUpdate("photoDataUrl", "")}
                  style={{ border: 0, background: "transparent", fontSize: 12, fontWeight: 700, color: "var(--wm-error)", cursor: "pointer", padding: 0 }}>
                  Remove
                </button>
              )}
            </div>
            <div style={{ fontSize: 11, color: "var(--wm-emp-muted)" }}>Max 1 MB</div>
          </div>
        </div>
      </div>
    </section>
  );
}