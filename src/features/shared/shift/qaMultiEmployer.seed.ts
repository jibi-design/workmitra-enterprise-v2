/**
 * QA Multi-Employer seed — 100+ employers with keyed Shift isolation.
 * DEV / test only. God Mode → Seed Multi-Employers / Assume Employer.
 */

import type { EmployerProfile } from "../../employer/company/storage/employerSettings.storage.types";
import { employerSettingsStorage } from "../../employer/company/storage/employerSettings.storage";
import { EMPTY_PROFILE } from "../../employer/company/storage/employerSettings.storage.constants";
import type { FavoriteWorker } from "../../employer/shiftJobs/storage/favoritesStorage";
import type { ShiftPost } from "../../employer/shiftJobs/storage/employerShift.types";
import type { ShiftWorkspace } from "../../employer/shiftJobs/types/shiftWorkspaceTypes";
import {
  getShiftEmployerScopeId,
  notifyShiftEmployerScopeChanged,
  sanitizeShiftEmployerScopeId,
  shiftEmployerScopedKey,
} from "./shiftEmployerScope";
import {
  applyQaBulkCandidateSeed,
  buildQaBulkFavorites,
  qaBulkWorkerId,
  QA_BULK_COUNT,
} from "./qaBulkCandidates.seed";

export const QA_MULTI_EMPLOYER_COUNT = 105;
export const QA_MULTI_EMPLOYER_PREFIX = "ML_QA_EMP_";
export const QA_MULTI_EMPLOYER_REGISTRY_KEY = "wm_qa_multi_employer_registry_v1";

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
] as const;
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
] as const;
const CITIES = ["Kochi", "Thrissur", "Kozhikode", "Kannur", "Alappuzha"] as const;

export type QaMultiEmployerSeedResult = {
  employerCount: number;
  sampleIds: string[];
  favoritePool: number;
};

export function qaMultiEmployerId(index1Based: number): string {
  return `${QA_MULTI_EMPLOYER_PREFIX}${index1Based}`;
}

function workerName(i: number): string {
  return `${FIRST[(i - 1) % FIRST.length]} ${LAST[(i - 1) % LAST.length]} #${i}`;
}

function buildFavoriteSlice(empN: number, now: number): FavoriteWorker[] {
  // Strict scale: ≥50 favorites per employer from the 100-candidate pool.
  const favSet = new Set<number>();
  const start = ((empN - 1) * 3) % QA_BULK_COUNT;
  for (let j = 0; j < 55; j += 1) {
    favSet.add(((start + j) % QA_BULK_COUNT) + 1);
  }
  // Shared overlap anchors for cross-tenant stress
  favSet.add(1);
  favSet.add(25);
  favSet.add(50);
  favSet.add(75);
  favSet.add(100);

  const id = qaMultiEmployerId(empN);
  return [...favSet]
    .sort((a, b) => a - b)
    .map((i) => ({
      id: `fav_${id}_${i}`,
      workerMlId: qaBulkWorkerId(i),
      workerName: workerName(i),
      shiftsWorked: (empN + i) % 5,
      avgStars: i % 7 === 0 ? 4.5 : 3,
      addedAt: now - empN * 1000 - i,
      addedVia: "manual" as const,
      notes: `TENANT:${id}`,
      jobTitle: `Tenant ${empN} fav`,
    }));
}

const CATEGORIES = ["warehouse", "kitchen", "delivery", "office", "construction"] as const;
const SKILLS = [
  ["packing", "lifting"],
  ["cooking", "hygiene"],
  ["driving", "navigation"],
  ["excel", "data_entry"],
  ["safety", "tools"],
] as const;

function buildPost(empN: number, now: number): ShiftPost {
  const id = qaMultiEmployerId(empN);
  const startAt = now + 86_400_000 + (empN % 5) * 86_400_000;
  const cat = CATEGORIES[empN % CATEGORIES.length] ?? "warehouse";
  const skills = SKILLS[empN % SKILLS.length] ?? SKILLS[0];
  return {
    id: `qa_mt_post_${empN}`,
    companyName: `QA Employer Co #${empN}`,
    jobName: `MT ${cat} Shift Emp#${empN}`,
    category: cat,
    experience: empN % 3 === 0 ? "experienced" : "fresher_ok",
    payPerDay: 800 + (empN % 20) * 25,
    locationName: CITIES[empN % CITIES.length] ?? "Kochi",
    distanceKm: 2 + (empN % 8),
    startAt,
    endAt: startAt + 8 * 3_600_000,
    description: `TENANT:${id} skills=${skills.join(",")}`,
    mustHave: [...skills],
    goodToHave: ["punctual"],
    vacancies: 3 + (empN % 4),
    waitingBuffer: 1,
    analysisStatus: "not_started",
    confirmedIds: [],
    shortlistIds: [],
    waitingIds: [],
    rejectedIds: [],
    status: empN % 17 === 0 ? "completed" : "active",
    settings: {
      backupSlots: 1,
      autoPromoteBackup: false,
      notifyBackup: false,
    },
  };
}

function buildWorkspace(empN: number, post: ShiftPost, now: number): ShiftWorkspace | null {
  // Messaging stress fixtures for sample tenants + every 10th employer
  if (empN !== 1 && empN !== 50 && empN !== 100 && empN % 10 !== 0) return null;
  const id = qaMultiEmployerId(empN);
  const workerIdx = empN === 50 ? 50 : empN === 100 ? 100 : 25;
  return {
    id: `ws_mt_${empN}_${workerIdx}`,
    postId: post.id,
    appId: `app_mt_${empN}_${workerIdx}`,
    workerMlId: qaBulkWorkerId(workerIdx),
    workerName: workerName(workerIdx),
    companyName: post.companyName,
    jobName: post.jobName,
    category: "other",
    locationName: post.locationName,
    startAt: post.startAt,
    endAt: post.endAt,
    lastActivityAt: now - 1000,
    unreadCount: 2,
    status: empN % 17 === 0 ? "completed" : "active",
    updates: [
      {
        id: `u_${id}_1`,
        createdAt: now - 800,
        kind: "direct",
        title: "Reply (Employee)",
        body: `CHAT_WORKER:${qaBulkWorkerId(workerIdx)} ready for ${post.jobName}`,
      },
      {
        id: `u_${id}_2`,
        createdAt: now - 500,
        kind: "direct",
        title: "Reply (Employer)",
        body: `CHAT_TENANT:${id} — private to this employer`,
      },
      {
        id: `u_${id}_3`,
        createdAt: now - 200,
        kind: "system",
        title: empN % 17 === 0 ? "Marked completed" : "Workspace created",
        body:
          empN % 17 === 0
            ? "Employer marked this assignment as completed."
            : "Lifecycle fixture for ultra-heavy suite.",
      },
    ],
  };
}

function buildProfile(empN: number): EmployerProfile {
  const orgId = qaMultiEmployerId(empN);
  return {
    ...EMPTY_PROFILE,
    employerOrgId: orgId,
    companyUniqueId: orgId,
    uniqueId: orgId,
    ownerUniqueId: `ML_QA_OWNER_${empN}`,
    ownerUserId: `ML_QA_OWNER_${empN}`,
    companyName: `QA Employer Co #${empN}`,
    registrationNo: `QA-REG-${empN}`,
    industryType: "Logistics & Transport",
    companySize: "11-50",
    locationCity: CITIES[empN % CITIES.length] ?? "Kochi",
    locationState: "Kerala",
    companyDescription: `Multi-tenant QA employer ${orgId}`,
    fullName: `QA Owner ${empN}`,
    email: `qa.emp${empN}@example.test`,
    phone: `9000000${String(empN).padStart(3, "0").slice(-3)}`,
    publicHandle: `qa-employer-${empN}`,
    notificationsEnabled: true,
    contactVerified: true,
    verificationLevel: 1,
  };
}

function writeScopedJson(
  scopeId: string,
  suffix: Parameters<typeof shiftEmployerScopedKey>[0],
  value: unknown,
): void {
  const key = shiftEmployerScopedKey(suffix, scopeId);
  localStorage.setItem(key, JSON.stringify(value));
  localStorage.setItem(`${key}__migrated_v1`, "1");
}

/** Seed 105 employers into native keyed Shift stores + shared 50-candidate pool. */
export function applyQaMultiEmployerSeed(
  count = QA_MULTI_EMPLOYER_COUNT,
): QaMultiEmployerSeedResult {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    throw new Error("applyQaMultiEmployerSeed requires browser localStorage");
  }

  applyQaBulkCandidateSeed(QA_BULK_COUNT);

  const now = Date.now();
  const registry: Array<{ id: string; companyName: string; favoriteCount: number }> = [];
  const searchPosts: ShiftPost[] = [];

  for (let n = 1; n <= count; n += 1) {
    const id = qaMultiEmployerId(n);
    const scopeId = sanitizeShiftEmployerScopeId(id);
    const favorites = buildFavoriteSlice(n, now);
    const post = buildPost(n, now);
    searchPosts.push(post);
    const workspace = buildWorkspace(n, post, now);
    const notifications = [
      {
        id: `en_${id}_1`,
        domain: "shift",
        title: `Tenant heartbeat ${id}`,
        body: `Isolation marker TENANT:${id} — favorites=${favorites.length}`,
        createdAt: now - n * 100,
        isRead: false,
      },
    ];
    const activity = [
      {
        id: `al_${id}`,
        postId: post.id,
        kind: "post_created",
        createdAt: now - n * 100,
        title: "Shift post created",
        body: `TENANT:${id}`,
      },
    ];

    writeScopedJson(scopeId, "shift_favorites_v1", favorites);
    writeScopedJson(scopeId, "shift_posts_v1", [post]);
    writeScopedJson(scopeId, "shift_notifications_v1", notifications);
    writeScopedJson(scopeId, "shift_activity_log_v1", activity);
    writeScopedJson(scopeId, "shift_workspaces_v1", workspace ? [workspace] : []);

    registry.push({
      id,
      companyName: `QA Employer Co #${n}`,
      favoriteCount: favorites.length,
    });
  }

  // Also seed current employer's scoped bucket from bulk favorites if profile already set.
  const currentScope = getShiftEmployerScopeId();
  if (!currentScope.startsWith("ML_QA_EMP_")) {
    const bulkFavs = buildQaBulkFavorites(QA_BULK_COUNT);
    writeScopedJson(currentScope, "shift_favorites_v1", bulkFavs);
  } else {
    // Preserve ML_QA_EMP_* keyed favorites — never overwrite with untagged bulk list.
  }

  localStorage.setItem(
    QA_MULTI_EMPLOYER_REGISTRY_KEY,
    JSON.stringify({
      seeded: true,
      seededAt: now,
      employerCount: count,
      employers: registry,
    }),
  );

  // Global employee marketplace: all employer posts visible for Smart Match / Find Shifts.
  try {
    const stamped = searchPosts.map((post, idx) => ({
      ...post,
      employerScopeId: qaMultiEmployerId(idx + 1),
    }));
    localStorage.setItem("wm_employee_shift_search_v1", JSON.stringify(stamped));
    window.dispatchEvent(new Event("wm:employee-shift-search-changed"));
  } catch {
    /* demo-safe */
  }

  window.dispatchEvent(new Event("wm:employer-shift-favorites-changed"));
  window.dispatchEvent(new Event("wm:employer-shift-posts-changed"));
  window.dispatchEvent(new Event("wm:employer-notifications-changed"));
  window.dispatchEvent(new Event("wm:employer-shift-activity-changed"));
  window.dispatchEvent(new Event("wm:employee-shift-workspaces-changed"));
  notifyShiftEmployerScopeChanged();

  return {
    employerCount: count,
    sampleIds: [qaMultiEmployerId(1), qaMultiEmployerId(50), qaMultiEmployerId(100)],
    favoritePool: QA_BULK_COUNT,
  };
}

export function listQaMultiEmployers(): Array<{
  id: string;
  companyName: string;
  favoriteCount: number;
}> {
  try {
    const raw = localStorage.getItem(QA_MULTI_EMPLOYER_REGISTRY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as {
      employers?: Array<{ id: string; companyName: string; favoriteCount: number }>;
    };
    return Array.isArray(parsed.employers) ? parsed.employers : [];
  } catch {
    return [];
  }
}

/** Switch active employer profile → native keyed Shift buckets follow scope id. */
export function assumeQaMultiEmployer(index1Based: number): {
  employerId: string;
  companyName: string;
  scopeId: string;
  favoriteCount: number;
} {
  if (typeof window === "undefined") {
    throw new Error("assumeQaMultiEmployer requires browser");
  }

  const profile = buildProfile(index1Based);
  // Clear first so prior org ids cannot stick across assume switches.
  employerSettingsStorage.clear();
  employerSettingsStorage.save(profile);

  const scopeId = sanitizeShiftEmployerScopeId(qaMultiEmployerId(index1Based));
  let favoriteCount = 0;
  try {
    const raw = localStorage.getItem(shiftEmployerScopedKey("shift_favorites_v1", scopeId));
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    favoriteCount = Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    favoriteCount = 0;
  }

  notifyShiftEmployerScopeChanged();
  window.dispatchEvent(new Event("wm:employer-shift-favorites-changed"));
  window.dispatchEvent(new Event("wm:employer-shift-posts-changed"));
  window.dispatchEvent(new Event("wm:employer-notifications-changed"));
  window.dispatchEvent(new Event("wm:employee-shift-workspaces-changed"));

  return {
    employerId: qaMultiEmployerId(index1Based),
    companyName: profile.companyName,
    scopeId,
    favoriteCount,
  };
}
