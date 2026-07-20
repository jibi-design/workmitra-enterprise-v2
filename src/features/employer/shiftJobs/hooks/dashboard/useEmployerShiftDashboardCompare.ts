// App name: Job Mitra
// File name: useEmployerShiftDashboardCompare.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\hooks\dashboard\useEmployerShiftDashboardCompare.ts

import { useMemo, useState } from "react";
import type { ComparableApplicant } from "../../../../../shared/components/CompareApplicantsModal";
import type { EmployeeShiftApplication, ShiftPost } from "../../storage/employerShift.storage";

type UseEmployerShiftDashboardCompareInput = {
  readonly apps: readonly EmployeeShiftApplication[];
  readonly post: ShiftPost | null;
};

export function useEmployerShiftDashboardCompare({
  apps,
  post,
}: UseEmployerShiftDashboardCompareInput) {
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);

  const compareApplicants = useMemo(
    () =>
      apps
        .filter((application) => compareIds.has(application.id))
        .map((application): ComparableApplicant => ({
          id: application.id,
          name:
            application.profileSnapshot?.fullName ??
            `Worker ${application.id.slice(-4).toUpperCase()}`,
          wmId: application.profileSnapshot?.uniqueId ?? "",
          appliedAt: application.createdAt ?? 0,
          status: application.status,
          skills: application.profileSnapshot?.skills ?? [],
          experience: application.profileSnapshot?.experience,
          requiredSkills: post?.mustHave ?? [],
        })),
    [apps, compareIds, post],
  );

  function toggleCompare(appId: string) {
    setCompareIds((current) => {
      const next = new Set(current);

      if (next.has(appId)) {
        next.delete(appId);
        return next;
      }

      if (next.size < 3) {
        next.add(appId);
      }

      return next;
    });
  }

  return {
    compareIds,
    compareOpen,
    setCompareOpen,
    compareApplicants,
    toggleCompare,
  };
}
