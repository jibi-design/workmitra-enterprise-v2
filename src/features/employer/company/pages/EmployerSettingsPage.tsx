/** Job Mitra | EmployerSettingsPage.tsx — Pro single-employer settings (Module B) */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { DeleteAccountModal } from "../../../../shared/components/DeleteAccountModal";
import { NoticeModal, type NoticeData } from "../../../../shared/components/NoticeModal";
import { AccountSecurityPanel } from "../../../../shared/settings/AccountSecurityPanel";
import { DangerZoneSection } from "../../../../shared/settings/DangerZoneSection";
import { useAuthStore } from "../../../../shared/store/authStore";
import { employerSettingsStorage, type EmployerProfile } from "../storage/employerSettings.storage";
import { IconEdit, IconCompany } from "../helpers/settingsIcons";
import { EmployerSettingsIdentityCard } from "../components/EmployerSettingsIdentityCard";
import { EmployerSettingsShiftEscrowSection } from "../components/EmployerSettingsShiftEscrowSection";
import { EmployerSettingsNotificationsSection } from "../components/EmployerSettingsNotificationsSection";

export function EmployerSettingsPage() {
  const nav = useNavigate();
  const deleteAccountSession = useAuthStore((s) => s.deleteAccountSession);
  const [profile, setProfile] = useState<EmployerProfile>(() => employerSettingsStorage.get());
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<EmployerProfile>(() => ({ ...profile }));
  const [notice, setNotice] = useState<NoticeData | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
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
    employerSettingsStorage.savePartial({
      shiftFavoritesFirstDefault: Boolean(draft.shiftFavoritesFirstDefault),
      escrowHoldDefaultEnabled: draft.escrowHoldDefaultEnabled !== false,
      notificationsEnabled: draft.notificationsEnabled,
      quietHoursEnabled: draft.quietHoursEnabled,
      quietFrom: draft.quietFrom,
      quietTo: draft.quietTo,
      globalMute: draft.globalMute,
    });
    const saved = employerSettingsStorage.get();
    setProfile(saved);
    setDraft(saved);
    setEditMode(false);
    setNotice({
      title: "Settings Saved",
      message: "Shift, escrow, and notification preferences updated.",
      tone: "success",
    });
  }

  async function handleDeleteConfirm(password: string) {
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await deleteAccountSession(password);
      setDeleteOpen(false);
      nav(ROUTE_PATHS.landing, { replace: true });
    } catch (err) {
      const message =
        err instanceof Error && err.message.trim()
          ? err.message
          : "Could not delete account. Check your password and try again.";
      setDeleteError(message);
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className="wm-stackGrid">
      <DomainHero
        variant="settings"
        audience="employer"
        icon={<SettingsGearIcon />}
        title="Employer Settings"
        subtitle="Identity, security, shift defaults, notifications"
        description="Single-employer Pro controls. Company KYC edits live on Company Profile."
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
              Edit prefs
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

      <EmployerSettingsIdentityCard profile={profile} />

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

      <EmployerSettingsShiftEscrowSection
        data={d}
        editMode={editMode}
        onFieldChange={updateDraft}
      />

      <AccountSecurityPanel
        variant="employer"
        onNotice={(title, message, tone) =>
          setNotice({ title, message, tone: tone === "warn" ? "warn" : tone === "success" ? "success" : "info" })
        }
      />

      <DangerZoneSection onDeleteAccount={() => setDeleteOpen(true)} />

      <EmployerSettingsNotificationsSection
        data={d}
        editMode={editMode}
        onFieldChange={updateDraft}
      />

      <DeleteAccountModal
        open={deleteOpen}
        onCancel={() => {
          if (deleteBusy) return;
          setDeleteOpen(false);
          setDeleteError(null);
        }}
        onConfirm={handleDeleteConfirm}
        busy={deleteBusy}
        errorMessage={deleteError}
        deletionMessage="This will permanently remove your employer data including company profile links, job posts, and settings on this account."
      />

      <NoticeModal notice={notice} onClose={() => setNotice(null)} />
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
