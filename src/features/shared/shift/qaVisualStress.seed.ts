/**
 * Visual Stress E2E seed — 100+ employers × 100 apps each (≥10,500).
 * Quota-aware: clears LS, skips ultra-heavy/favorites bloat, compact app records.
 * DEV / Playwright only.
 */

import {
  assumeQaMultiEmployer,
  qaMultiEmployerId,
  QA_MULTI_EMPLOYER_COUNT,
  QA_MULTI_EMPLOYER_REGISTRY_KEY,
} from "./qaMultiEmployer.seed";
import { applyQaBulkCandidateSeed, qaBulkWorkerId, QA_BULK_COUNT } from "./qaBulkCandidates.seed";
import { sanitizeShiftEmployerScopeId, shiftEmployerScopedKey } from "./shiftEmployerScope";
import { WORKER_APPS_PROJECTION_KEY } from "./shiftTenantProjection";
import { sanitizeVaultWorkerScopeId, vaultWorkerScopedKey } from "../workVault/vaultWorkerScope";
import { roleStorage } from "../../../app/storage/roleStorage";

export const VISUAL_STRESS_APPS_PER_EMPLOYER = 100;
export const VISUAL_STRESS_EMPLOYER_COUNT = QA_MULTI_EMPLOYER_COUNT;

const STATUS_CYCLE = [
  "applied",
  "applied",
  "applied",
  "shortlisted",
  "waiting",
  "confirmed",
  "confirmed",
  "rejected",
] as const;

export type VisualStressSeedResult = {
  employers: number;
  appsPerEmployer: number;
  totalApplications: number;
  scopedAppKeys: number;
  vaultWorkersTouched: number;
  sampleEmployerId: string;
  samplePostId: string;
  pulseEventsQueued: number;
  quotaTrimmedEmployers: number;
};

function workerName(i: number): string {
  return `W${i}`;
}

function safeSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function writeWorkerVaultStub(workerMlId: string, now: number): void {
  const scope = sanitizeVaultWorkerScopeId(workerMlId);
  const foldersKey = vaultWorkerScopedKey("folders_v1", scope);
  const docsKey = vaultWorkerScopedKey("documents_v1", scope);
  safeSet(
    foldersKey,
    JSON.stringify([{ id: `vf_${scope}`, name: "Shared", visibility: "visible", createdAt: now }]),
  );
  safeSet(`${foldersKey}__migrated_v1`, "1");
  safeSet(
    docsKey,
    JSON.stringify([
      {
        id: `vd_${scope}`,
        folderId: `vf_${scope}`,
        name: "ID",
        fileType: "image",
        uploadedAt: now,
        visibility: "visible",
      },
    ]),
  );
  safeSet(`${docsKey}__migrated_v1`, "1");
}

function queueShiftPulseEvents(samplePostId: string, sampleAppId: string): number {
  const queueKey = "wm_pulse_event_queue_v1";
  const now = Date.now();
  const events = [
    {
      id: `vs_p_app_${now}`,
      type: "SHIFT_APPLICATION_RECEIVED",
      domain: "shift",
      affectedUserRole: "employer",
      postId: samplePostId,
      appId: sampleAppId,
      severity: "urgent",
      title: "New shift application",
      body: "Visual stress pending applicant.",
      createdAt: now,
    },
    {
      id: `vs_p_cf_${now}`,
      type: "SHIFT_CONFIRMATION_REQUIRED",
      domain: "shift",
      affectedUserRole: "employee",
      postId: samplePostId,
      appId: sampleAppId,
      severity: "urgent",
      title: "Confirmation required",
      body: "Visual stress confirmed slot.",
      createdAt: now,
    },
  ];
  safeSet(queueKey, JSON.stringify(events));
  window.dispatchEvent(new Event("wm:pulse-event-queue-changed"));
  return events.length;
}

function slimPost(emp: number, now: number) {
  const startAt = now + 86_400_000 + (emp % 5) * 86_400_000;
  return {
    id: `qa_mt_post_${emp}`,
    companyName: `QA Emp #${emp}`,
    jobName: `VS Shift #${emp}`,
    category: "other",
    experience: "fresher_ok",
    payPerDay: 900 + (emp % 20) * 10,
    locationName: "Kochi",
    distanceKm: 3,
    startAt,
    endAt: startAt + 8 * 3_600_000,
    description: `VS TENANT ${qaMultiEmployerId(emp)}`,
    mustHave: ["packing"],
    goodToHave: ["punctual"],
    vacancies: 5,
    waitingBuffer: 1,
    analysisStatus: "done",
    confirmedIds: [] as string[],
    shortlistIds: [] as string[],
    waitingIds: [] as string[],
    rejectedIds: [] as string[],
    status: "active",
    settings: { backupSlots: 1, autoPromoteBackup: false, notifyBackup: false },
  };
}

/**
 * Quota-safe visual stress seed (≥10k apps across 100+ employers).
 */
export function applyVisualStressSeed(
  employerCount = VISUAL_STRESS_EMPLOYER_COUNT,
  appsPerEmployer = VISUAL_STRESS_APPS_PER_EMPLOYER,
): VisualStressSeedResult {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    throw new Error("applyVisualStressSeed requires browser localStorage");
  }

  const safeEmployers = Math.max(1, Math.min(employerCount, QA_MULTI_EMPLOYER_COUNT));
  const safeApps = Math.max(1, Math.min(appsPerEmployer, QA_BULK_COUNT));
  const now = Date.now();

  // Hard reset — prior ultra-heavy / multi seeds blow the 5MB quota.
  try {
    localStorage.clear();
  } catch {
    /* continue */
  }

  // Candidate pool (availability + profiles) — needed for Smart Match / assume worker.
  applyQaBulkCandidateSeed(QA_BULK_COUNT);

  const registry: Array<{ id: string; companyName: string; favoriteCount: number }> = [];
  const searchPosts: ReturnType<typeof slimPost>[] = [];
  const workerProjection: Record<string, unknown>[] = [];

  let totalApplications = 0;
  let scopedAppKeys = 0;
  let quotaTrimmedEmployers = 0;

  for (let emp = 1; emp <= safeEmployers; emp += 1) {
    const id = qaMultiEmployerId(emp);
    const scopeId = sanitizeShiftEmployerScopeId(id);
    const post = slimPost(emp, now);
    searchPosts.push(post);

    // Tiny favorites (3) — enough for UI, avoids 55×105 bloat.
    const favorites = [1, 25, 50].map((w) => ({
      id: `f_${emp}_${w}`,
      workerMlId: qaBulkWorkerId(w),
      workerName: workerName(w),
      shiftsWorked: 1,
      avgStars: 4,
      addedAt: now,
      addedVia: "manual" as const,
    }));

    const postsKey = shiftEmployerScopedKey("shift_posts_v1", scopeId);
    const favKey = shiftEmployerScopedKey("shift_favorites_v1", scopeId);
    const appsKey = shiftEmployerScopedKey("shift_applications_v1", scopeId);

    const bucket: Record<string, unknown>[] = [];
    const confirmedIds: string[] = [];
    const shortlistIds: string[] = [];

    for (let w = 1; w <= safeApps; w += 1) {
      const status = STATUS_CYCLE[(emp + w) % STATUS_CYCLE.length] ?? "applied";
      const appId = `vs${emp}_${w}`;
      bucket.push({
        id: appId,
        postId: post.id,
        status,
        createdAt: now - emp * 1000 - w,
        workerMlId: qaBulkWorkerId(w),
        workerName: workerName(w),
        profileSnapshot: { uniqueId: qaBulkWorkerId(w), fullName: workerName(w) },
      });
      if (status === "confirmed" && confirmedIds.length < 3) confirmedIds.push(appId);
      if ((status === "shortlisted" || status === "waiting") && shortlistIds.length < 8) {
        shortlistIds.push(appId);
      }
      if (workerProjection.length < 300) {
        workerProjection.push(bucket[bucket.length - 1]!);
      }
    }

    post.confirmedIds = confirmedIds;
    post.shortlistIds = shortlistIds;

    const okPosts = safeSet(postsKey, JSON.stringify([post]));
    const okFavs = safeSet(favKey, JSON.stringify(favorites));
    const okApps = safeSet(appsKey, JSON.stringify(bucket));
    safeSet(`${postsKey}__migrated_v1`, "1");
    safeSet(`${favKey}__migrated_v1`, "1");
    safeSet(`${appsKey}__migrated_v1`, "1");

    if (!okPosts || !okFavs || !okApps) {
      quotaTrimmedEmployers += 1;
      // Stop adding more tenants if quota is exhausted.
      break;
    }

    scopedAppKeys += 1;
    totalApplications += bucket.length;
    registry.push({ id, companyName: post.companyName, favoriteCount: favorites.length });
  }

  safeSet(
    QA_MULTI_EMPLOYER_REGISTRY_KEY,
    JSON.stringify({
      seeded: true,
      seededAt: now,
      employerCount: scopedAppKeys,
      employers: registry,
      visualStress: true,
    }),
  );
  safeSet("wm_employee_shift_search_v1", JSON.stringify(searchPosts.slice(0, scopedAppKeys)));
  safeSet(WORKER_APPS_PROJECTION_KEY, JSON.stringify(workerProjection));

  window.dispatchEvent(new Event("wm:employee-shift-search-changed"));
  window.dispatchEvent(new Event("wm:employee-shift-applications-changed"));
  window.dispatchEvent(new Event("wm:employer-shift-posts-changed"));
  window.dispatchEvent(new Event("wm:employer-shift-favorites-changed"));

  const vaultWorkers = [1, 10, 25, 50, 75, 100];
  for (const w of vaultWorkers) {
    writeWorkerVaultStub(qaBulkWorkerId(w), now);
  }

  const sampleEmployerId = qaMultiEmployerId(1);
  const samplePostId = "qa_mt_post_1";
  const pulseEventsQueued = queueShiftPulseEvents(samplePostId, "vs1_1");

  roleStorage.set("employer");
  assumeQaMultiEmployer(1);

  if (totalApplications < 10_000) {
    throw new Error(
      `Visual stress seed under target: wrote ${totalApplications} apps across ${scopedAppKeys} employers (quotaTrimmed=${quotaTrimmedEmployers}). Free disk/LS quota and retry.`,
    );
  }

  return {
    employers: scopedAppKeys,
    appsPerEmployer: safeApps,
    totalApplications,
    scopedAppKeys,
    vaultWorkersTouched: vaultWorkers.length,
    sampleEmployerId,
    samplePostId,
    pulseEventsQueued,
    quotaTrimmedEmployers,
  };
}

export { qaMultiEmployerId, qaBulkWorkerId, QA_MULTI_EMPLOYER_COUNT, QA_BULK_COUNT };
