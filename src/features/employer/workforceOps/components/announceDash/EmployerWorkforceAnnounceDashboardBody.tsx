// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceAnnounceDashboardBody.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\announceDash\EmployerWorkforceAnnounceDashboardBody.tsx

import type {
  WorkforceAnnouncement,
  WorkforceApplication,
} from "../../../../../shared/domains/workforce/types/workforceTypes";
import { EmployerWorkforceAnnounceDashActions } from "../EmployerWorkforceAnnounceDashActions";
import { EmployerWorkforceAnnounceDashApplications } from "../EmployerWorkforceAnnounceDashApplications";
import { EmployerWorkforceAnnounceDashHeader } from "../EmployerWorkforceAnnounceDashHeader";
import { EmployerWorkforceAnnounceDashStats } from "../EmployerWorkforceAnnounceDashStats";

type Props = {
  announcement: WorkforceAnnouncement;
  applications: WorkforceApplication[];
  groupedApplications: Map<string, WorkforceApplication[]>;
  categoryMap: Map<string, string>;
  totalVacancy: number;
  appliedCount: number;
  selectedCount: number;
  isTerminal: boolean;
  statusColor: string;
  confirmGroupOpen: boolean;
  saveTemplateOpen: boolean;
  templateName: string;
  templateError: string;
  actionError: string;
  onBack: () => void;
  onStatusChange: (newStatus: WorkforceAnnouncement["status"]) => void;
  onOpenConfirmGroup: () => void;
  onConfirmGroup: () => void;
  onCancelConfirmGroup: () => void;
  onOpenSaveTemplate: () => void;
  onTemplateNameChange: (value: string) => void;
  onSaveTemplate: () => void;
  onCancelSaveTemplate: () => void;
};

export function EmployerWorkforceAnnounceDashboardBody({
  announcement,
  applications,
  groupedApplications,
  categoryMap,
  totalVacancy,
  appliedCount,
  selectedCount,
  isTerminal,
  statusColor,
  confirmGroupOpen,
  saveTemplateOpen,
  templateName,
  templateError,
  actionError,
  onBack,
  onStatusChange,
  onOpenConfirmGroup,
  onConfirmGroup,
  onCancelConfirmGroup,
  onOpenSaveTemplate,
  onTemplateNameChange,
  onSaveTemplate,
  onCancelSaveTemplate,
}: Props) {
  return (
    <div className="wm-er-vWorkforce">
      <EmployerWorkforceAnnounceDashHeader
        announcement={announcement}
        statusColor={statusColor}
        onBack={onBack}
      />

      <EmployerWorkforceAnnounceDashStats
        announcement={announcement}
        categoryMap={categoryMap}
        totalVacancy={totalVacancy}
        appliedCount={appliedCount}
        selectedCount={selectedCount}
      />

      <EmployerWorkforceAnnounceDashApplications
        announcement={announcement}
        applications={applications}
        groupedApplications={groupedApplications}
        categoryMap={categoryMap}
      />

      <EmployerWorkforceAnnounceDashActions
        announcement={announcement}
        isTerminal={isTerminal}
        selectedCount={selectedCount}
        confirmGroupOpen={confirmGroupOpen}
        saveTemplateOpen={saveTemplateOpen}
        templateName={templateName}
        templateError={templateError}
        actionError={actionError}
        onStatusChange={onStatusChange}
        onOpenConfirmGroup={onOpenConfirmGroup}
        onConfirmGroup={onConfirmGroup}
        onCancelConfirmGroup={onCancelConfirmGroup}
        onOpenSaveTemplate={onOpenSaveTemplate}
        onTemplateNameChange={onTemplateNameChange}
        onSaveTemplate={onSaveTemplate}
        onCancelSaveTemplate={onCancelSaveTemplate}
      />

      <div style={{ height: 24 }} />
    </div>
  );
}
