/**
 * Job Mitra | vaultPlannerAggregator.ts
 * Hybrid A2 P1.4/P1.5 — Long-term staffing / Gig Projects vault branch
 *
 * Board rule: planner milestone ratings must NOT dilute single-day shift averages.
 * This aggregator exposes separate stats + references with source "planner".
 */

import { ratingStorage } from "../../../../shared/rating/ratingStorage";
import { employeeProfileStorage } from "../../../employee/profile/storage/employeeProfile.storage";
import {
  getVaultPlannerHistoryForWorker,
  type VaultPlannerHistoryEntry,
} from "../storage/vaultPlannerHistory.storage";
import type { VaultPlannerTimelineEntry, VaultReference } from "../types/vaultProfileTypes";

function getCurrentWorkerMlId(): string {
  return employeeProfileStorage.get().uniqueId?.trim() || "";
}

export function aggregatePlannerStats(): {
  totalPlannerEpochs: number;
  totalPlannerEpochsFinalized: number;
  totalPlannerPlans: number;
  uniqueCompanies: string[];
} {
  const workerMlId = getCurrentWorkerMlId();
  const history = workerMlId ? getVaultPlannerHistoryForWorker(workerMlId) : [];
  const finalized = history.filter((entry) => entry.vaultFinalized);
  const companies = new Set<string>();
  const plans = new Set<string>();

  for (const entry of finalized.length > 0 ? finalized : history) {
    const name = entry.companyName.toLowerCase().trim();
    if (name) companies.add(name);
    if (entry.planId) plans.add(entry.planId);
  }

  return {
    totalPlannerEpochs: history.length,
    totalPlannerEpochsFinalized: finalized.length,
    totalPlannerPlans: plans.size,
    uniqueCompanies: Array.from(companies),
  };
}

export function aggregatePlannerRatings(): {
  ratings: number[];
  ratedCompanies: { companyName: string; rating: number }[];
} {
  const workerMlId = getCurrentWorkerMlId();
  if (!workerMlId) return { ratings: [], ratedCompanies: [] };

  const ledger = ratingStorage
    .getAllERRatings()
    .filter((rating) => rating.domain === "planner" && rating.workerMlId === workerMlId);

  if (ledger.length > 0) {
    const history = getVaultPlannerHistoryForWorker(workerMlId);
    return {
      ratings: ledger.map((r) => r.stars),
      ratedCompanies: ledger.map((r) => {
        const planId = r.meta?.rosterPlanId;
        const match = history.find((h) => h.planId === planId);
        return {
          companyName: match?.companyName ?? (planId ? `Plan ${planId}` : "Employer"),
          rating: r.stars,
        };
      }),
    };
  }

  const history = getVaultPlannerHistoryForWorker(workerMlId).filter(
    (entry) => entry.vaultFinalized,
  );

  const ratings: number[] = [];
  const ratedCompanies: { companyName: string; rating: number }[] = [];

  for (const entry of history) {
    const stars = entry.employerRating ?? entry.employeeRating;
    if (typeof stars !== "number" || stars <= 0) continue;
    ratings.push(stars);
    ratedCompanies.push({ companyName: entry.companyName, rating: stars });
  }

  return { ratings, ratedCompanies };
}

/** Prefer finalized epochs; fall back to latest open milestones for display. */
export function aggregatePlannerReferences(): VaultReference[] {
  const workerMlId = getCurrentWorkerMlId();
  if (!workerMlId) return [];

  const ledgerRefs = ratingStorage
    .getAllERRatings()
    .filter((rating) => rating.domain === "planner" && rating.workerMlId === workerMlId)
    .map((rating): VaultReference => {
      const planId = rating.meta?.rosterPlanId;
      const match = getVaultPlannerHistoryForWorker(workerMlId).find((h) => h.planId === planId);
      return {
        companyName: match?.companyName ?? (planId ? `Plan ${planId}` : "Gig Project employer"),
        rating: rating.stars,
        source: "planner",
        jobId: rating.jobId,
        jobTitle: match
          ? `${match.planName} · Epoch ${(rating.meta?.epochIndex ?? 0) + 1}`
          : `Epoch ${(rating.meta?.epochIndex ?? 0) + 1}`,
        comment: rating.comment,
        tags: rating.tags,
        hireAgain: rating.hireAgain,
        createdAt: rating.createdAt,
        editedAt: rating.editedAt,
      };
    });

  if (ledgerRefs.length > 0) return ledgerRefs;

  const history = getVaultPlannerHistoryForWorker(workerMlId);
  const finalized = history.filter((entry) => entry.vaultFinalized);
  const source = finalized.length > 0 ? finalized : history;

  return source
    .filter((entry) => {
      const stars = entry.employerRating ?? entry.employeeRating;
      return typeof stars === "number" && stars > 0;
    })
    .map((entry): VaultReference => {
      const stars = (entry.employerRating ?? entry.employeeRating ?? 0) as number;
      return {
        companyName: entry.companyName,
        rating: stars,
        source: "planner",
        jobId: entry.planId,
        jobTitle: `${entry.planName} · Epoch ${entry.epochIndex + 1}`,
        createdAt: entry.finalizedAt ?? entry.completedAt,
      };
    });
}

export function aggregatePlannerAttendanceRate(): number | null {
  const workerMlId = getCurrentWorkerMlId();
  if (!workerMlId) return null;
  const history = getVaultPlannerHistoryForWorker(workerMlId);
  if (history.length === 0) return null;
  const sum = history.reduce((acc, entry) => acc + entry.attendanceRate, 0);
  return Math.round(sum / history.length);
}

export function aggregatePlannerReliabilityScore(): number | null {
  const workerMlId = getCurrentWorkerMlId();
  if (!workerMlId) return null;
  const history = getVaultPlannerHistoryForWorker(workerMlId);
  if (history.length === 0) return null;
  const sum = history.reduce((acc, entry) => acc + entry.reliabilityScore, 0);
  return Math.round(sum / history.length);
}

/** Newest-first epoch timeline for Profile Planner Growth section. */
export function aggregatePlannerTimeline(): VaultPlannerTimelineEntry[] {
  const workerMlId = getCurrentWorkerMlId();
  if (!workerMlId) return [];

  return getVaultPlannerHistoryForWorker(workerMlId)
    .slice()
    .sort((a, b) => b.completedAt - a.completedAt)
    .map((entry) => {
      const rating =
        typeof entry.employerRating === "number" && entry.employerRating > 0
          ? entry.employerRating
          : typeof entry.employeeRating === "number" && entry.employeeRating > 0
            ? entry.employeeRating
            : null;

      return {
        id: entry.id,
        planId: entry.planId,
        planName: entry.planName,
        companyName: entry.companyName,
        epochIndex: entry.epochIndex,
        epochStart: entry.epochStart,
        epochEnd: entry.epochEnd,
        daysScheduled: entry.daysScheduled,
        daysCompleted: entry.daysCompleted,
        attendanceRate: entry.attendanceRate,
        reliabilityScore: entry.reliabilityScore,
        vaultFinalized: entry.vaultFinalized,
        rating,
        completedAt: entry.completedAt,
      };
    });
}

export type { VaultPlannerHistoryEntry };
