// App name: Job Mitra
// File name: useCareerDashboardCompare.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\hooks\careerPostDashboard\useCareerDashboardCompare.ts

import { useCallback, useMemo, useState } from "react";
import type { ComparableApplicant } from "../../../../../shared/components/CompareApplicantsModal";
import type { CareerApplication, CareerJobPost } from "../../types/careerTypes";

type UseCareerDashboardCompareArgs = {
  apps: CareerApplication[];
  post: CareerJobPost | null;
};

export function useCareerDashboardCompare({ apps, post }: UseCareerDashboardCompareArgs) {
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);

  const compareApplicants = useMemo(
    () =>
      apps
        .filter((app) => compareIds.has(app.id))
        .map((app): ComparableApplicant => ({
          id: app.id,
          name: app.employeeName || app.profileSnapshot?.fullName || "Candidate",
          wmId: app.employeeId ?? app.profileSnapshot?.uniqueId ?? "",
          appliedAt: app.appliedAt,
          status: app.stage,
          skills: app.profileSnapshot?.skills ?? [],
          experience: app.profileSnapshot?.experience,
          requiredSkills: post?.skills ?? [],
        })),
    [apps, compareIds, post],
  );

  const startCompareMode = useCallback(() => {
    setCompareMode(true);
  }, []);

  const cancelCompareMode = useCallback(() => {
    setCompareMode(false);
    setCompareOpen(false);
    setCompareIds(new Set());
  }, []);

  const openCompare = useCallback(() => {
    setCompareOpen(true);
  }, []);

  const closeCompare = useCallback(() => {
    setCompareOpen(false);
    setCompareMode(false);
    setCompareIds(new Set());
  }, []);

  const toggleCompare = useCallback((appId: string) => {
    setCompareMode(true);

    setCompareIds((current) => {
      const next = new Set(current);

      if (next.has(appId)) {
        next.delete(appId);
      } else if (next.size < 3) {
        next.add(appId);
      }

      return next;
    });
  }, []);

  return {
    compareIds,
    compareOpen,
    compareMode,
    compareApplicants,
    setCompareOpen,
    startCompareMode,
    cancelCompareMode,
    openCompare,
    closeCompare,
    toggleCompare,
  };
}
