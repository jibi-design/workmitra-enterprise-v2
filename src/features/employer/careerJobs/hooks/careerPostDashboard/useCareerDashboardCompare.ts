// App name: Job Mitra
// File name: useCareerDashboardCompare.ts
// C-CMP-1: session-scoped compare selection (survives refresh; clears on cancel/close).

import { useCallback, useMemo, useState } from "react";
import type { ComparableApplicant } from "../../../../../shared/components/CompareApplicantsModal";
import type { CareerApplication, CareerJobPost } from "../../types/careerTypes";

type UseCareerDashboardCompareArgs = {
  apps: CareerApplication[];
  post: CareerJobPost | null;
};

const COMPARE_KEY_PREFIX = "jm_employer_career_compare_ids_";

function compareStorageKey(postId: string): string {
  return `${COMPARE_KEY_PREFIX}${postId}`;
}

function readStoredCompareIds(postId: string | undefined): Set<string> {
  if (!postId || typeof sessionStorage === "undefined") return new Set();

  try {
    const raw = sessionStorage.getItem(compareStorageKey(postId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(
      parsed
        .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
        .slice(0, 3),
    );
  } catch {
    return new Set();
  }
}

function writeStoredCompareIds(postId: string | undefined, ids: Set<string>): void {
  if (!postId || typeof sessionStorage === "undefined") return;

  try {
    const key = compareStorageKey(postId);
    if (ids.size === 0) {
      sessionStorage.removeItem(key);
      return;
    }
    sessionStorage.setItem(key, JSON.stringify(Array.from(ids)));
  } catch {
    /* demo-safe */
  }
}

type CompareBucket = {
  postId: string | undefined;
  ids: Set<string>;
  mode: boolean;
  open: boolean;
};

export function useCareerDashboardCompare({ apps, post }: UseCareerDashboardCompareArgs) {
  const postId = post?.id;
  const [bucket, setBucket] = useState<CompareBucket>(() => {
    const ids = readStoredCompareIds(postId);
    return { postId, ids, mode: ids.size > 0, open: false };
  });

  const compareIds = bucket.postId === postId ? bucket.ids : readStoredCompareIds(postId);
  const compareMode = bucket.postId === postId ? bucket.mode : compareIds.size > 0;
  const compareOpen = bucket.postId === postId ? bucket.open : false;

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

  const persistIds = useCallback(
    (next: Set<string>, extras?: Partial<Pick<CompareBucket, "mode" | "open">>) => {
      writeStoredCompareIds(postId, next);
      setBucket({
        postId,
        ids: next,
        mode: extras?.mode ?? next.size > 0,
        open: extras?.open ?? false,
      });
    },
    [postId],
  );

  const startCompareMode = useCallback(() => {
    setBucket((current) => {
      const ids = current.postId === postId ? current.ids : readStoredCompareIds(postId);
      return { postId, ids, mode: true, open: current.postId === postId ? current.open : false };
    });
  }, [postId]);

  const cancelCompareMode = useCallback(() => {
    persistIds(new Set(), { mode: false, open: false });
  }, [persistIds]);

  const openCompare = useCallback(() => {
    setBucket((current) => {
      const ids = current.postId === postId ? current.ids : readStoredCompareIds(postId);
      return { postId, ids, mode: true, open: true };
    });
  }, [postId]);

  const closeCompare = useCallback(() => {
    persistIds(new Set(), { mode: false, open: false });
  }, [persistIds]);

  const toggleCompare = useCallback(
    (appId: string) => {
      setBucket((current) => {
        const base = current.postId === postId ? current.ids : readStoredCompareIds(postId);
        const next = new Set(base);

        if (next.has(appId)) {
          next.delete(appId);
        } else if (next.size < 3) {
          next.add(appId);
        }

        writeStoredCompareIds(postId, next);
        return {
          postId,
          ids: next,
          mode: true,
          open: current.postId === postId ? current.open : false,
        };
      });
    },
    [postId],
  );

  return {
    compareIds,
    compareOpen,
    compareMode,
    compareApplicants,
    setCompareOpen: (open: boolean) => {
      setBucket((current) => {
        const ids = current.postId === postId ? current.ids : readStoredCompareIds(postId);
        return { postId, ids, mode: current.postId === postId ? current.mode : ids.size > 0, open };
      });
    },
    startCompareMode,
    cancelCompareMode,
    openCompare,
    closeCompare,
    toggleCompare,
  };
}
