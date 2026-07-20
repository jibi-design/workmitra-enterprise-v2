// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeSettingsPage.tsx (Phase 3 — Premium Settings Dashboard)

import { useMemo, useState } from "react";
import { roleStorage } from "../../../../app/storage/roleStorage";
import { DeleteAccountModal } from "../../../../shared/components/DeleteAccountModal";
import { ExportImportSection } from "../../../../shared/components/ExportImportSection";
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

  function toggle<K extends keyof EmployeeSettings>(key: K) {
    save({ ...settings, [key]: !settings[key] });
  }

  function clearLocalData() {
    openConfirm({
      title: "Clear local demo data?",
      message:
        "This will reset your profile, settings, notifications, and demo counters on this device.",
      confirmText: "Clear local data",
      danger: true,
      onConfirm: () => {
        localStorage.removeItem("wm_employee_home_demo_v1");
        localStorage.removeItem("wm_employee_profile_v1");
        localStorage.removeItem("wm_employee_notifications_v1");
        localStorage.removeItem("wm_employee_settings_v1");
        openNotice("Cleared", "Local demo data cleared. The app will reload now.", "info");
        window.setTimeout(() => window.location.reload(), 450);
      },
    });
  }

  function logout() {
    openConfirm({
      title: "Logout from this device?",
      message: "You will return to role selection. Any unsaved changes will be lost.",
      confirmText: "Logout",
      danger: false,
      onConfirm: () => {
        roleStorage.clear();
        window.location.href = "/";
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
    <div>
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
      <div className="wm-pageHead">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "rgba(99,102,241,0.10)",
              border: "1px solid rgba(99,102,241,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              aria-hidden="true"
              style={{ color: "#6366f1" }}
            >
              <path
                fill="currentColor"
                d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96a7.04 7.04 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54a7.22 7.22 0 0 0-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61l-2.01-1.58ZM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6Z"
              />
            </svg>
          </div>
          <div>
            <div className="wm-pageTitle">App Settings</div>
            <div className="wm-pageSub">
              Notifications, security, and app behaviour. Profile fields are not here.
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <EmployeeSettingsNotificationsSection settings={settings} onSave={save} onToggle={toggle} />

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
