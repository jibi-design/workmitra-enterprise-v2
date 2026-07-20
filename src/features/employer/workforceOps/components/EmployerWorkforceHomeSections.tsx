// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceHomeSections.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceHomeSections.tsx

import type {
  WorkforceActivityEntry,
  WorkforceAnnouncement,
  WorkforceCategory,
} from "../../../../shared/domains/workforce/types/workforceTypes";
import { EmployerWorkforceHomeActivitySection } from "./EmployerWorkforceHomeActivitySection";
import { EmployerWorkforceHomeAnnouncementsSection } from "./EmployerWorkforceHomeAnnouncementsSection";
import { EmployerWorkforceHomeCategoriesSection } from "./EmployerWorkforceHomeCategoriesSection";
import type { EmployerWorkforceHomeDeleteTarget } from "./EmployerWorkforceHomeCategoriesSection";
import { EmployerWorkforceHomeHowItWorks } from "./EmployerWorkforceHomeHowItWorks";

type Props = {
  categories: WorkforceCategory[];
  recentAnnouncements: WorkforceAnnouncement[];
  recentActivity: WorkforceActivityEntry[];
  hasData: boolean;
  showCatInput: boolean;
  catVal: string;
  catErr: string;
  deleteTarget: EmployerWorkforceHomeDeleteTarget | null;
  deleteErr: string;
  getTotalVacancy: (announcementId: string) => number;
  statusColor: (status: WorkforceAnnouncement["status"]) => string;
  statusLabel: (status: WorkforceAnnouncement["status"]) => string;
  onStartDelete: (category: WorkforceCategory) => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onCatValueChange: (value: string) => void;
  onOpenCategoryInput: () => void;
  onAddCategory: () => void;
  onCancelCategoryInput: () => void;
  onOpenStaff: () => void;
  onOpenAnnouncementDash: (announcementId: string) => void;
};

export function EmployerWorkforceHomeSections({
  categories,
  recentAnnouncements,
  recentActivity,
  hasData,
  showCatInput,
  catVal,
  catErr,
  deleteTarget,
  deleteErr,
  getTotalVacancy,
  statusColor,
  statusLabel,
  onStartDelete,
  onConfirmDelete,
  onCancelDelete,
  onCatValueChange,
  onOpenCategoryInput,
  onAddCategory,
  onCancelCategoryInput,
  onOpenStaff,
  onOpenAnnouncementDash,
}: Props) {
  return (
    <>
      <EmployerWorkforceHomeCategoriesSection
        categories={categories}
        showCatInput={showCatInput}
        catVal={catVal}
        catErr={catErr}
        deleteTarget={deleteTarget}
        deleteErr={deleteErr}
        onStartDelete={onStartDelete}
        onConfirmDelete={onConfirmDelete}
        onCancelDelete={onCancelDelete}
        onCatValueChange={onCatValueChange}
        onOpenCategoryInput={onOpenCategoryInput}
        onAddCategory={onAddCategory}
        onCancelCategoryInput={onCancelCategoryInput}
      />

      <EmployerWorkforceHomeHowItWorks />

      <EmployerWorkforceHomeAnnouncementsSection
        recentAnnouncements={recentAnnouncements}
        hasData={hasData}
        getTotalVacancy={getTotalVacancy}
        statusColor={statusColor}
        statusLabel={statusLabel}
        onOpenStaff={onOpenStaff}
        onOpenAnnouncementDash={onOpenAnnouncementDash}
      />

      <EmployerWorkforceHomeActivitySection recentActivity={recentActivity} />
    </>
  );
}
