/**
 * Live Scale Stress seed — 10 employers × 100 distinct workers each (= 1,000).
 * Mobile visual audit / Playwright only. Quota-safe slim records.
 */

import {
  assumeQaMultiEmployer,
  qaMultiEmployerId,
  QA_MULTI_EMPLOYER_REGISTRY_KEY,
} from "./qaMultiEmployer.seed";
import { sanitizeShiftEmployerScopeId, shiftEmployerScopedKey } from "./shiftEmployerScope";
import { WORKER_APPS_PROJECTION_KEY } from "./shiftTenantProjection";
import { sanitizeVaultWorkerScopeId, vaultWorkerScopedKey } from "../workVault/vaultWorkerScope";
import { roleStorage } from "../../../app/storage/roleStorage";

export const LIVE_SCALE_EMPLOYERS = 10;
export const LIVE_SCALE_WORKERS_PER_EMPLOYER = 100;
export const LIVE_SCALE_TOTAL_WORKERS =
  LIVE_SCALE_EMPLOYERS * LIVE_SCALE_WORKERS_PER_EMPLOYER;

const CATEGORIES = [
  "Warehouse",
  "Logistics",
  "Retail",
  "Hospitality",
  "Construction",
  "Cleaning",
  "Security",
  "Events",
  "Kitchen",
  "Delivery",
] as const;

const STATUS_CYCLE = [
  "applied",
  "applied",
  "applied",
  "applied",
  "shortlisted",
  "waiting",
  "confirmed",
  "rejected",
] as const;

export type LiveScaleStressSeedResult = {
  employers: number;
  workersPerEmployer: number;
  totalDistinctWorkers: number;
  totalApplications: number;
  sampleEmployerId: string;
  samplePostId: string;
  sampleActiveWorkspaceId: string;
  sampleCompletedWorkspaceId: string;
  sampleConfirmedAppId: string;
  vaultHits: number;
  categories: string[];
};

export function liveScaleWorkerId(globalIndex1Based: number): string {
  return `ML_SCALE_${String(globalIndex1Based).padStart(4, "0")}`;
}

export function liveScalePostId(employerIndex1Based: number): string {
  return `scale_post_${employerIndex1Based}`;
}

export function liveScaleWorkspaceId(
  employerIndex1Based: number,
  kind: "active" | "done",
): string {
  return `scale_ws_${employerIndex1Based}_${kind}`;
}

function safeSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function writeVaultHit(workerMlId: string, now: number): void {
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
  safeSet(
    `wm_employee_${scope}_vault_career_history_v1`,
    JSON.stringify([
      {
        id: `ch_${scope}`,
        kind: "shift",
        title: "Scale stress closed shift",
        closedAt: now,
        vaultHit: true,
      },
    ]),
  );
}

function makeWorkspace(args: {
  id: string;
  postId: string;
  appId: string;
  workerMlId: string;
  workerName: string;
  companyName: string;
  jobName: string;
  status: "active" | "completed";
  now: number;
  startAt: number;
  endAt: number;
}) {
  return {
    id: args.id,
    postId: args.postId,
    appId: args.appId,
    workerMlId: args.workerMlId,
    workerName: args.workerName,
    companyName: args.companyName,
    jobName: args.jobName,
    category: "other",
    locationName: "City A",
    locationAddress: "Scale Gate",
    mapsLink: "",
    startAt: args.startAt,
    endAt: args.endAt,
    lastActivityAt: args.now,
    unreadCount: 1,
    status: args.status,
    updates: [
      {
        id: `upd_${args.id}`,
        createdAt: args.now,
        kind: "broadcast",
        title: "Scale announcement",
        body: "Report to Scale Gate — stress audit broadcast.",
      },
    ],
  };
}

/**
 * Seed 10 employers × 100 distinct employees (1,000 total) for live visual stress.
 */
export function applyLiveScaleStressSeed(
  employerCount = LIVE_SCALE_EMPLOYERS,
  workersPerEmployer = LIVE_SCALE_WORKERS_PER_EMPLOYER,
): LiveScaleStressSeedResult {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    throw new Error("applyLiveScaleStressSeed requires browser localStorage");
  }

  const safeEmployers = Math.max(1, Math.min(employerCount, 10));
  const safeWorkers = Math.max(1, Math.min(workersPerEmployer, 100));
  const now = Date.now();

  try {
    localStorage.clear();
  } catch {
    /* continue */
  }

  const registry: Array<{ id: string; companyName: string; favoriteCount: number }> = [];
  const searchPosts: Record<string, unknown>[] = [];
  const workerProjection: Record<string, unknown>[] = [];
  const employeeWorkspaces: ReturnType<typeof makeWorkspace>[] = [];
  let totalApplications = 0;
  let vaultHits = 0;
  let sampleConfirmedAppId = "sc1_1";

  for (let emp = 1; emp <= safeEmployers; emp += 1) {
    const id = qaMultiEmployerId(emp);
    const scopeId = sanitizeShiftEmployerScopeId(id);
    const category = CATEGORIES[(emp - 1) % CATEGORIES.length] ?? "Warehouse";
    const startAt = now + 86_400_000 + (emp % 5) * 86_400_000;
    const endAt = startAt + 8 * 3_600_000;
    const postId = liveScalePostId(emp);
    const companyName = `Scale Emp #${emp}`;
    const jobName = `Scale ${category} Shift #${emp}`;

    const post: Record<string, unknown> = {
      id: postId,
      companyName,
      jobName,
      category,
      experience: "fresher_ok",
      payPerDay: 900 + emp * 10,
      payBasis: "per_day",
      locationName: `City ${(emp % 5) + 1}`,
      locationAddress: `Scale Gate ${emp}`,
      distanceKm: 2 + (emp % 4),
      startAt,
      endAt,
      description: `Live scale stress tenant ${id}`,
      shiftTiming: "09:00-18:00",
      mapsLink: "",
      vacancies: 8,
      waitingBuffer: 2,
      analysisStatus: "done",
      confirmedIds: [] as string[],
      shortlistIds: [] as string[],
      waitingIds: [] as string[],
      rejectedIds: [] as string[],
      status: "active",
      mustHave: ["packing"],
      goodToHave: ["punctual"],
      isHiddenFromSearch: false,
      source: emp === 1 ? "planner" : "single",
      planId: emp === 1 ? "scale_plan_1" : undefined,
      employerScopeId: scopeId,
      employerOrgId: id,
      settings: { backupSlots: 2, autoPromoteBackup: false, notifyBackup: false },
    };

    const tenantPosts: Record<string, unknown>[] = [post];
    if (emp === 1) {
      tenantPosts.push({
        ...post,
        id: `${postId}_day2`,
        jobName: `${jobName} Day 2`,
        source: "planner",
        planId: "scale_plan_1",
        startAt: startAt + 86_400_000,
        endAt: endAt + 86_400_000,
      });
      // Open finder post (no apps) so Quick Apply can mount.
      tenantPosts.push({
        ...post,
        id: "scale_post_open_qa",
        jobName: "Scale Open QuickApply",
        source: "single",
        planId: undefined,
        confirmedIds: [],
        shortlistIds: [],
        waitingIds: [],
        rejectedIds: [],
        vacancies: 3,
      });
    }

    const bucket: Record<string, unknown>[] = [];
    const confirmedIds: string[] = [];
    const shortlistIds: string[] = [];
    const waitingIds: string[] = [];
    const rejectedIds: string[] = [];
    const favorites: Record<string, unknown>[] = [];

    for (let w = 1; w <= safeWorkers; w += 1) {
      const globalWorker = (emp - 1) * safeWorkers + w;
      const workerMlId = liveScaleWorkerId(globalWorker);
      const workerName = `Scale Worker ${globalWorker}`;
      const status = STATUS_CYCLE[(emp + w) % STATUS_CYCLE.length] ?? "applied";
      const appId = `sc${emp}_${w}`;

      bucket.push({
        id: appId,
        postId,
        status,
        createdAt: now - emp * 1000 - w,
        employerScopeId: scopeId,
        workerMlId,
        workerName,
        profileSnapshot: {
          uniqueId: workerMlId,
          fullName: workerName,
          city: `City ${(w % 5) + 1}`,
          skills: ["packing", "loading"],
          avgRating: 3 + (w % 3),
        },
        mustHaveAnswers: {},
        goodToHaveAnswers: {},
        notes: {},
      });

      if (status === "confirmed" && confirmedIds.length < 4) confirmedIds.push(appId);
      if (status === "shortlisted" && shortlistIds.length < 12) shortlistIds.push(appId);
      if (status === "waiting" && waitingIds.length < 6) waitingIds.push(appId);
      if (status === "rejected" && rejectedIds.length < 8) rejectedIds.push(appId);

      if (w <= 3) {
        favorites.push({
          id: `fav_sc_${emp}_${w}`,
          workerMlId,
          workerName,
          shiftsWorked: 1 + (w % 3),
          avgStars: 4,
          addedAt: now,
          addedVia: "manual",
        });
      }

      if (workerProjection.length < 400) {
        workerProjection.push(bucket[bucket.length - 1]!);
      }
    }

    post.confirmedIds = confirmedIds;
    post.shortlistIds = shortlistIds;
    post.waitingIds = waitingIds;
    post.rejectedIds = rejectedIds;
    for (const p of tenantPosts) {
      if (p.id === postId) {
        p.confirmedIds = confirmedIds;
        p.shortlistIds = shortlistIds;
        p.waitingIds = waitingIds;
        p.rejectedIds = rejectedIds;
      }
      searchPosts.push(p);
    }

    const postsKey = shiftEmployerScopedKey("shift_posts_v1", scopeId);
    const appsKey = shiftEmployerScopedKey("shift_applications_v1", scopeId);
    const favKey = shiftEmployerScopedKey("shift_favorites_v1", scopeId);
    const wsKey = shiftEmployerScopedKey("shift_workspaces_v1", scopeId);

    const confirmedAppId = confirmedIds[0] ?? `sc${emp}_1`;
    const confirmedApp = bucket.find((a) => a.id === confirmedAppId) as
      | { workerMlId: string; workerName: string; id: string }
      | undefined;
    const workerMlId = confirmedApp?.workerMlId ?? liveScaleWorkerId((emp - 1) * safeWorkers + 1);
    const workerName = confirmedApp?.workerName ?? `Scale Worker ${(emp - 1) * safeWorkers + 1}`;

    const activeWs = makeWorkspace({
      id: liveScaleWorkspaceId(emp, "active"),
      postId,
      appId: confirmedAppId,
      workerMlId,
      workerName,
      companyName,
      jobName,
      status: "active",
      now,
      startAt,
      endAt,
    });
    const doneWs = makeWorkspace({
      id: liveScaleWorkspaceId(emp, "done"),
      postId,
      appId: confirmedAppId,
      workerMlId,
      workerName,
      companyName,
      jobName,
      status: "completed",
      now,
      startAt: now - 172_800_000,
      endAt: now - 86_400_000,
    });

    safeSet(postsKey, JSON.stringify(tenantPosts));
    safeSet(appsKey, JSON.stringify(bucket));
    safeSet(favKey, JSON.stringify(favorites));
    safeSet(wsKey, JSON.stringify([activeWs, doneWs]));
    safeSet(`${postsKey}__migrated_v1`, "1");
    safeSet(`${appsKey}__migrated_v1`, "1");
    safeSet(`${favKey}__migrated_v1`, "1");
    safeSet(`${wsKey}__migrated_v1`, "1");

    if (emp === 1) {
      sampleConfirmedAppId = confirmedAppId;
      employeeWorkspaces.push(activeWs, doneWs);
      writeVaultHit(workerMlId, now);
      vaultHits += 1;
    }

    totalApplications += bucket.length;
    registry.push({ id, companyName, favoriteCount: favorites.length });
  }

  safeSet(
    QA_MULTI_EMPLOYER_REGISTRY_KEY,
    JSON.stringify({
      seeded: true,
      seededAt: now,
      employerCount: safeEmployers,
      employers: registry,
      liveScaleStress: true,
      totalDistinctWorkers: safeEmployers * safeWorkers,
    }),
  );
  safeSet("wm_employee_shift_search_v1", JSON.stringify(searchPosts));
  safeSet("wm_employer_shift_posts_v1", JSON.stringify(searchPosts));
  safeSet(WORKER_APPS_PROJECTION_KEY, JSON.stringify(workerProjection));
  safeSet("wm_employee_shift_workspaces_v1", JSON.stringify(employeeWorkspaces));
  safeSet("wm_employee_shift_applications_v1", JSON.stringify(workerProjection.slice(0, 120)));
  safeSet(
    "wm_employee_settings_v1",
    JSON.stringify({ quickApplyEnabled: true, language: "en" }),
  );
  safeSet("wm_employee_shift_favorites_v1", JSON.stringify(["scale_post_1", "scale_post_open_qa"]));
  safeSet(
    "wm_vault_shift_history_v1",
    JSON.stringify([
      {
        id: "vsh_scale_1",
        postId: liveScalePostId(1),
        closedAt: now,
        vaultHit: true,
        jobName: "Scale closed",
      },
    ]),
  );
  safeSet(
    "wm_employee_personal_calendar_shift_v1",
    JSON.stringify([{ id: "cal_scale_1", postId: liveScalePostId(1), date: new Date(now).toISOString() }]),
  );

  // Pending direct invite for IN-W1
  const inviteWorker = liveScaleWorkerId(1);
  const invite = {
    id: "inv_scale_1",
    postId: "scale_post_open_qa",
    workerMlId: inviteWorker,
    employerScopeId: sanitizeShiftEmployerScopeId(qaMultiEmployerId(1)),
    companyName: "Scale Emp #1",
    jobName: "Scale Open QuickApply",
    status: "pending",
    createdAt: now,
    shiftDateLabel: new Date(now + 86_400_000).toLocaleDateString(),
  };
  safeSet("wm_employee_shift_direct_invites_v1", JSON.stringify([invite]));
  safeSet(
    shiftEmployerScopedKey(
      "shift_direct_invites_v1",
      sanitizeShiftEmployerScopeId(qaMultiEmployerId(1)),
    ),
    JSON.stringify([invite]),
  );

  // Compact worker directory (1,000 ids) — names only, avoids profile bloat.
  const directory: Array<{ uniqueId: string; fullName: string; city: string }> = [];
  for (let i = 1; i <= safeEmployers * safeWorkers; i += 1) {
    directory.push({
      uniqueId: liveScaleWorkerId(i),
      fullName: `Scale Worker ${i}`,
      city: `City ${(i % 5) + 1}`,
    });
  }
  safeSet("wm_live_scale_worker_directory_v1", JSON.stringify(directory));

  window.dispatchEvent(new Event("wm:employee-shift-search-changed"));
  window.dispatchEvent(new Event("wm:employee-shift-applications-changed"));
  window.dispatchEvent(new Event("wm:employer-shift-posts-changed"));
  window.dispatchEvent(new Event("wm:employer-shift-favorites-changed"));
  window.dispatchEvent(new Event("wm:employee-shift-workspaces-changed"));
  window.dispatchEvent(new Event("wm:shift-employer-scope-changed"));

  roleStorage.set("employer");
  assumeQaMultiEmployer(1);

  return {
    employers: safeEmployers,
    workersPerEmployer: safeWorkers,
    totalDistinctWorkers: safeEmployers * safeWorkers,
    totalApplications,
    sampleEmployerId: qaMultiEmployerId(1),
    samplePostId: liveScalePostId(1),
    sampleActiveWorkspaceId: liveScaleWorkspaceId(1, "active"),
    sampleCompletedWorkspaceId: liveScaleWorkspaceId(1, "done"),
    sampleConfirmedAppId,
    vaultHits,
    categories: [...CATEGORIES].slice(0, safeEmployers),
  };
}

export { qaMultiEmployerId, assumeQaMultiEmployer };
