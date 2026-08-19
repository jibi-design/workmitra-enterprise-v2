// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AdminHomePage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\admin\home\pages\AdminHomePage.tsx

import { AdminHomeActivityTimeline } from "../components/AdminHomeActivityTimeline";
import { AdminHomeDomainSections } from "../components/AdminHomeDomainSections";
import { AdminHomeHeader } from "../components/AdminHomeHeader";
import { AdminHomeKpiSection } from "../components/AdminHomeKpiSection";
import { AdminHomeQuickActions } from "../components/AdminHomeQuickActions";
import { AdminHomeResetModal } from "../components/AdminHomeResetModal";
import { AdminHomeSystemStatus } from "../components/AdminHomeSystemStatus";
import { AdminAnomalyBadgeStrip } from "../components/AdminAnomalyBadgeStrip";
import { useAdminHomePage } from "../hooks/useAdminHomePage";

export function AdminHomePage() {
  const page = useAdminHomePage();

  return (
    <div className="wm-ad-fadeIn">
      <AdminHomeResetModal
        open={page.showResetConfirm}
        onCancel={page.closeResetConfirm}
        onReset={page.handleReset}
      />

      <AdminHomeHeader />

      <AdminAnomalyBadgeStrip />

      <AdminHomeKpiSection data={page.data} />

      <AdminHomeDomainSections data={page.data} />

      <AdminHomeQuickActions
        onOpenAuditLog={page.openAuditLog}
        onOpenModeration={page.openModeration}
        onExportData={page.exportAllData}
        onResetAll={page.openResetConfirm}
      />

      <AdminHomeSystemStatus
        data={page.data}
        formatBytes={page.formatBytes}
        relativeTime={page.relativeTime}
      />

      <AdminHomeActivityTimeline
        activity={page.data.activity}
        showTimeline={page.showTimeline}
        onToggleTimeline={page.toggleTimeline}
        onOpenFullAuditLog={page.openAuditLog}
        formatDate={page.formatDate}
      />
    </div>
  );
}
