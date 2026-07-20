// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminSettingsAboutCard.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\oversight\components\adminSettings\AdminSettingsAboutCard.tsx

import { AdminSettingsAboutRow } from "./AdminSettingsSharedUi";

export function AdminSettingsAboutCard() {
  return (
    <div className="wm-ad-domainCard" style={{ paddingLeft: 20 }}>
      <div style={{ display: "grid", gap: 10 }}>
        <AdminSettingsAboutRow label="Application" value="Job Mitra Enterprise" />
        <AdminSettingsAboutRow label="Version" value="0.1.0-demo" />
        <AdminSettingsAboutRow label="Phase" value="Phase-0 (localStorage only)" />
        <AdminSettingsAboutRow label="Build" value="React + TypeScript + Vite" />
        <AdminSettingsAboutRow label="Backend" value="None (client-side demo)" />
        <AdminSettingsAboutRow label="Data Storage" value="Browser localStorage" />
      </div>

      <div
        style={{
          marginTop: 14,
          padding: "12px 14px",
          borderRadius: 10,
          background: "var(--wm-ad-card-inner)",
          border: "1px solid var(--wm-ad-border)",
        }}
      >
        <div style={{ fontSize: 12, color: "var(--wm-ad-navy-400)", lineHeight: 1.6 }}>
          This is a Phase-0 demonstration build. All data is stored locally in your browser. No real
          OTP verification, payments, or backend messaging is active. Play Store compliance verified
          — no restricted APIs in use.
        </div>
      </div>
    </div>
  );
}
