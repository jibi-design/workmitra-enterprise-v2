/** Job Mitra | EmployerSettingsPage.tsx (Phase 3 — Premium Settings Dashboard)
 *  Controls: Account & Security, Notifications & Navigation, Sound & Haptics,
 *  Preferences, Export/Import, Help, Danger Zone.
 *  Identity/profile moved to /employer/profile.
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { roleStorage } from "../../../../app/storage/roleStorage";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { employerSettingsStorage, type EmployerProfile } from "../storage/employerSettings.storage";
import { ConfirmModal, type ConfirmData } from "../../../../shared/components/ConfirmModal";
import { NoticeModal, type NoticeData } from "../../../../shared/components/NoticeModal";
import { DeleteAccountModal } from "../components/DeleteAccountModal";
import { ExportImportSection } from "../../../../shared/components/ExportImportSection";
import { IconEdit, IconCompany } from "../helpers/settingsIcons";
import { PreferencesSection, DangerZoneSection } from "../components/SettingsActionSections";
import { EmployerSettingsAccountSection } from "../components/EmployerSettingsAccountSection";
import { EmployerSettingsNotificationsSection } from "../components/EmployerSettingsNotificationsSection";
import { EmployerSettingsHapticsSection } from "../components/EmployerSettingsHapticsSection";

export function EmployerSettingsPage() {
  const nav = useNavigate();

  const [profile, setProfile] = useState<EmployerProfile>(() => employerSettingsStorage.get());
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<EmployerProfile>(() => ({ ...profile }));
  const [confirm, setConfirm] = useState<ConfirmData | null>(null);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
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

  function handleDeleteAccount(): void {
    setDeleteModalOpen(true);
  }

  function executeDeleteAccount(): void {
    setDeleteModalOpen(false);
    localStorage.clear();
    roleStorage.clear();
    nav(ROUTE_PATHS.landing, { replace: true });
  }

  return (
    <div>
      {/* Page header */}
      <div className="wm-pageHead">
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "var(--wm-er-accent-hr-light)",
              border: "1px solid var(--wm-er-accent-hr-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--wm-er-accent-hr)",
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M19.14 12.94a7.07 7.07 0 0 0 .06-.94c0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.26.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.03-1.58ZM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2Z"
              />
            </svg>
          </div>
          <div>
            <div className="wm-pageTitle">App Settings</div>
            <div className="wm-pageSub">Notifications, preferences, and account control.</div>
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
              background: "var(--wm-er-accent-hr-light)",
              padding: "8px 16px",
              fontWeight: 700,
              fontSize: 13,
              color: "var(--wm-er-accent-hr)",
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
                background: "var(--wm-er-accent-hr)",
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

      {/* Navigate to Company Profile (Identity) */}
      <button
        type="button"
        onClick={() => nav(ROUTE_PATHS.employerProfile)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          width: "100%",
          marginTop: 12,
          padding: "14px 16px",
          borderRadius: 16,
          background: "rgba(124,58,237,0.04)",
          border: "1px solid rgba(124,58,237,0.15)",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 11,
            background: "rgba(124,58,237,0.1)",
            color: "var(--wm-er-accent-hr, #7c3aed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <IconCompany />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-accent-hr, #7c3aed)" }}>
            Company Profile
          </div>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2, fontWeight: 500 }}>
            Identity, branding, logo, location
          </div>
        </div>
        <span style={{ fontSize: 18, color: "var(--wm-er-muted)", flexShrink: 0 }}>›</span>
      </button>

      {/* Account & Security */}
      <EmployerSettingsAccountSection
        onLogoutAllDevices={() =>
          setNotice({
            title: "Sessions cleared",
            message: "All other devices have been signed out (demo). This device remains active.",
            tone: "success",
          })
        }
      />

      {/* Notifications & Navigation (includes Pulse toggle) */}
      <EmployerSettingsNotificationsSection
        data={d}
        editMode={editMode}
        onFieldChange={updateDraft}
      />

      {/* Sound & Haptics */}
      <EmployerSettingsHapticsSection data={d} editMode={editMode} onFieldChange={updateDraft} />

      {/* Preferences */}
      <PreferencesSection data={d} editMode={editMode} onFieldChange={updateDraft} />

      <ExportImportSection />

      {/* Help & Legal */}
      <div className="wm-er-card" style={{ marginTop: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>
          Help &amp; Legal
        </div>
        <div style={{ marginTop: 8, display: "grid", gap: 4 }}>
          <button
            type="button"
            onClick={() => {
              window.location.hash = "#/employer/help";
            }}
            style={{
              background: "none",
              border: "none",
              padding: "8px 0",
              textAlign: "left",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--wm-er-accent-hr)",
              cursor: "pointer",
            }}
          >
            Help &amp; Support →
          </button>
          <button
            type="button"
            onClick={() =>
              window.open("https://jibi-design.github.io/workmitra-privacy/", "_blank")
            }
            style={{
              background: "none",
              border: "none",
              padding: "8px 0",
              textAlign: "left",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--wm-er-muted)",
              cursor: "pointer",
            }}
          >
            Privacy Policy →
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <DangerZoneSection onDeleteAccount={handleDeleteAccount} />

      {/* Modals */}
      <NoticeModal notice={notice} onClose={() => setNotice(null)} />
      <ConfirmModal
        confirm={confirm}
        onCancel={() => {
          setConfirm(null);
          setConfirmAction(null);
        }}
        onConfirm={() => {
          setConfirm(null);
          if (confirmAction) confirmAction();
          setConfirmAction(null);
        }}
      />
      <DeleteAccountModal
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={executeDeleteAccount}
      />
    </div>
  );
}
