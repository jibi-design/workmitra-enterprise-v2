// App name: Job Mitra
// File name: careerPersistence.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\helpers\careerPersistence.ts

import type {
  CareerApplication,
  CareerJobPost,
  CareerWorkspace,
  EmployerCareerActivityEntry,
} from "../types/careerTypes";
import {
  notifyCareerActivityChanged,
  notifyCareerAppsChanged,
  notifyCareerPostsChanged,
  notifyCareerWorkspacesChanged,
  safeParse,
  safeWrite,
  type CareerStorageWriteResult,
} from "./careerStorageUtils";
import {
  careerEmployerScopedKey,
  getCareerEmployerScopeId,
  sanitizeCareerEmployerScopeId,
  tryGetCareerEmployerScopeId,
  tryResolveCareerEmployerScopedKey,
} from "../../../shared/career/careerEmployerScope";
import {
  CAREER_EMPLOYEE_LEGACY_KEYS,
  getCurrentCareerEmployeeScopeId,
  resolveCareerEmployeeScopedKey,
  sanitizeCareerEmployeeScopeId,
} from "../../../shared/career/careerEmployeeScope";
import {
  listCareerEmployerSearchStorageKeys,
  readMergedCareerSearchIndexRaw,
} from "../../../shared/career/careerSearchIndex.scope";
import { normalizeCareerActivity } from "./careerActivityNormalizers";
import { normalizeCareerApplication } from "./careerApplicationNormalizers";
import { normalizeCareerPost } from "./careerPostNormalizers";
import { normalizeCareerWorkspace } from "./careerWorkspaceNormalizers";

const EMPLOYER_APPS_LEGACY = "wm_employee_career_applications_v1";
const EMPLOYER_WS_LEGACY = "wm_employee_career_workspaces_v1";
const STORAGE_UNAVAILABLE: CareerStorageWriteResult = { ok: false, reason: "storage_error" };

function careerPostsKey(): string | null {
  return tryResolveCareerEmployerScopedKey("career_posts_v1");
}

function careerActivityKey(): string | null {
  return tryResolveCareerEmployerScopedKey("career_activity_log_v1");
}

function careerEmployerAppsKey(scopeId?: string): string | null {
  const scope = scopeId?.trim() || tryGetCareerEmployerScopeId();
  if (!scope) return null;
  return careerEmployerScopedKey("career_applications_v1", scope);
}

function careerEmployerWorkspacesKey(scopeId?: string): string | null {
  const scope = scopeId?.trim() || tryGetCareerEmployerScopeId();
  if (!scope) return null;
  return careerEmployerScopedKey("career_workspaces_v1", scope);
}

function migratedFlag(scopedKey: string): string {
  return `${scopedKey}__migrated_v1`;
}

function parseApps(raw: string | null): CareerApplication[] {
  return safeParse<unknown>(raw)
    .map(normalizeCareerApplication)
    .filter((item): item is CareerApplication => item !== null)
    .sort((a, b) => b.appliedAt - a.appliedAt);
}

function parseWorkspaces(raw: string | null): CareerWorkspace[] {
  return safeParse<unknown>(raw)
    .map(normalizeCareerWorkspace)
    .filter((item): item is CareerWorkspace => item !== null);
}

function writeAppsRaw(key: string, apps: CareerApplication[]): CareerStorageWriteResult {
  return safeWrite(key, apps);
}

function writeWorkspacesRaw(key: string, list: CareerWorkspace[]): CareerStorageWriteResult {
  return safeWrite(key, list);
}

function upsertAppsById(
  existing: CareerApplication[],
  incoming: CareerApplication[],
): CareerApplication[] {
  const byId = new Map<string, CareerApplication>();
  for (const app of existing) byId.set(app.id, app);
  for (const app of incoming) byId.set(app.id, app);
  return Array.from(byId.values()).sort((a, b) => b.appliedAt - a.appliedAt);
}

function upsertWorkspacesById(
  existing: CareerWorkspace[],
  incoming: CareerWorkspace[],
): CareerWorkspace[] {
  const byId = new Map<string, CareerWorkspace>();
  for (const ws of existing) byId.set(ws.id, ws);
  for (const ws of incoming) byId.set(ws.id, ws);
  return Array.from(byId.values()).slice(0, 100);
}

/** Resolve employer tenant scope for a job (posts → search index → current scope). */
export function resolveEmployerScopeIdForCareerJob(jobId: string): string {
  const trimmed = jobId.trim();
  const postsKey = careerPostsKey();
  if (!trimmed) {
    return tryGetCareerEmployerScopeId() ?? getCareerEmployerScopeId();
  }

  if (postsKey) {
    try {
      const posts = safeParse<unknown>(localStorage.getItem(postsKey))
        .map(normalizeCareerPost)
        .filter((item): item is CareerJobPost => item !== null);
      const hit = posts.find((post) => post.id === trimmed);
      if (hit?.employerId?.trim()) {
        return sanitizeCareerEmployerScopeId(hit.employerId);
      }
    } catch {
      /* continue */
    }
  }

  try {
    const searchRaw = readMergedCareerSearchIndexRaw();
    const searchPosts = safeParse<Record<string, unknown>>(searchRaw);
    const hit = searchPosts.find((post) => post.id === trimmed);
    const employerId = typeof hit?.employerId === "string" ? hit.employerId.trim() : "";
    if (employerId) return sanitizeCareerEmployerScopeId(employerId);
  } catch {
    /* continue */
  }

  // Prefer current employer search bucket when merge is empty but scoped write exists.
  try {
    for (const key of listCareerEmployerSearchStorageKeys()) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const posts = safeParse<Record<string, unknown>>(raw);
      const hit = posts.find((post) => post.id === trimmed);
      if (hit) {
        const employerId = typeof hit.employerId === "string" ? hit.employerId.trim() : "";
        if (employerId) return sanitizeCareerEmployerScopeId(employerId);
        // Key itself encodes scope: wm_employer_{scope}_career_search_v1
        const match = /^wm_employer_([a-zA-Z0-9_-]+)_career_search_v1$/.exec(key);
        if (match?.[1]) return sanitizeCareerEmployerScopeId(match[1]);
      }
    }
  } catch {
    /* continue */
  }

  return tryGetCareerEmployerScopeId() ?? getCareerEmployerScopeId();
}

function migrateEmployerAppsOnce(scopeId: string): void {
  if (typeof localStorage === "undefined") return;
  const scopedKey = careerEmployerAppsKey(scopeId);
  if (!scopedKey) return;
  const flag = migratedFlag(scopedKey);

  try {
    if (localStorage.getItem(flag) === "1") return;

    const scopedRaw = localStorage.getItem(scopedKey);
    if (scopedRaw && scopedRaw !== "[]") {
      localStorage.setItem(flag, "1");
      return;
    }

    const legacyApps = parseApps(localStorage.getItem(EMPLOYER_APPS_LEGACY));
    if (legacyApps.length === 0) {
      localStorage.setItem(flag, "1");
      return;
    }

    const postsKey = careerPostsKey();
    const postIds = new Set(
      postsKey
        ? safeParse<unknown>(localStorage.getItem(postsKey))
            .map(normalizeCareerPost)
            .filter((item): item is CareerJobPost => item !== null)
            .map((post) => post.id)
        : [],
    );

    const mine = postIds.size > 0 ? legacyApps.filter((app) => postIds.has(app.jobId)) : legacyApps;

    if (mine.length > 0) {
      writeAppsRaw(scopedKey, mine);
    }
    localStorage.setItem(flag, "1");
  } catch {
    /* demo-safe */
  }
}

function migrateEmployerWorkspacesOnce(scopeId: string): void {
  if (typeof localStorage === "undefined") return;
  const scopedKey = careerEmployerWorkspacesKey(scopeId);
  if (!scopedKey) return;
  const flag = migratedFlag(scopedKey);

  try {
    if (localStorage.getItem(flag) === "1") return;

    const scopedRaw = localStorage.getItem(scopedKey);
    if (scopedRaw && scopedRaw !== "[]") {
      localStorage.setItem(flag, "1");
      return;
    }

    const legacy = parseWorkspaces(localStorage.getItem(EMPLOYER_WS_LEGACY));
    if (legacy.length === 0) {
      localStorage.setItem(flag, "1");
      return;
    }

    const postsKey = careerPostsKey();
    const postIds = new Set(
      postsKey
        ? safeParse<unknown>(localStorage.getItem(postsKey))
            .map(normalizeCareerPost)
            .filter((item): item is CareerJobPost => item !== null)
            .map((post) => post.id)
        : [],
    );

    const mine = postIds.size > 0 ? legacy.filter((ws) => postIds.has(ws.jobId)) : legacy;
    if (mine.length > 0) {
      writeWorkspacesRaw(scopedKey, mine);
    }
    localStorage.setItem(flag, "1");
  } catch {
    /* demo-safe */
  }
}

function migrateEmployeeAppsOnce(workerId: string): void {
  if (typeof localStorage === "undefined") return;
  const scopedKey = resolveCareerEmployeeScopedKey("career_applications_v1", workerId);
  // resolve already migrates for current worker; for foreign workers skip legacy
  const current = getCurrentCareerEmployeeScopeId();
  if (sanitizeCareerEmployeeScopeId(workerId) !== current) return;

  const flag = migratedFlag(scopedKey);
  try {
    if (localStorage.getItem(flag) === "1") return;

    const scopedRaw = localStorage.getItem(scopedKey);
    if (scopedRaw && scopedRaw !== "[]") {
      localStorage.setItem(flag, "1");
      return;
    }

    const legacyApps = parseApps(
      localStorage.getItem(CAREER_EMPLOYEE_LEGACY_KEYS.career_applications_v1),
    );
    const mine = legacyApps.filter(
      (app) =>
        !app.employeeId ||
        sanitizeCareerEmployeeScopeId(app.employeeId) === sanitizeCareerEmployeeScopeId(workerId),
    );
    if (mine.length > 0) {
      writeAppsRaw(scopedKey, mine);
    }
    localStorage.setItem(flag, "1");
  } catch {
    /* demo-safe */
  }
}

function migrateEmployeeWorkspacesOnce(workerId: string): void {
  if (typeof localStorage === "undefined") return;
  const scopedKey = resolveCareerEmployeeScopedKey("career_workspaces_v1", workerId);
  const current = getCurrentCareerEmployeeScopeId();
  if (sanitizeCareerEmployeeScopeId(workerId) !== current) return;

  const flag = migratedFlag(scopedKey);
  try {
    if (localStorage.getItem(flag) === "1") return;

    const scopedRaw = localStorage.getItem(scopedKey);
    if (scopedRaw && scopedRaw !== "[]") {
      localStorage.setItem(flag, "1");
      return;
    }

    const legacy = parseWorkspaces(
      localStorage.getItem(CAREER_EMPLOYEE_LEGACY_KEYS.career_workspaces_v1),
    );
    // Workspaces historically lacked employeeId — migrate full legacy into current worker once.
    if (legacy.length > 0) {
      writeWorkspacesRaw(scopedKey, legacy);
    }
    localStorage.setItem(flag, "1");
  } catch {
    /* demo-safe */
  }
}

function dualWriteAppsToEmployeePartitions(apps: CareerApplication[]): void {
  const byWorker = new Map<string, CareerApplication[]>();

  for (const app of apps) {
    const workerId = sanitizeCareerEmployeeScopeId(
      app.employeeId || app.profileSnapshot?.uniqueId || "",
    );
    if (!workerId || workerId === "unknown_worker") continue;
    const list = byWorker.get(workerId) ?? [];
    list.push(app);
    byWorker.set(workerId, list);
  }

  for (const [workerId, workerApps] of byWorker) {
    const key = resolveCareerEmployeeScopedKey("career_applications_v1", workerId);
    migrateEmployeeAppsOnce(workerId);
    const existing = parseApps(localStorage.getItem(key));
    // Replace this employer's apps for these ids; keep other employers' apps in worker bucket.
    const incomingIds = new Set(workerApps.map((app) => app.id));
    const retained = existing.filter((app) => !incomingIds.has(app.id));
    writeAppsRaw(key, upsertAppsById(retained, workerApps));
  }
}

function dualWriteAppsToEmployerPartitions(apps: CareerApplication[]): void {
  const byScope = new Map<string, CareerApplication[]>();

  for (const app of apps) {
    const scopeId = resolveEmployerScopeIdForCareerJob(app.jobId);
    const list = byScope.get(scopeId) ?? [];
    list.push(app);
    byScope.set(scopeId, list);
  }

  for (const [scopeId, scopeApps] of byScope) {
    migrateEmployerAppsOnce(scopeId);
    const key = careerEmployerAppsKey(scopeId);
    if (!key) continue;
    const existing = parseApps(localStorage.getItem(key));
    const incomingIds = new Set(scopeApps.map((app) => app.id));
    const retained = existing.filter((app) => !incomingIds.has(app.id));
    writeAppsRaw(key, upsertAppsById(retained, scopeApps));
  }
}

function dualWriteWorkspacesToEmployee(list: CareerWorkspace[], employeeId?: string): void {
  const workerId = sanitizeCareerEmployeeScopeId(employeeId || getCurrentCareerEmployeeScopeId());
  if (!workerId || workerId === "unknown_worker") return;

  const key = resolveCareerEmployeeScopedKey("career_workspaces_v1", workerId);
  migrateEmployeeWorkspacesOnce(workerId);
  const existing = parseWorkspaces(localStorage.getItem(key));
  writeWorkspacesRaw(key, upsertWorkspacesById(existing, list));
}

export function readCareerPosts(): CareerJobPost[] {
  const key = careerPostsKey();
  if (!key) return [];
  const raw = localStorage.getItem(key);

  return safeParse<unknown>(raw)
    .map(normalizeCareerPost)
    .filter((item): item is CareerJobPost => item !== null)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

/** Employer ATS — tenant-scoped applications only. */
export function readCareerApps(): CareerApplication[] {
  const scopeId = tryGetCareerEmployerScopeId();
  if (!scopeId) return [];
  migrateEmployerAppsOnce(scopeId);
  const key = careerEmployerAppsKey(scopeId);
  if (!key) return [];
  return parseApps(localStorage.getItem(key));
}

/** Employee marketplace — worker-scoped applications only. */
export function readCareerAppsForEmployee(workerMlId?: string): CareerApplication[] {
  const workerId = sanitizeCareerEmployeeScopeId(
    workerMlId?.trim() || getCurrentCareerEmployeeScopeId(),
  );
  migrateEmployeeAppsOnce(workerId);
  const raw = localStorage.getItem(
    resolveCareerEmployeeScopedKey("career_applications_v1", workerId),
  );
  return parseApps(raw);
}

/** Employer ATS — tenant-scoped workspaces. */
export function readCareerWorkspaces(): CareerWorkspace[] {
  const scopeId = tryGetCareerEmployerScopeId();
  if (!scopeId) return [];
  migrateEmployerWorkspacesOnce(scopeId);
  const key = careerEmployerWorkspacesKey(scopeId);
  if (!key) return [];
  return parseWorkspaces(localStorage.getItem(key));
}

/** Employee — worker-scoped workspaces. */
export function readCareerWorkspacesForEmployee(workerMlId?: string): CareerWorkspace[] {
  const workerId = sanitizeCareerEmployeeScopeId(
    workerMlId?.trim() || getCurrentCareerEmployeeScopeId(),
  );
  migrateEmployeeWorkspacesOnce(workerId);
  const raw = localStorage.getItem(
    resolveCareerEmployeeScopedKey("career_workspaces_v1", workerId),
  );
  return parseWorkspaces(raw);
}

export function readCareerActivityAll(): EmployerCareerActivityEntry[] {
  const key = careerActivityKey();
  if (!key) return [];
  const raw = localStorage.getItem(key);

  return safeParse<unknown>(raw)
    .map(normalizeCareerActivity)
    .filter((item): item is EmployerCareerActivityEntry => item !== null)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export type { CareerStorageWriteResult };

export function writeCareerPosts(posts: CareerJobPost[]): CareerStorageWriteResult {
  const key = careerPostsKey();
  if (!key) return STORAGE_UNAVAILABLE;
  const result = safeWrite(key, posts);
  if (!result.ok) return result;
  notifyCareerPostsChanged();
  return { ok: true };
}

/** Employer write + project into each worker partition (B-P0-1). */
export function writeCareerApps(apps: CareerApplication[]): CareerStorageWriteResult {
  const scopeId = tryGetCareerEmployerScopeId();
  if (!scopeId) return STORAGE_UNAVAILABLE;
  migrateEmployerAppsOnce(scopeId);
  const key = careerEmployerAppsKey(scopeId);
  if (!key) return STORAGE_UNAVAILABLE;
  const result = writeAppsRaw(key, apps);
  if (!result.ok) return result;

  dualWriteAppsToEmployeePartitions(apps);
  notifyCareerAppsChanged();
  return { ok: true };
}

/** Employee write + project into employer tenant partition (B-P0-1). */
export function writeCareerAppsForEmployee(
  apps: CareerApplication[],
  workerMlId?: string,
): CareerStorageWriteResult {
  const workerId = sanitizeCareerEmployeeScopeId(
    workerMlId?.trim() || getCurrentCareerEmployeeScopeId(),
  );
  migrateEmployeeAppsOnce(workerId);
  const key = resolveCareerEmployeeScopedKey("career_applications_v1", workerId);
  const result = writeAppsRaw(key, apps);
  if (!result.ok) return result;

  dualWriteAppsToEmployerPartitions(apps);
  notifyCareerAppsChanged();
  return { ok: true };
}

export function writeCareerWorkspaces(
  list: CareerWorkspace[],
  options?: { employeeId?: string },
): CareerStorageWriteResult {
  const scopeId = tryGetCareerEmployerScopeId();
  if (!scopeId) return STORAGE_UNAVAILABLE;
  migrateEmployerWorkspacesOnce(scopeId);
  const key = careerEmployerWorkspacesKey(scopeId);
  if (!key) return STORAGE_UNAVAILABLE;
  const result = writeWorkspacesRaw(key, list);
  if (!result.ok) return result;

  if (options?.employeeId) {
    dualWriteWorkspacesToEmployee(list, options.employeeId);
  }
  notifyCareerWorkspacesChanged();
  return { ok: true };
}

export function writeCareerWorkspacesForEmployee(
  list: CareerWorkspace[],
  workerMlId?: string,
): CareerStorageWriteResult {
  const workerId = sanitizeCareerEmployeeScopeId(
    workerMlId?.trim() || getCurrentCareerEmployeeScopeId(),
  );
  migrateEmployeeWorkspacesOnce(workerId);
  const key = resolveCareerEmployeeScopedKey("career_workspaces_v1", workerId);
  const result = writeWorkspacesRaw(key, list);
  if (!result.ok) return result;
  notifyCareerWorkspacesChanged();
  return { ok: true };
}

export function writeCareerActivityAll(
  list: EmployerCareerActivityEntry[],
): CareerStorageWriteResult {
  const key = careerActivityKey();
  if (!key) return STORAGE_UNAVAILABLE;
  const result = safeWrite(key, list);
  if (!result.ok) return result;
  notifyCareerActivityChanged();
  return { ok: true };
}

/** Raw LS key for employer apps snapshot subscriptions. */
export function getCareerEmployerAppsStorageKey(): string {
  const scopeId = tryGetCareerEmployerScopeId();
  if (!scopeId) return "wm_employer__unavailable_career_applications_v1";
  migrateEmployerAppsOnce(scopeId);
  return careerEmployerAppsKey(scopeId) ?? "wm_employer__unavailable_career_applications_v1";
}

/** Raw LS key for employee apps snapshot subscriptions. */
export function getCareerEmployeeAppsStorageKey(workerMlId?: string): string {
  const workerId = sanitizeCareerEmployeeScopeId(
    workerMlId?.trim() || getCurrentCareerEmployeeScopeId(),
  );
  migrateEmployeeAppsOnce(workerId);
  return resolveCareerEmployeeScopedKey("career_applications_v1", workerId);
}

export function getCareerEmployerWorkspacesStorageKey(): string {
  const scopeId = tryGetCareerEmployerScopeId();
  if (!scopeId) return "wm_employer__unavailable_career_workspaces_v1";
  migrateEmployerWorkspacesOnce(scopeId);
  return careerEmployerWorkspacesKey(scopeId) ?? "wm_employer__unavailable_career_workspaces_v1";
}

export function getCareerEmployeeWorkspacesStorageKey(workerMlId?: string): string {
  const workerId = sanitizeCareerEmployeeScopeId(
    workerMlId?.trim() || getCurrentCareerEmployeeScopeId(),
  );
  migrateEmployeeWorkspacesOnce(workerId);
  return resolveCareerEmployeeScopedKey("career_workspaces_v1", workerId);
}
