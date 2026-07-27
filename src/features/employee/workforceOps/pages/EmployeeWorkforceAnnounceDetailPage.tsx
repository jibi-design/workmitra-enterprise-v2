// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeWorkforceAnnounceDetailPage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workforceOps\pages\EmployeeWorkforceAnnounceDetailPage.tsx

import { useCallback, useMemo, useState } from "react";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { readAnnouncements } from "../../../../shared/domains/workforce/helpers/workforceNormalizers";
import { WF_ANNOUNCEMENTS_KEY } from "../../../../shared/domains/workforce/storage/workforceStorageUtils";
import { IconBack } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { EmployeeWorkforceAnnounceDetailContent } from "../components/EmployeeWorkforceAnnounceDetailContent";
import { employeeWorkforceHelpers } from "../services/employeeWorkforceHelpers";

type Props = {
  announcementId: string;
  onBack: () => void;
};

export function EmployeeWorkforceAnnounceDetailPage({ announcementId, onBack }: Props) {
  const announcement = useMemo(
    () =>
      readAnnouncements(WF_ANNOUNCEMENTS_KEY).find((item) => item.id === announcementId) ?? null,
    [announcementId],
  );

  const staff = useMemo(() => employeeWorkforceHelpers.getMyStaffRecord(), []);

  const existingApp = useMemo(
    () => employeeWorkforceHelpers.getApplicationForAnnouncement(announcementId),
    [announcementId],
  );

  const categories = useMemo(() => employeeWorkforceHelpers.getAllCategories(), []);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();

    for (const category of categories) {
      map.set(category.id, category.name);
    }

    return map;
  }, [categories]);

  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [applied, setApplied] = useState(existingApp !== null);

  const hasConflict = useMemo(() => {
    if (!announcement) return false;

    const confirmed = readAnnouncements(WF_ANNOUNCEMENTS_KEY).filter(
      (item) =>
        item.status === "confirmed" &&
        item.date === announcement.date &&
        item.id !== announcement.id,
    );

    return confirmed.length > 0;
  }, [announcement]);

  const totalVacancy = useMemo(() => {
    if (!announcement) return 0;

    let total = 0;

    for (const categoryId of announcement.targetCategories) {
      for (const shift of announcement.shifts) {
        total += announcement.vacancyPerCategoryPerShift[categoryId]?.[shift.id] ?? 0;
      }
    }

    return total;
  }, [announcement]);

  const toggleShift = useCallback((shiftId: string) => {
    setSelectedShifts((previous) =>
      previous.includes(shiftId) ? previous.filter((id) => id !== shiftId) : [...previous, shiftId],
    );
    setErrors([]);
  }, []);

  const handleApply = useCallback(() => {
    if (!staff || !announcement) return;

    const myCategoryInAnnouncement = announcement.targetCategories.find((categoryId) =>
      staff.categories.includes(categoryId),
    );

    if (!myCategoryInAnnouncement) {
      setErrors(["You are not in any of the required categories."]);
      return;
    }

    const result = employeeWorkforceHelpers.apply(
      announcementId,
      myCategoryInAnnouncement,
      selectedShifts,
    );

    if (result.success) {
      setApplied(true);
      setErrors([]);
    } else {
      setErrors(result.errors ?? ["Failed to apply."]);
    }
  }, [announcement, announcementId, selectedShifts, staff]);

  if (!announcement) {
    return (
      <div style={{ padding: "0 16px" }}>
        <DomainHero
          variant="workforce"
          audience="employee"
          icon={
            <button
              type="button"
              className="wm-domainHeroIconBtn"
              onClick={onBack}
              aria-label="Back"
            >
              <IconBack />
            </button>
          }
          title="Announcement not found"
          subtitle="This announcement may have been removed"
          description="Return to Workforce Ops Hub to continue."
        />
      </div>
    );
  }

  return (
    <EmployeeWorkforceAnnounceDetailContent
      announcement={announcement}
      categoryMap={categoryMap}
      totalVacancy={totalVacancy}
      hasConflict={hasConflict}
      applied={applied}
      selectedShifts={selectedShifts}
      errors={errors}
      onBack={onBack}
      onToggleShift={toggleShift}
      onApply={handleApply}
    />
  );
}
