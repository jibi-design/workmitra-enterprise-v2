// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminSettingsClearCard.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\oversight\components\adminSettings\AdminSettingsClearCard.tsx

import { AdminSettingsClearRow } from "./AdminSettingsSharedUi";

type Props = {
  hasWorkforceKeys: boolean;
  onClearShiftJobs: () => void;
  onClearCareerJobs: () => void;
  onResetAllData: () => void;
};

export function AdminSettingsClearCard({
  hasWorkforceKeys,
  onClearShiftJobs,
  onClearCareerJobs,
  onResetAllData,
}: Props) {
  return (
    <div className="wm-ad-domainCard" style={{ paddingLeft: 20 }}>
      <div
        style={{ fontSize: 13, color: "var(--wm-ad-navy-400)", marginBottom: 14, lineHeight: 1.6 }}
      >
        Clear data for a specific domain without affecting others. This cannot be undone.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <AdminSettingsClearRow
          label="Clear Shift Jobs Data"
          description="Posts, applications, workspaces, activity logs"
          color="var(--wm-ad-shift)"
          onClear={onClearShiftJobs}
        />

        <AdminSettingsClearRow
          label="Clear Career Jobs Data"
          description="Posts, applications, workspaces, activity logs"
          color="var(--wm-ad-career-light)"
          onClear={onClearCareerJobs}
        />

        <AdminSettingsClearRow
          label="Clear Workforce Data"
          description="No data stored yet (Phase-0)"
          color="var(--wm-ad-workforce)"
          disabled={!hasWorkforceKeys}
          onClear={() => {}}
        />

        <div style={{ borderTop: "1px solid var(--wm-ad-divider)", paddingTop: 12 }}>
          <AdminSettingsClearRow
            label="Reset All Data"
            description="Clear everything: all domains, profiles, settings"
            color="var(--wm-ad-danger)"
            onClear={onResetAllData}
          />
        </div>
      </div>
    </div>
  );
}
