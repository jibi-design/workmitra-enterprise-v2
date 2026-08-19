/**
 * QA Stress — seed 50 mock candidates into favorites + availability pool.
 * DEV / test only. Live: God Mode → "Seed 50 QA Candidates".
 */

import {
  getRolling7Days,
  toIsoDate,
} from "../../employee/shiftJobs/storage/availabilityStorage.helpers";
import type { AvailabilityBroadcast } from "../../employee/shiftJobs/storage/availabilityStorage.types";
import type { FavoriteWorker } from "../../employer/shiftJobs/storage/favoritesStorage";
import type { ShiftPost } from "../../employer/shiftJobs/storage/employerShift.types";
import { employeeProfileStorage } from "../../employee/profile/storage/employeeProfile.storage";
import { employerSettingsStorage } from "../../employer/company/storage/employerSettings.storage";
import { upsertSiteMembershipTruth } from "../../shiftOps/storage/siteMembershipTruth.storage";
import {
  resolveShiftEmployerScopedKey,
  getShiftEmployerScopeId,
  shiftEmployerScopedKey,
} from "./shiftEmployerScope";
import { LEGACY_GLOBAL_INVITES_KEY, WORKER_INVITES_PROJECTION_KEY } from "./shiftTenantProjection";

export const QA_BULK_COUNT = 100;
export const QA_BULK_PREFIX = "ML_QA_BULK_";
export const QA_BULK_POST_ID = "qa_bulk_stress_post_1";
export const QA_BULK_SITE_ID = "bbbbbbbb-cccc-4ddd-8eee-ffffffffffff";

const ALL_KEY = "wm_all_availability_broadcasts_v1";
const SEARCH_KEY = "wm_employee_shift_search_v1";

const CITIES = ["City A", "City B", "City C", "City D", "City E", "", "City A"] as const;

function qaWorkerLabel(index1Based: number): string {
  return `Worker ${index1Based}`;
}

export type QaBulkSeedResult = {
  favoriteCount: number;
  poolCount: number;
  availableInRollingWeek: number;
  worker25: string;
  worker50: string;
  postId: string;
  sampleIso: string;
};

export function qaBulkWorkerId(index1Based: number): string {
  return `${QA_BULK_PREFIX}${String(index1Based).padStart(2, "0")}`;
}

export function buildQaBulkFavorites(count = QA_BULK_COUNT): FavoriteWorker[] {
  const now = Date.now();
  const list: FavoriteWorker[] = [];

  for (let i = 1; i <= count; i += 1) {
    const workerMlId = qaBulkWorkerId(i);
    list.push({
      id: `fav_qa_bulk_${i}`,
      workerMlId,
      workerName: qaWorkerLabel(i),
      shiftsWorked: i % 5,
      avgStars: i % 7 === 0 ? 4.5 : i % 3 === 0 ? 3 : 0,
      addedAt: now - i * 1000,
      addedVia: i % 4 === 0 ? "hire_again_rating" : "manual",
      jobTitle: i % 4 === 0 ? "Warehouse Helper" : undefined,
    });
  }

  return list;
}

export function buildQaBulkAvailabilityPool(count = QA_BULK_COUNT): AvailabilityBroadcast[] {
  const rolling = getRolling7Days();
  const day0 = rolling[0]?.iso ?? toIsoDate(new Date());
  const day1 = rolling[1]?.iso ?? day0;
  const day2 = rolling[2]?.iso ?? day1;
  const day3 = rolling[3]?.iso ?? day2;
  const now = Date.now();
  const expiresAt = now + 8 * 86_400_000;

  const pool: AvailabilityBroadcast[] = [];

  for (let i = 1; i <= count; i += 1) {
    // ~10% offline (no broadcast) to stress partial coverage
    if (i % 10 === 0) continue;

    const city = CITIES[(i - 1) % CITIES.length];
    let selectedDates: string[];
    if (i % 5 === 1) selectedDates = [day0, day1];
    else if (i % 5 === 2) selectedDates = [day1];
    else if (i % 5 === 3) selectedDates = [day2, day3];
    else selectedDates = [day1, day2];

    pool.push({
      workerMlId: qaBulkWorkerId(i),
      workerName: qaWorkerLabel(i),
      selectedDates,
      broadcastAt: now - i * 500,
      expiresAt,
      city: city || undefined,
      category: i % 2 === 0 ? "warehouse" : "general",
      basePincode: "670001",
      commuteRadius: 15,
    });
  }

  return pool;
}

export function buildQaBulkActivePost(startIso?: string): ShiftPost {
  const rolling = getRolling7Days();
  const iso = startIso ?? rolling[1]?.iso ?? toIsoDate(new Date());
  const [y, m, d] = iso.split("-").map(Number);
  const startAt = new Date(y, m - 1, d, 9, 0, 0, 0).getTime();
  const endAt = startAt + 8 * 3_600_000;

  return {
    id: QA_BULK_POST_ID,
    companyName: "QA Bulk Stress Co",
    jobName: "Bulk Warehouse Shift",
    category: "warehouse",
    experience: "fresher_ok",
    payPerDay: 950,
    locationName: "City A",
    locationPincode: "670001",
    distanceKm: 3,
    startAt,
    endAt,
    mustHave: [],
    goodToHave: [],
    vacancies: 10,
    waitingBuffer: 2,
    analysisStatus: "not_started",
    confirmedIds: [],
    shortlistIds: [],
    waitingIds: [],
    rejectedIds: [],
    status: "active",
    siteId: QA_BULK_SITE_ID,
    settings: {
      backupSlots: 2,
      autoPromoteBackup: false,
      notifyBackup: false,
    },
  };
}

/** Apply seed into localStorage + dispatch change events (browser only). */
export function applyQaBulkCandidateSeed(count = QA_BULK_COUNT): QaBulkSeedResult {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    throw new Error("applyQaBulkCandidateSeed requires a browser localStorage environment");
  }

  const favorites = buildQaBulkFavorites(count);
  const pool = buildQaBulkAvailabilityPool(count);
  const post = buildQaBulkActivePost();
  const sampleIso = getRolling7Days()[1]?.iso ?? toIsoDate(new Date());
  const favKey = resolveShiftEmployerScopedKey("shift_favorites_v1");
  const postsKey = resolveShiftEmployerScopedKey("shift_posts_v1");
  const activeScopeIsMultiEmp = favKey.includes("ML_QA_EMP_");

  // Shared availability pool only — do not auto-enable QA debug overlays.
  localStorage.setItem(ALL_KEY, JSON.stringify(pool));
  localStorage.removeItem("wm_debug_availability_sync");
  employerSettingsStorage.savePartial({ locationPincode: "670001", locationCity: "City A" });

  if (!activeScopeIsMultiEmp) {
    // Single-employer QA path — safe to write favorites/posts/search for this scope.
    localStorage.setItem(favKey, JSON.stringify(favorites));
    localStorage.setItem(postsKey, JSON.stringify([post]));
    localStorage.setItem(SEARCH_KEY, JSON.stringify([post]));
    window.dispatchEvent(new Event("wm:employer-shift-favorites-changed"));
    window.dispatchEvent(new Event("wm:employer-shift-posts-changed"));
    window.dispatchEvent(new Event("wm:employee-shift-search-changed"));
  }
  // If a multi-employer scope is active, preserve keyed tenant favorites/posts/search.

  window.dispatchEvent(new Event("wm:availability-broadcasts-changed"));

  return {
    favoriteCount: activeScopeIsMultiEmp
      ? (() => {
          try {
            const raw = localStorage.getItem(favKey);
            const parsed = raw ? (JSON.parse(raw) as unknown) : [];
            return Array.isArray(parsed) ? parsed.length : favorites.length;
          } catch {
            return favorites.length;
          }
        })()
      : favorites.length,
    poolCount: pool.length,
    availableInRollingWeek: pool.length,
    worker25: qaBulkWorkerId(25),
    worker50: qaBulkWorkerId(50),
    postId: post.id,
    sampleIso,
  };
}

/**
 * Switch sealed employee identity to a bulk QA worker (PII-safe).
 * Required so actorMatchKeys / pending invites / pulse consume resolve correctly.
 */
export function assumeQaBulkWorkerProfile(index1Based: number): {
  workerMlId: string;
  workerName: string;
} {
  const workerMlId = qaBulkWorkerId(index1Based);
  const workerName = qaWorkerLabel(index1Based);
  const city = CITIES[(index1Based - 1) % CITIES.length] || "City A";
  const existing = employeeProfileStorage.get();

  employeeProfileStorage.set({
    ...existing,
    uniqueId: workerMlId,
    fullName: workerName,
    city,
    basePincode: "670001",
    commuteRadius: 15,
    skills: ["warehouse", "lifting", "packing", "inventory"].slice(0, 2 + (index1Based % 3)),
    experience: index1Based % 3 === 0 ? "1-3" : "fresher",
    languages: ["English", "Malayalam"],
    preferShiftJobs: true,
    preferCareerJobs: false,
  });

  upsertSiteMembershipTruth({
    siteId: QA_BULK_SITE_ID,
    workerMlId,
    membershipId: `mem_qa_bulk_${index1Based}`,
    status: "active",
  });

  // Ensure a pending invite exists for #25 live accept tests when seed post is present.
  if (index1Based === 25) {
    try {
      const scopeId = getShiftEmployerScopeId();
      const projectionKey = WORKER_INVITES_PROJECTION_KEY;
      const scopedKey = shiftEmployerScopedKey("shift_direct_invites_v1", scopeId);
      const raw = localStorage.getItem(projectionKey);
      const list = raw ? (JSON.parse(raw) as Array<Record<string, unknown>>) : [];
      const hasPending = Array.isArray(list)
        ? list.some(
            (item) =>
              String(item.workerMlId ?? "").toUpperCase() === workerMlId &&
              item.status === "pending" &&
              item.postId === QA_BULK_POST_ID,
          )
        : false;
      if (!hasPending) {
        const invite = {
          id: `sdi_qa_bulk_${index1Based}_${Date.now().toString(36)}`,
          postId: QA_BULK_POST_ID,
          workerMlId,
          workerName,
          companyName: "QA Bulk Stress Co",
          jobName: "Bulk Warehouse Shift",
          sentAt: Date.now(),
          status: "pending" as const,
          employerScopeId: scopeId,
        };
        const next = [
          invite,
          ...(Array.isArray(list)
            ? list.map((item) =>
                String(item.workerMlId ?? "").toUpperCase() === workerMlId &&
                item.postId === QA_BULK_POST_ID &&
                item.status === "pending"
                  ? { ...item, status: "expired" }
                  : item,
              )
            : []),
        ];
        localStorage.setItem(projectionKey, JSON.stringify(next.slice(0, 300)));
        localStorage.setItem(
          scopedKey,
          JSON.stringify(next.filter((i) => i.postId === QA_BULK_POST_ID).slice(0, 300)),
        );
        try {
          localStorage.removeItem(LEGACY_GLOBAL_INVITES_KEY);
        } catch {
          /* safe */
        }
        window.dispatchEvent(new Event("wm:shift-direct-invites-changed"));
      }
    } catch {
      /* safe */
    }
  }

  return { workerMlId, workerName };
}
