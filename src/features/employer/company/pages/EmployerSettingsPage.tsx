/** Job Mitra | EmployerSettingsPage.tsx — App settings dashboard */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { roleStorage } from "../../../../app/storage/roleStorage";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { logoutApp, postLogoutRoute } from "../../../../shared/auth/logoutApp";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { employerSettingsStorage, type EmployerProfile } from "../storage/employerSettings.storage";
import { NoticeModal, type NoticeData } from "../../../../shared/components/NoticeModal";
import { DeleteAccountModal } from "../components/DeleteAccountModal";
import { ExportImportSection } from "../../../../shared/components/ExportImportSection";
import { IconEdit, IconCompany } from "../helpers/settingsIcons";
import { PreferencesSection, DangerZoneSection } from "../components/SettingsActionSections";
import { EmployerSettingsAccountSection } from "../components/EmployerSettingsAccountSection";
import { EmployerSettingsNotificationsSection } from "../components/EmployerSettingsNotificationsSection";
import { EmployerSettingsHapticsSection } from "../components/EmployerSettingsHapticsSection";
import { EmployerSettingsHelpLegalSection } from "../components/EmployerSettingsHelpLegalSection";

export function EmployerSettingsPage() {
  const nav = useNavigate();
  const [profile, setProfile] = useState<EmployerProfile>(() => employerSettingsStorage.get());
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<EmployerProfile>(() => ({ ...profile }));
  const [notice, setNotice] = useState<NoticeData | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
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
      setNotice({ title: "Validation Failed", message: result.errors.join("\n"), tone: "warn" });
      return;
    }
    const trimmed: EmployerProfile = {
      ...draft,
      companyName: draft.companyName.trim(),
      fullName: draft.fullName.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      locationCity: draft.locationCity.trim(),
      locationState: draft.locationState.trim(),
      companyDescription: draft.companyDescription.trim(),
    };
    employerSettingsStorage.save(trimmed);
    const saved = employerSettingsStorage.get();
    setProfile(saved);
    setDraft(saved);
    setEditMode(false);
    setNotice({
      title: "Settings Saved",
      message: "Your settings have been saved.",
      tone: "success",
    });
  }

  function executeDeleteAccount(): void {
    setDeleteModalOpen(false);
    localStorage.clear();
    roleStorage.clear();
    nav(ROUTE_PATHS.landing, { replace: true });
  }

  return (
    <div className="wm-stackGrid">
      <DomainHero
        variant="settings"
        audience="employer"
        icon={<SettingsGearIcon />}
        title="App Settings"
        subtitle="Notifications, preferences, and account control"
        description="Manage employer app behaviour. Company profile is linked below."
        trailing={
          !editMode ? (
            <button
              type="button"
              className="wm-outlineBtn"
              onClick={handleEdit}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: "var(--wm-brand-700, #1d4ed8)",
                borderColor: "color-mix(in srgb, var(--wm-brand-600, #2563eb) 28%, transparent)",
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
              <button className="wm-primarybtn" type="button" onClick={handleSave}>
                Save
              </button>
            </div>
          )
        }
      />

      <button
        type="button"
        className="wm-settingsLinkCard"
        onClick={() => nav(ROUTE_PATHS.employerProfile)}
      >
        <div className="wm-settingsLinkCard__icon">
          <IconCompany />
        </div>
        <div className="wm-settingsLinkCard__copy">
          <div className="wm-settingsLinkCard__title">Company Profile</div>
          <div className="wm-settingsLinkCard__sub">Identity, branding, logo, location</div>
        </div>
        <span className="wm-settingsLinkCard__chevron" aria-hidden="true">
          ›
        </span>
      </button>

      <button
        type="button"
        className="wm-settingsLinkCard"
        data-testid="settings-open-compliance-hub"
        onClick={() => nav(ROUTE_PATHS.employerCompliance)}
      >
        <div className="wm-settingsLinkCard__icon">
          <IconCompany />
        </div>
        <div className="wm-settingsLinkCard__copy">
          <div className="wm-settingsLinkCard__title">Business Compliance Hub</div>
          <div className="wm-settingsLinkCard__sub">
            Insurance, H&amp;S, verification pack, RTW audit log
          </div>
        </div>
        <span className="wm-settingsLinkCard__chevron" aria-hidden="true">
          ›
        </span>
      </button>

      <EmployerSettingsAccountSection
        onLogoutAllDevices={() => {
          void logoutApp().then(() => {
            nav(postLogoutRoute(), { replace: true });
          });
        }}
      />
      <EmployerSettingsNotificationsSection
        data={d}
        editMode={editMode}
        onFieldChange={updateDraft}
      />
      <EmployerSettingsHapticsSection data={d} editMode={editMode} onFieldChange={updateDraft} />
      <PreferencesSection data={d} editMode={editMode} onFieldChange={updateDraft} />
      <ExportImportSection />
      <EmployerSettingsHelpLegalSection />
      <DangerZoneSection onDeleteAccount={() => setDeleteModalOpen(true)} />
      <NoticeModal notice={notice} onClose={() => setNotice(null)} />
      <DeleteAccountModal
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={executeDeleteAccount}
      />
    </div>
  );
}

function SettingsGearIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.14 12.94a7.07 7.07 0 0 0 .06-.94c0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.26.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.03-1.58ZM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2Z"
      />
    </svg>
  );
}
