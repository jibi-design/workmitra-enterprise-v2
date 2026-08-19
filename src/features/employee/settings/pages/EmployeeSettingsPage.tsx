/** Job Mitra | EmployeeSettingsPage.tsx — Pro / Advanced Settings (Module B) */

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { DeleteAccountModal } from "../../../../shared/components/DeleteAccountModal";
import { AccountSecurityPanel } from "../../../../shared/settings/AccountSecurityPanel";
import { DangerZoneSection } from "../../../../shared/settings/DangerZoneSection";
import { useAuthStore } from "../../../../shared/store/authStore";
import {
  EmployeeSettingsNoticeDialog,
  type EmployeeSettingsNotice,
  type EmployeeSettingsNoticeTone,
} from "../components/EmployeeSettingsNoticeDialog";
import { EmployeeSettingsWorkPayoutSection } from "../components/EmployeeSettingsWorkPayoutSection";
import { EmployeeSettingsPrivacySection } from "../components/EmployeeSettingsPrivacySection";
import { EmployeeSettingsNotificationControlsSection } from "../components/EmployeeSettingsNotificationControlsSection";
import {
  employeeSettingsStorage,
  type EmployeeSettings,
} from "../storage/employeeSettings.storage";

type SettingsTab = "security" | "work" | "privacy" | "notifications";

const TABS: Array<{ id: SettingsTab; label: string }> = [
  { id: "security", label: "Account & Security" },
  { id: "work", label: "Work & Payout" },
  { id: "privacy", label: "Privacy & Compliance" },
  { id: "notifications", label: "Notifications" },
];

export function EmployeeSettingsPage() {
  const nav = useNavigate();
  const deleteAccountSession = useAuthStore((s) => s.deleteAccountSession);
  const initial = useMemo(() => employeeSettingsStorage.get(), []);
  const [settings, setSettings] = useState<EmployeeSettings>(initial);
  const [tab, setTab] = useState<SettingsTab>("security");
  const [notice, setNotice] = useState<EmployeeSettingsNotice>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function openNotice(title: string, message: string, tone: EmployeeSettingsNoticeTone = "info") {
    setNotice({ title, message, tone });
  }

  function save(next: EmployeeSettings) {
    const safeNext: EmployeeSettings = { ...next, language: "en" };
    employeeSettingsStorage.set(safeNext);
    setSettings(safeNext);
  }

  function toggle<K extends keyof EmployeeSettings>(key: K) {
    save({ ...settings, [key]: !settings[key] });
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
      <EmployeeSettingsNoticeDialog notice={notice} onClose={() => setNotice(null)} />

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
        deletionMessage="This will permanently remove your employee profile, shift history, vault data on this account, and settings."
      />

      <DomainHero
        variant="settings"
        audience="employee"
        icon={<SettingsGearIcon />}
        title="Pro / Advanced Settings"
        subtitle="Security, payout preferences, privacy, and alerts"
        description="Identity is bound to your signed-in auth session. App preferences save on this device."
      />

      <div
        role="tablist"
        aria-label="Advanced settings sections"
        style={{
          display: "flex",
          flexWrap: "nowrap",
          gap: 8,
          marginTop: 4,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={active ? "wm-primarybtn" : "wm-outlineBtn"}
              onClick={() => setTab(t.id)}
              style={{ fontSize: 12, padding: "8px 12px" }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" style={{ marginTop: 4 }}>
        {tab === "security" ? (
          <>
            <AccountSecurityPanel
              variant="employee"
              onNotice={(title, message, tone) =>
                openNotice(
                  title,
                  message,
                  tone === "warn" ? "warn" : tone === "success" ? "success" : "info",
                )
              }
            />
            <DangerZoneSection onDeleteAccount={() => setDeleteOpen(true)} />
          </>
        ) : null}
        {tab === "work" ? (
          <EmployeeSettingsWorkPayoutSection settings={settings} onSave={save} />
        ) : null}
        {tab === "privacy" ? (
          <EmployeeSettingsPrivacySection settings={settings} onSave={save} onToggle={toggle} />
        ) : null}
        {tab === "notifications" ? (
          <EmployeeSettingsNotificationControlsSection settings={settings} onToggle={toggle} />
        ) : null}
      </div>
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
