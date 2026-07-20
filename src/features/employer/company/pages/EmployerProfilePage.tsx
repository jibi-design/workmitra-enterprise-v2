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

const PURPLE = "#7c3aed";
const PURPLE_LIGHT = "rgba(124,58,237,0.08)";
const PURPLE_BORDER = "rgba(124,58,237,0.15)";

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
      <div className="wm-pageHead">
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: PURPLE_LIGHT,
              border: `1px solid ${PURPLE_BORDER}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: PURPLE,
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 7V3H2v18h20V7H12ZM6 19H4v-2h2v2Zm0-4H4v-2h2v2Zm0-4H4V9h2v2Zm0-4H4V5h2v2Zm4 12H8v-2h2v2Zm0-4H8v-2h2v2Zm0-4H8V9h2v2Zm0-4H8V5h2v2Zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10Zm-2-8h-2v2h2v-2Zm0 4h-2v2h2v-2Z"
              />
            </svg>
          </div>
          <div>
            <div className="wm-pageTitle">Employer Profile</div>
            <div className="wm-pageSub">Your account and business identity</div>
          </div>
        </div>

        {!editMode ? (
          <button
            type="button"
            onClick={handleEdit}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 36,
              borderRadius: 8,
              border: "none",
              background: PURPLE_LIGHT,
              padding: "8px 16px",
              fontWeight: 700,
              fontSize: 13,
              color: PURPLE,
              cursor: "pointer",
            }}
          >
            <IconEdit />
            Edit
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="wm-outlineBtn" type="button" onClick={handleCancel}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                height: 40,
                borderRadius: 8,
                border: 0,
                background: PURPLE,
                padding: "8px 18px",
                fontWeight: 700,
                fontSize: 13,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Save
            </button>
          </div>
        )}
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
        onNotice={setNotice}
      />

      <OwnershipAccessSection
        data={d}
        onProfileRefresh={handleProfileRefresh}
        onNotice={setNotice}
      />

      <PublicProfilePreview profile={d} />

      <NoticeModal notice={notice} onClose={() => setNotice(null)} />
    </div>
  );
}
