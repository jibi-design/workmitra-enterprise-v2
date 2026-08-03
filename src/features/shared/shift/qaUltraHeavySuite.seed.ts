/**
 * Ultra-heavy E2E suite seed — vault, invites, earnings apps, lifecycle fixtures.
 * Builds on qaMultiEmployer (105 employers) + 100 candidates.
 * DEV only.
 */

import {
  applyQaMultiEmployerSeed,
  assumeQaMultiEmployer,
  qaMultiEmployerId,
  QA_MULTI_EMPLOYER_COUNT,
} from "./qaMultiEmployer.seed";
import { assumeQaBulkWorkerProfile, qaBulkWorkerId, QA_BULK_COUNT } from "./qaBulkCandidates.seed";
import { VAULT_SHIFT_HISTORY_KEY } from "../../employee/workVault/storage/vaultShiftHistory.storage";
import { roleStorage } from "../../../app/storage/roleStorage";
import { shiftEmployerScopedKey } from "./shiftEmployerScope";
import {
  WORKER_APPS_PROJECTION_KEY,
  WORKER_INVITES_PROJECTION_KEY,
  LEGACY_GLOBAL_INVITES_KEY,
} from "./shiftTenantProjection";

export type UltraHeavySuiteResult = {
  employers: number;
  candidates: number;
  minFavoritesPerEmployer: number;
  vaultEntries: number;
  invites: number;
  confirmedApps: number;
  searchPosts: number;
  sampleEmployers: string[];
};

const APPS_KEY = WORKER_APPS_PROJECTION_KEY;
const SEARCH_KEY = "wm_employee_shift_search_v1";
const GLOBAL_WS_KEY = "wm_employee_shift_workspaces_v1";
const EMP_NOTIF_LEGACY = "wm_employer_notifications_v1";

function workerName(i: number): string {
  const FIRST = [
    "Asha",
    "Biju",
    "Chitra",
    "Deepak",
    "Esha",
    "Faisal",
    "Gita",
    "Hari",
    "Indu",
    "Jithin",
  ];
  const LAST = [
    "Nair",
    "Menon",
    "Pillai",
    "Kumar",
    "Joseph",
    "Thomas",
    "Rahman",
    "Das",
    "Iyer",
    "Varghese",
  ];
  return `${FIRST[(i - 1) % 10]} ${LAST[(i - 1) % 10]} #${i}`;
}

/**
 * Full ultra-heavy seed:
 * - 105 employers × ≥50 favorites
 * - 100 candidates + availability
 * - Vault history, confirmed apps (earnings), invites, multi-tenant chats
 */
export function applyUltraHeavySuiteSeed(): UltraHeavySuiteResult {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    throw new Error("applyUltraHeavySuiteSeed requires browser localStorage");
  }

  const multi = applyQaMultiEmployerSeed(QA_MULTI_EMPLOYER_COUNT);
  // Candidate availability pool is already seeded inside applyQaMultiEmployerSeed.
  // Do NOT call applyQaBulkCandidateSeed again — it would overwrite the active
  // employer's keyed favorites/posts with the shared bulk stress fixtures.

  const now = Date.now();

  // --- Direct invites: employer-scoped SoT + worker projection ---
  const allInvites: Record<string, unknown>[] = [];
  for (let emp = 1; emp <= 20; emp += 1) {
    const scopeId = qaMultiEmployerId(emp);
    const bucket: Record<string, unknown>[] = [];
    for (const worker of [1, 25, 50, 75, 100]) {
      const invite = {
        id: `sdi_uh_${emp}_${worker}`,
        postId: `qa_mt_post_${emp}`,
        workerMlId: qaBulkWorkerId(worker),
        workerName: workerName(worker),
        status: worker === 25 && emp === 1 ? "accepted" : worker % 5 === 0 ? "declined" : "pending",
        sentAt: now - emp * 1000 - worker,
        acceptedAt: worker === 25 && emp === 1 ? now - 500 : undefined,
        companyName: `QA Employer Co #${emp}`,
        jobName: `MT Stress Shift Emp#${emp}`,
        employerScopeId: scopeId,
      };
      bucket.push(invite);
      allInvites.push(invite);
    }
    localStorage.setItem(
      shiftEmployerScopedKey("shift_direct_invites_v1", scopeId),
      JSON.stringify(bucket),
    );
  }
  localStorage.setItem(WORKER_INVITES_PROJECTION_KEY, JSON.stringify(allInvites.slice(0, 300)));
  try {
    localStorage.removeItem(LEGACY_GLOBAL_INVITES_KEY);
  } catch {
    /* safe */
  }
  window.dispatchEvent(new Event("wm:shift-direct-invites-changed"));

  // --- Confirmed applications for earnings estimates (many workers) ---
  const apps: Record<string, unknown>[] = [];
  const appsByEmp = new Map<number, Record<string, unknown>[]>();
  const searchPosts: Record<string, unknown>[] = (() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(SEARCH_KEY) || "[]") as unknown;
      return Array.isArray(parsed)
        ? parsed.filter(
            (item): item is Record<string, unknown> => typeof item === "object" && item !== null,
          )
        : [];
    } catch {
      return [];
    }
  })();
  for (let i = 1; i <= QA_BULK_COUNT; i += 1) {
    const emp = ((i - 1) % 20) + 1;
    const postId = `qa_mt_post_${emp}`;
    const startAt = now - (i % 10) * 86_400_000;
    const endAt = startAt + 8 * 3_600_000;
    const pay = 900 + (i % 15) * 20;
    const app = {
      id: `app_uh_earn_${i}`,
      postId,
      status: "confirmed",
      createdAt: startAt - 86_400_000,
      confirmedAt: startAt - 43_200_000,
      profileSnapshot: {
        uniqueId: qaBulkWorkerId(i),
        fullName: workerName(i),
      },
      workerMlId: qaBulkWorkerId(i),
      workerName: workerName(i),
      companyName: `QA Employer Co #${emp}`,
      jobName: `Earnings Fixture Job #${i}`,
    };
    apps.push(app);
    const empApps = appsByEmp.get(emp) ?? [];
    empApps.push(app);
    appsByEmp.set(emp, empApps);
    // Ensure post exists in search for earnings / Smart Match join
    if (!searchPosts.some((p) => p.id === postId)) {
      searchPosts.push({
        id: postId,
        companyName: `QA Employer Co #${emp}`,
        jobName: `Earnings Fixture Job #${i}`,
        category: "other",
        experience: "fresher_ok",
        payPerDay: pay,
        locationName: "Kochi",
        startAt,
        endAt,
        vacancies: 3,
        isHiddenFromSearch: false,
        employerScopeId: qaMultiEmployerId(emp),
      });
    } else {
      const idx = searchPosts.findIndex((p) => p.id === postId);
      if (idx >= 0) {
        const cur = searchPosts[idx];
        searchPosts[idx] = {
          ...cur,
          experience: cur.experience ?? "fresher_ok",
          payPerDay: cur.payPerDay ?? pay,
          startAt: cur.startAt ?? startAt,
          endAt: cur.endAt ?? endAt,
          employerScopeId: cur.employerScopeId ?? qaMultiEmployerId(emp),
        };
      }
    }
  }
  localStorage.setItem(APPS_KEY, JSON.stringify(apps));
  for (const [emp, empApps] of appsByEmp) {
    localStorage.setItem(
      shiftEmployerScopedKey("shift_applications_v1", qaMultiEmployerId(emp)),
      JSON.stringify(empApps),
    );
  }
  // Native join: search posts only (no legacy wm_employer_shift_posts_v1 dual-write).
  const nativeSearch = searchPosts.map((p) => {
    const rec = p as Record<string, unknown>;
    return {
      ...rec,
      experience: rec.experience ?? "fresher_ok",
      payPerDay: typeof rec.payPerDay === "number" ? rec.payPerDay : 900,
      startAt: typeof rec.startAt === "number" ? rec.startAt : now,
      endAt: typeof rec.endAt === "number" ? rec.endAt : now + 8 * 3_600_000,
    };
  });
  localStorage.setItem(SEARCH_KEY, JSON.stringify(nativeSearch));
  try {
    localStorage.removeItem("wm_employer_shift_posts_v1");
  } catch {
    /* safe */
  }
  window.dispatchEvent(new Event("wm:employee-shift-applications-changed"));
  window.dispatchEvent(new Event("wm:employee-shift-search-changed"));
  window.dispatchEvent(new Event("wm:employer-shift-posts-changed"));

  const invites = allInvites;

  // --- Work Vault shift history (employee-owned key) ---
  const vault: unknown[] = [];
  for (const worker of [1, 10, 25, 50, 75, 100]) {
    for (let k = 0; k < 3; k += 1) {
      const emp = worker === 50 ? 50 : worker === 100 ? 100 : 1 + (k % 5);
      vault.push({
        id: `vsh_uh_${worker}_${k}`,
        workspaceId: `ws_mt_${emp}_${worker === 25 || worker === 1 || worker === 10 ? 25 : worker}`,
        postId: `qa_mt_post_${emp}`,
        workerMlId: qaBulkWorkerId(worker),
        workerName: workerName(worker),
        companyName: `QA Employer Co #${emp}`,
        jobTitle: `Completed Vault Shift ${k + 1}`,
        startAt: now - (k + 2) * 86_400_000,
        endAt: now - (k + 2) * 86_400_000 + 8 * 3_600_000,
        completedAt: now - (k + 1) * 86_400_000,
        workerRating: 4,
        employerRating: 5,
        vaultFinalized: true,
        finalizedAt: now - (k + 1) * 86_400_000 + 1000,
      });
    }
  }
  localStorage.setItem(VAULT_SHIFT_HISTORY_KEY, JSON.stringify(vault));
  window.dispatchEvent(new Event("wm:vault-shift-history-changed"));

  // --- Merge sample employer workspaces into global employee marketplace ---
  const globalWs: unknown[] = [];
  for (const emp of [1, 50, 100]) {
    const raw = localStorage.getItem(`wm_employer_ML_QA_EMP_${emp}_shift_workspaces_v1`);
    if (!raw) continue;
    try {
      const list = JSON.parse(raw) as unknown[];
      if (Array.isArray(list)) globalWs.push(...list);
    } catch {
      /* ignore */
    }
  }
  localStorage.setItem(GLOBAL_WS_KEY, JSON.stringify(globalWs));
  window.dispatchEvent(new Event("wm:employee-shift-workspaces-changed"));

  // Ensure legacy unscoped employer notif key empty (no leak surface)
  try {
    if (!localStorage.getItem(EMP_NOTIF_LEGACY)) {
      localStorage.setItem(EMP_NOTIF_LEGACY, "[]");
    }
  } catch {
    /* ignore */
  }

  // Probe favorites floor
  let minFav = Number.POSITIVE_INFINITY;
  for (const n of [1, 50, 100, 105]) {
    const raw = localStorage.getItem(`wm_employer_ML_QA_EMP_${n}_shift_favorites_v1`);
    const len = raw ? (JSON.parse(raw) as unknown[]).length : 0;
    if (len < minFav) minFav = len;
  }

  return {
    employers: multi.employerCount,
    candidates: QA_BULK_COUNT,
    minFavoritesPerEmployer: Number.isFinite(minFav) ? minFav : 0,
    vaultEntries: vault.length,
    invites: invites.length,
    confirmedApps: apps.length,
    searchPosts: searchPosts.length,
    sampleEmployers: multi.sampleIds,
  };
}

export function assumeUltraHeavyEmployer(index1Based: number) {
  roleStorage.set("employer");
  return assumeQaMultiEmployer(index1Based);
}

export function assumeUltraHeavyWorker(index1Based: number) {
  roleStorage.set("employee");
  return assumeQaBulkWorkerProfile(index1Based);
}

export { qaMultiEmployerId, qaBulkWorkerId, QA_MULTI_EMPLOYER_COUNT, QA_BULK_COUNT };
