// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminHomeQuickActions.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\home\components\AdminHomeQuickActions.tsx

import { Sec } from "./AdminHomeSharedUi";

type Props = {
  onOpenAuditLog: () => void;
  onOpenModeration: () => void;
  onExportData: () => void;
  onResetAll: () => void;
};

export function AdminHomeQuickActions({
  onOpenAuditLog,
  onOpenModeration,
  onExportData,
  onResetAll,
}: Props) {
  return (
    <>
      <Sec label="Quick Actions" />

      <div className="wm-ad-actions">
        <button
          type="button"
          className="wm-ad-actionBtn"
          data-variant="default"
          onClick={onOpenAuditLog}
        >
          Audit Log
        </button>

        <button type="button" className="wm-ad-actionBtn" data-variant="default" onClick={onOpenModeration}>
          Moderation
        </button>

        <button
          type="button"
          className="wm-ad-actionBtn"
          data-variant="green"
          onClick={onExportData}
        >
          Export Data
        </button>

        <button
          type="button"
          className="wm-ad-actionBtn"
          data-variant="danger"
          onClick={onResetAll}
        >
          Reset All
        </button>
      </div>
    </>
  );
}
