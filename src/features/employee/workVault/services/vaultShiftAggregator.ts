// App name: Job Mitra
// File name: vaultShiftAggregator.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\services\vaultShiftAggregator.ts

import { ratingStorage } from "../../../../shared/rating/ratingStorage";
import { employeeProfileStorage } from "../../../employee/profile/storage/employeeProfile.storage";
import { getVaultShiftHistoryForWorker } from "../storage/vaultShiftHistory.storage";
import type { VaultReference } from "../types/vaultProfileTypes";

const SHIFT_POSTS_KEY = "wm_employer_shift_posts_v1";
const SHIFT_WORKSPACES_KEY = "wm_employee_shift_workspaces_v1";

type Rec = Record<string, unknown>;

function parse<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? (arr as T[]) : [];
  } catch {
    return [];
  }
}

function str(r: Rec, k: string): string {
  const v = r[k];
  return typeof v === "string" ? v : "";
}

function getCurrentWorkerWmId(): string {
  return employeeProfileStorage.get().uniqueId?.trim() || "";
}

function getShiftPostMap(): Map<string, Rec> {
  const posts = parse<Rec>(SHIFT_POSTS_KEY);
  const map = new Map<string, Rec>();

  for (const post of posts) {
    const id = str(post, "id");
    if (id) map.set(id, post);
  }

  return map;
}

export function aggregateShiftStats(): {
  totalShiftsCompleted: number;
  uniqueCompanies: string[];
} {
  const workerWmId = getCurrentWorkerWmId();
  const history = workerWmId ? getVaultShiftHistoryForWorker(workerWmId) : [];
  const finalizedHistory = history.filter((entry) => entry.vaultFinalized);

  if (finalizedHistory.length > 0) {
    const companies = new Set<string>();
    for (const entry of finalizedHistory) {
      const name = entry.companyName.toLowerCase().trim();
      if (name) companies.add(name);
    }

    return {
      totalShiftsCompleted: finalizedHistory.length,
      uniqueCompanies: Array.from(companies),
    };
  }

  const workspaces = parse<Rec>(SHIFT_WORKSPACES_KEY);

  const completed = workspaces.filter((workspace) => str(workspace, "status") === "completed");

  const companies = new Set<string>();
  for (const workspace of completed) {
    const name = str(workspace, "companyName").toLowerCase().trim();
    if (name) companies.add(name);
  }

  return {
    totalShiftsCompleted: completed.length,
    uniqueCompanies: Array.from(companies),
  };
}

export function aggregateShiftRatings(): {
  ratings: number[];
  ratedCompanies: { companyName: string; rating: number }[];
} {
  const workerWmId = getCurrentWorkerWmId();
  if (!workerWmId) {
    return { ratings: [], ratedCompanies: [] };
  }

  const postMap = getShiftPostMap();

  const workerRatings = ratingStorage
    .getAllERRatings()
    .filter((rating) => rating.domain === "shift" && rating.workerWmId === workerWmId);

  const ratings = workerRatings.map((rating) => rating.stars);

  const ratedCompanies = workerRatings.map((rating) => {
    const post = postMap.get(rating.jobId);
    return {
      companyName: post ? str(post, "companyName") || "Employer" : "Employer",
      rating: rating.stars,
    };
  });

  return { ratings, ratedCompanies };
}

export function aggregateShiftReferences(): VaultReference[] {
  const workerWmId = getCurrentWorkerWmId();
  if (!workerWmId) return [];

  const historyRefs = getVaultShiftHistoryForWorker(workerWmId)
    .filter((entry) => entry.vaultFinalized)
    .map((entry): VaultReference => ({
      companyName: entry.companyName,
      rating: entry.employerRating ?? entry.workerRating ?? 0,
      source: "shift",
      jobId: entry.postId,
      jobTitle: entry.jobTitle,
      createdAt: entry.finalizedAt ?? entry.completedAt,
    }));

  if (historyRefs.length > 0) {
    return historyRefs;
  }

  const postMap = getShiftPostMap();

  return ratingStorage
    .getAllERRatings()
    .filter((rating) => rating.domain === "shift" && rating.workerWmId === workerWmId)
    .map((rating): VaultReference => {
      const post = postMap.get(rating.jobId);
      const companyName = post ? str(post, "companyName") || "Employer" : "Employer";
      const jobTitle = post ? str(post, "jobName") || "Shift work" : "Shift work";

      return {
        companyName,
        rating: rating.stars,
        source: "shift",
        jobId: rating.jobId,
        jobTitle,
        comment: rating.comment,
        tags: rating.tags,
        hireAgain: rating.hireAgain,
        createdAt: rating.createdAt,
        editedAt: rating.editedAt,
      };
    });
}
