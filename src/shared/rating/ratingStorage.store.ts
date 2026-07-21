import type {
  EmployerRatingSummary,
  EmployerToWorkerRating,
  EmployerWorkerTag,
  RatingDomain,
  WorkerEmployerTag,
  WorkerRatingSummary,
  WorkerToEmployerRating,
} from "./ratingTypes";
import { CHANGED_EVENT, ER_KEY, WR_KEY, newId } from "./ratingStorage.constants";
import { checkEditable, readER, readWR, writeER, writeWR } from "./ratingStorage.cache";
import { normalizeTags, sanitizeRatingComment } from "./ratingStorage.helpers";
import { isPublicReputationDomain } from "./plannerRating.helpers";

function buildWorkerSummary(
  workerMlId: string,
  ratings: EmployerToWorkerRating[],
): WorkerRatingSummary {
  const total = ratings.length;
  const avgStars =
    total > 0 ? Math.round((ratings.reduce((s, r) => s + r.stars, 0) / total) * 10) / 10 : 0;

  const tagCounts = {} as Record<EmployerWorkerTag, number>;
  let hireAgainCount = 0;
  for (const r of ratings) {
    if (r.hireAgain) hireAgainCount++;
    for (const tag of r.tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }

  return {
    workerMlId,
    totalRatings: total,
    averageStars: avgStars,
    tagCounts,
    hireAgainCount,
    hireAgainTotal: total,
    level: "bronze",
    points: 0,
  };
}

function buildEmployerSummary(
  employerMlId: string,
  ratings: WorkerToEmployerRating[],
): EmployerRatingSummary {
  const total = ratings.length;
  const avgStars =
    total > 0 ? Math.round((ratings.reduce((s, r) => s + r.stars, 0) / total) * 10) / 10 : 0;

  const tagCounts = {} as Record<WorkerEmployerTag, number>;
  let workAgainCount = 0;
  for (const r of ratings) {
    if (r.workAgain) workAgainCount++;
    for (const tag of r.tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }

  return {
    employerMlId,
    totalRatings: total,
    averageStars: avgStars,
    tagCounts,
    workAgainCount,
    workAgainTotal: total,
  };
}

export const ratingStorage = {
  subscribe(cb: () => void): () => void {
    const h = () => cb();
    const onStorage = (e: StorageEvent) => {
      if (e.key === ER_KEY || e.key === WR_KEY || e.key === null) cb();
    };
    window.addEventListener(CHANGED_EVENT, h);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CHANGED_EVENT, h);
      window.removeEventListener("storage", onStorage);
    };
  },

  getAllERRatings(): EmployerToWorkerRating[] {
    return readER();
  },
  getAllWRRatings(): WorkerToEmployerRating[] {
    return readWR();
  },

  hasEmployerRatedWorker(employerMlId: string, jobId: string, workerMlId: string): boolean {
    return readER().some(
      (r) => r.employerMlId === employerMlId && r.jobId === jobId && r.workerMlId === workerMlId,
    );
  },

  hasWorkerRatedEmployer(workerMlId: string, jobId: string, employerMlId: string): boolean {
    return readWR().some(
      (r) => r.workerMlId === workerMlId && r.jobId === jobId && r.employerMlId === employerMlId,
    );
  },

  getEmployerRatingForJob(
    employerMlId: string,
    jobId: string,
    workerMlId: string,
  ): EmployerToWorkerRating | null {
    return (
      readER().find(
        (r) => r.employerMlId === employerMlId && r.jobId === jobId && r.workerMlId === workerMlId,
      ) ?? null
    );
  },

  getWorkerRatingForJob(
    workerMlId: string,
    jobId: string,
    employerMlId: string,
  ): WorkerToEmployerRating | null {
    return (
      readWR().find(
        (r) => r.workerMlId === workerMlId && r.jobId === jobId && r.employerMlId === employerMlId,
      ) ?? null
    );
  },

  canEditEmployerRating(employerMlId: string, jobId: string, workerMlId: string): boolean {
    const r = readER().find(
      (x) => x.employerMlId === employerMlId && x.jobId === jobId && x.workerMlId === workerMlId,
    );
    if (!r) return false;
    return checkEditable(r.createdAt, r.editCount).success;
  },

  canEditWorkerRating(workerMlId: string, jobId: string, employerMlId: string): boolean {
    const r = readWR().find(
      (x) => x.workerMlId === workerMlId && x.jobId === jobId && x.employerMlId === employerMlId,
    );
    if (!r) return false;
    return checkEditable(r.createdAt, r.editCount).success;
  },

  saveEmployerRating(
    data: Omit<EmployerToWorkerRating, "id" | "createdAt" | "editedAt" | "editCount">,
  ): EmployerToWorkerRating {
    const existing = readER().find(
      (rating) =>
        rating.employerMlId === data.employerMlId &&
        rating.jobId === data.jobId &&
        rating.workerMlId === data.workerMlId,
    );

    if (existing) return existing;

    const rating: EmployerToWorkerRating = {
      ...data,
      id: newId("er"),
      tags: normalizeTags(data.tags),
      comment: sanitizeRatingComment(data.comment),
      createdAt: Date.now(),
      editedAt: null,
      editCount: 0,
      meta: data.domain === "planner" ? data.meta : undefined,
    };

    writeER([rating, ...readER()]);
    return rating;
  },

  saveWorkerRating(
    data: Omit<WorkerToEmployerRating, "id" | "createdAt" | "editedAt" | "editCount">,
  ): WorkerToEmployerRating {
    const existing = readWR().find(
      (rating) =>
        rating.workerMlId === data.workerMlId &&
        rating.jobId === data.jobId &&
        rating.employerMlId === data.employerMlId,
    );

    if (existing) return existing;

    const rating: WorkerToEmployerRating = {
      ...data,
      id: newId("wr"),
      tags: normalizeTags(data.tags),
      comment: sanitizeRatingComment(data.comment),
      createdAt: Date.now(),
      editedAt: null,
      editCount: 0,
      meta: data.domain === "planner" ? data.meta : undefined,
    };

    writeWR([rating, ...readWR()]);
    return rating;
  },

  editEmployerRating(
    employerMlId: string,
    jobId: string,
    workerMlId: string,
    updates: {
      stars: 1 | 2 | 3 | 4 | 5;
      tags: EmployerWorkerTag[];
      comment?: string;
      hireAgain: boolean;
    },
  ) {
    const list = readER();
    const idx = list.findIndex(
      (r) => r.employerMlId === employerMlId && r.jobId === jobId && r.workerMlId === workerMlId,
    );
    if (idx === -1) return { success: false as const, reason: "Rating not found." };
    const guard = checkEditable(list[idx].createdAt, list[idx].editCount);
    if (!guard.success) return guard;
    const safeUpdates = {
      ...updates,
      tags: normalizeTags(updates.tags),
      comment: sanitizeRatingComment(updates.comment),
    };

    list[idx] = {
      ...list[idx],
      ...safeUpdates,
      editedAt: Date.now(),
      editCount: 1,
    };
    writeER(list);
    return { success: true as const };
  },

  editWorkerRating(
    workerMlId: string,
    jobId: string,
    employerMlId: string,
    updates: {
      stars: 1 | 2 | 3 | 4 | 5;
      tags: WorkerEmployerTag[];
      comment?: string;
      workAgain: boolean;
    },
  ) {
    const list = readWR();
    const idx = list.findIndex(
      (r) => r.workerMlId === workerMlId && r.jobId === jobId && r.employerMlId === employerMlId,
    );
    if (idx === -1) return { success: false as const, reason: "Rating not found." };
    const guard = checkEditable(list[idx].createdAt, list[idx].editCount);
    if (!guard.success) return guard;
    const safeUpdates = {
      ...updates,
      tags: normalizeTags(updates.tags),
      comment: sanitizeRatingComment(updates.comment),
    };

    list[idx] = {
      ...list[idx],
      ...safeUpdates,
      editedAt: Date.now(),
      editCount: 1,
    };
    writeWR(list);
    return { success: true as const };
  },

  getWorkerSummary(workerMlId: string): WorkerRatingSummary {
    const ratings = readER().filter(
      (r) => r.workerMlId === workerMlId && isPublicReputationDomain(r.domain),
    );
    return buildWorkerSummary(workerMlId, ratings);
  },

  /** Domain-scoped worker summary (includes planner when requested). */
  getWorkerSummaryForDomain(workerMlId: string, domain: RatingDomain): WorkerRatingSummary {
    const ratings = readER().filter((r) => r.workerMlId === workerMlId && r.domain === domain);
    return buildWorkerSummary(workerMlId, ratings);
  },

  getEmployerSummary(employerMlId: string): EmployerRatingSummary {
    const ratings = readWR().filter(
      (r) => r.employerMlId === employerMlId && isPublicReputationDomain(r.domain),
    );
    return buildEmployerSummary(employerMlId, ratings);
  },

  getEmployerSummaryForDomain(employerMlId: string, domain: RatingDomain): EmployerRatingSummary {
    const ratings = readWR().filter((r) => r.employerMlId === employerMlId && r.domain === domain);
    return buildEmployerSummary(employerMlId, ratings);
  },

  _erKey: ER_KEY,
  _wrKey: WR_KEY,
  _event: CHANGED_EVENT,
} as const;
