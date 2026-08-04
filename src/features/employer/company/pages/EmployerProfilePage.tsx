/** Job Mitra | EmployerProfilePage.tsx — 3-layer identity + trust sections. */

import { useCallback, useState } from "react";
import { employerSettingsStorage, type EmployerProfile } from "../storage/employerSettings.storage";
import { NoticeModal, type NoticeData } from "../../../../shared/components/NoticeModal";
import { YourAccountSection } from "../components/employerProfile/YourAccountSection";
import { BusinessProfileSection } from "../components/employerProfile/BusinessProfileSection";
import { VerificationSection } from "../components/employerProfile/VerificationSection";
import { OwnershipAccessSection } from "../components/employerProfile/OwnershipAccessSection";
import { PublicProfilePreview } from "../components/PublicProfilePreview";
import { IconEdit } from "../helpers/settingsIcons";

export function EmployerProfilePage() {
  const [profile, setProfile] = useState<EmployerProfile>(() => employerSettingsStorage.get());
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<EmployerProfile>(() => ({ ...profile }));
  const [notice, setNotice] = useState<NoticeData | null>(null);

  const d = editMode ? draft : profile;

  const updateDraft = useCallback((field: keyof EmployerProfile, value: string | boolean) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }, []);

  function handleEdit(): void {
    setDraft({ ...profile });
    setEditMode(true);
  }

  function handleCancel(): void {
    setDraft({ ...profile });
    setEditMode(false);
  }

  function handleSave(): void {
    const result = employerSettingsStorage.validate(draft);
    if (!result.valid) {
      setNotice({ title: "Could not save", message: result.errors.join("\n"), tone: "warn" });
      return;
    }

    const trimmed: EmployerProfile = {
      ...draft,
      companyName: draft.companyName.trim(),
      registrationNo: draft.registrationNo.trim(),
      fullName: draft.fullName.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      locationCity: draft.locationCity.trim(),
      locationState: draft.locationState.trim(),
      companyDescription: draft.companyDescription.trim(),
      publicHandle: draft.publicHandle?.trim().toLowerCase(),
    };

    employerSettingsStorage.save(trimmed);
    const saved = employerSettingsStorage.get();
    setProfile(saved);
    setDraft(saved);
    setEditMode(false);
    setNotice({
      title: "Saved",
      message: "Your business profile has been saved.",
      tone: "success",
    });
  }

  const handleLogoPersist = useCallback((logoDataUrl: string) => {
    const saved = employerSettingsStorage.savePartial({ companyLogo: logoDataUrl });
    setProfile(saved);
    setDraft((prev) => ({ ...prev, companyLogo: logoDataUrl }));
    setNotice({
      title: "Logo saved",
      message: "Business logo saved on this device.",
      tone: "success",
    });
  }, []);

  const handleContactVerified = useCallback(() => {
    const saved = employerSettingsStorage.get();
    setProfile(saved);
    setDraft((prev) => ({
      ...prev,
      contactVerified: true,
      verificationLevel: saved.verificationLevel,
    }));
  }, []);

  const handleProfileRefresh = useCallback(() => {
    const saved = employerSettingsStorage.get();
    setProfile(saved);
    setDraft(saved);
  }, []);

  return (
    <div>
      <div className="wm-profileHero">
        <div className="wm-profileHero__avatar wm-profileHero__avatar--employer" aria-hidden="true">
          {d.companyLogo ? (
            <img
              src={d.companyLogo}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
            />
          ) : (
            (d.companyName || "E")
              .trim()
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase() ?? "")
              .join("") || "E"
          )}
          {!editMode ? (
            <button
              type="button"
              className="wm-profileHero__edit"
              aria-label="Edit company profile"
              onClick={handleEdit}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm8-2h-2.17l-1.24-1.35A2 2 0 0 0 15.12 5H8.88a2 2 0 0 0-1.47.65L6.17 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Zm-8 11a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          ) : null}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="wm-profileHero__name">{d.companyName?.trim() || "Company profile"}</div>
          <span className="wm-profileHero__role">Employer</span>
          <div style={{ marginTop: 6, fontSize: 13, color: "var(--wm-emp-muted, #64748b)" }}>
            {[d.industryType, d.companySize].filter(Boolean).join(" · ") ||
              "Industry / size not set"}
          </div>
          {d.uniqueId ? (
            <div
              className="wm-profileHero__id"
              role="button"
              tabIndex={0}
              onClick={() => {
                void navigator.clipboard.writeText(d.uniqueId ?? "");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  void navigator.clipboard.writeText(d.uniqueId ?? "");
                }
              }}
            >
              {d.uniqueId}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          {!editMode ? (
            <button
              type="button"
              onClick={handleEdit}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                minHeight: 44,
                borderRadius: "var(--wm-radius-button)",
                border: "1px solid rgba(148,163,184,0.28)",
                background: "rgba(255,255,255,0.9)",
                padding: "0 16px",
                fontWeight: 700,
                fontSize: 13,
                color: "var(--wm-emp-text, #0f172a)",
                cursor: "pointer",
              }}
            >
              <IconEdit />
              Edit
            </button>
          ) : (
            <button
              className="wm-outlineBtn"
              type="button"
              onClick={handleCancel}
              style={{ minHeight: 44 }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <YourAccountSection data={d} editMode={editMode} onFieldChange={updateDraft} />

      <BusinessProfileSection
        data={d}
        editMode={editMode}
        onFieldChange={updateDraft}
        onNotice={setNotice}
        onLogoPersist={handleLogoPersist}
      />

      <VerificationSection
        data={d}
        editMode={editMode}
        onFieldChange={updateDraft}
        onContactVerified={handleContactVerified}
        onProfileRefresh={handleProfileRefresh}
        onNotice={setNotice}
      />

      <OwnershipAccessSection
        data={d}
        onProfileRefresh={handleProfileRefresh}
        onNotice={setNotice}
      />

      <PublicProfilePreview profile={d} />

      {editMode ? (
        <div className="wm-profileSaveBar">
          <button type="button" className="wm-profileSaveBar__btn" onClick={handleSave}>
            Save profile
          </button>
        </div>
      ) : null}

      <NoticeModal notice={notice} onClose={() => setNotice(null)} />
    </div>
  );
}
