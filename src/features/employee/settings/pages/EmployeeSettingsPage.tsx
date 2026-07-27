// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeSettingsPage.tsx (Phase 3 — Premium Settings Dashboard)

import { useMemo, useState } from "react";
import { roleStorage } from "../../../../app/storage/roleStorage";
import { logoutApp, postLogoutRoute } from "../../../../shared/auth/logoutApp";
import { purgeUserLocalStateOnLogout } from "../../../../shared/auth/logoutLocalPurge";
import { DeleteAccountModal } from "../../../../shared/components/DeleteAccountModal";
import { ExportImportSection } from "../../../../shared/components/ExportImportSection";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { EmployeeSettingsAboutSection } from "../components/EmployeeSettingsAboutSection";
import {
  EmployeeSettingsConfirmDialog,
  type EmployeeSettingsConfirmState,
} from "../components/EmployeeSettingsConfirmDialog";
import { EmployeeSettingsHapticsSection } from "../components/EmployeeSettingsHapticsSection";
import { EmployeeSettingsHelpLegalSection } from "../components/EmployeeSettingsHelpLegalSection";
import {
  EmployeeSettingsNoticeDialog,
  type EmployeeSettingsNotice,
  type EmployeeSettingsNoticeTone,
} from "../components/EmployeeSettingsNoticeDialog";
import { EmployeeSettingsNotificationsSection } from "../components/EmployeeSettingsNotificationsSection";
import { EmployeeSettingsPreferencesSection } from "../components/EmployeeSettingsPreferencesSection";
import { EmployeeSettingsSecuritySection } from "../components/EmployeeSettingsSecuritySection";
import {
  employeeSettingsStorage,
  type EmployeeSettings,
} from "../storage/employeeSettings.storage";

export function EmployeeSettingsPage() {
  const initial = useMemo(() => employeeSettingsStorage.get(), []);
  const [settings, setSettings] = useState<EmployeeSettings>(initial);

  const [notice, setNotice] = useState<EmployeeSettingsNotice>(null);
  const [confirm, setConfirm] = useState<EmployeeSettingsConfirmState>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  function openNotice(title: string, message: string, tone: EmployeeSettingsNoticeTone = "info") {
    setNotice({ title, message, tone });
  }

  function closeNotice() {
    setNotice(null);
  }
  function openConfirm(next: EmployeeSettingsConfirmState) {
    setConfirm(next);
  }
  function closeConfirm() {
    setConfirm(null);
  }

  function runConfirmAction() {
    if (!confirm) return;
    try {
      confirm.onConfirm();
    } finally {
      setConfirm(null);
    }
  }

  function save(next: EmployeeSettings) {
    const safeNext: EmployeeSettings = { ...next, language: "en" };
    employeeSettingsStorage.set(safeNext);
    setSettings(safeNext);
  }

  /** Quiet-hours time inputs — UI immediate, storage/event coalesced (P1-1). */
  function saveDebounced(next: EmployeeSettings) {
    const safeNext: EmployeeSettings = { ...next, language: "en" };
    setSettings(safeNext);
    employeeSettingsStorage.setDebounced(safeNext);
  }

  function toggle<K extends keyof EmployeeSettings>(key: K) {
    save({ ...settings, [key]: !settings[key] });
  }

  function clearLocalData() {
    openConfirm({
      title: "Clear local data on this device?",
      message:
        "This will remove vault documents, profile, settings, notifications, shift/career local caches, identity bridge, and the device PII key on this browser.",
      confirmText: "Clear local data",
      danger: true,
      onConfirm: () => {
        purgeUserLocalStateOnLogout();
        openNotice("Cleared", "Local data cleared. The app will reload now.", "info");
        window.setTimeout(() => window.location.reload(), 450);
      },
    });
  }

  function logout() {
    openConfirm({
      title: "Logout from this device?",
      message:
        "You will be signed out and local vault, profile, and PII caches on this device will be cleared.",
      confirmText: "Logout",
      danger: false,
      onConfirm: () => {
        void logoutApp().then(() => {
          window.location.href = postLogoutRoute();
        });
      },
    });
  }

  function deleteAccount() {
    setDeleteModalOpen(true);
  }

  function runDeleteAccount() {
    setDeleteModalOpen(false);
    localStorage.clear();
    roleStorage.clear();
    window.location.href = "/";
  }

  return (
    <div className="wm-stackGrid">
      {/* Dialogs */}
      <EmployeeSettingsNoticeDialog notice={notice} onClose={closeNotice} />
      <EmployeeSettingsConfirmDialog
        confirm={confirm}
        onCancel={closeConfirm}
        onConfirm={runConfirmAction}
      />
      <DeleteAccountModal
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={runDeleteAccount}
        deletionMessage="This will permanently remove ALL your data — profile, ratings, work history, documents, and settings."
      />

      {/* Premium page header */}
      <DomainHero
        variant="settings"
        audience="employee"
        icon={<SettingsGearIcon />}
        title="App Settings"
        subtitle="Notifications, security, and app behaviour"
        description="Profile fields are managed elsewhere. Use this page for app preferences only."
      />

      {/* Sections */}
      <EmployeeSettingsNotificationsSection
        settings={settings}
        onSaveDebounced={saveDebounced}
        onToggle={toggle}
      />

      <EmployeeSettingsHapticsSection settings={settings} onToggle={toggle} />

      <EmployeeSettingsPreferencesSection settings={settings} onSave={save} onToggle={toggle} />

      <EmployeeSettingsSecuritySection
        settings={settings}
        onToggle={toggle}
        onClearLocalData={clearLocalData}
        onDeleteAccount={deleteAccount}
        onLogout={logout}
      />

      <EmployeeSettingsHelpLegalSection />

      <ExportImportSection />

      <EmployeeSettingsAboutSection />
    </div>
  );
}

function SettingsGearIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96a7.04 7.04 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54a7.22 7.22 0 0 0-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61l-2.01-1.58ZM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6Z"
      />
    </svg>
  );
}
