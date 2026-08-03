/** Job Mitra | careerDbTruth.service.ts | src/features/career/services/careerDbTruth.service.ts
 *
 * Phase 12 — Career DB-authoritative sync.
 * When AUTH_BACKEND_ENABLED: DB is source of truth; LS is a merge cache.
 * When auth off: callers keep demo/E2E LS-only paths.
 */

import { resolveActorStorageId } from "../../../app/identity/identity.adapter";
import { employeeProfileStorage } from "../../employee/profile/storage/employeeProfile.storage";
import {
  CAREER_APPS_KEY,
  notifyCareerAppsChanged,
  safeParse,
  safeRead,
  safeWrite,
} from "../helpers/careerStoragePublic";
import type { CareerApplication, CareerApplicationStage } from "../types/careerDomainTypes";
import { careerAppIdBridge, isCareerServerUuid } from "../utils/careerAppIdBridge";
import { careerPostIdBridge } from "../utils/careerPostIdBridge";
import { parseServerCareerStatus, toClientCareerStatus } from "../utils/careerStatusMapping";
import {
  careerGateApi,
  isCareerApiSyncEnabled,
  type ServerCareerApplicationDto,
} from "./careerGateApi.service";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readLocalApps(): CareerApplication[] {
  return safeParse<CareerApplication>(safeRead(CAREER_APPS_KEY));
}

function writeLocalApps(apps: CareerApplication[]): boolean {
  const result = safeWrite(CAREER_APPS_KEY, apps);
  if (!result.ok) return false;
  notifyCareerAppsChanged();
  return true;
}

function getCurrentEmployeeId(): string {
  return resolveActorStorageId("employee", "employee_demo");
}

function parseIsoMs(value: string, fallback: number): number {
  if (!value.trim()) return fallback;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : fallback;
}

function findLocalAppForServer(
  apps: CareerApplication[],
  serverApp: ServerCareerApplicationDto,
): CareerApplication | undefined {
  const bridge = careerAppIdBridge.load();
  const localFromBridge = bridge.serverToLocal[serverApp.id];
  if (localFromBridge) {
    const hit = apps.find((app) => app.id === localFromBridge);
    if (hit) return hit;
  }

  const byServerId = apps.find((app) => app.id === serverApp.id);
  if (byServerId) return byServerId;

  return apps.find((app) => {
    if (app.jobId === serverApp.post_id) return true;
    return careerPostIdBridge.resolveServerPostId(app.jobId) === serverApp.post_id;
  });
}

function stubFromServer(serverApp: ServerCareerApplicationDto): CareerApplication | null {
  const parsed = parseServerCareerStatus(serverApp.status);
  if (!parsed) return null;

  const profile = employeeProfileStorage.get();
  const now = Date.now();
  const appliedAt = parseIsoMs(serverApp.applied_at, now);
  const updatedAt = parseIsoMs(serverApp.updated_at, appliedAt);

  return {
    id: serverApp.id,
    jobId: serverApp.post_id,
    employeeId: getCurrentEmployeeId(),
    employeeName: profile.fullName.trim() || "Applicant",
    employeePhone: "",
    employeeEmail: "",
    resumeSummary: "",
    coverNote: serverApp.cover_note?.trim() ?? "",
    expectedSalary: 0,
    noticePeriod: "Immediate",
    profileSnapshot: {
      uniqueId: profile.uniqueId || undefined,
      fullName: profile.fullName.trim() || undefined,
    },
    stage: toClientCareerStatus(parsed),
    currentRound: 0,
    roundResults: [],
    appliedAt,
    updatedAt,
    employerNotes: "",
  };
}

/**
 * Merge one server application into LS cache. DB stage/timestamps win.
 * Preserves rich local fields (offer details, salary, screening) when a twin exists.
 */
export function mergeServerApplicationIntoLsCache(
  serverApp: ServerCareerApplicationDto,
  preferredLocalAppId?: string,
): CareerApplication | null {
  const parsed = parseServerCareerStatus(serverApp.status);
  if (!parsed) return null;

  const clientStage: CareerApplicationStage = toClientCareerStatus(parsed);
  const apps = readLocalApps();
  const preferred = preferredLocalAppId?.trim()
    ? apps.find((app) => app.id === preferredLocalAppId.trim())
    : undefined;
  const existing = preferred ?? findLocalAppForServer(apps, serverApp);

  careerPostIdBridge.upsert(existing?.jobId ?? serverApp.post_id, serverApp.post_id);
  careerAppIdBridge.upsert(existing?.id ?? serverApp.id, serverApp.id);

  const appliedAt = parseIsoMs(serverApp.applied_at, existing?.appliedAt ?? Date.now());
  const updatedAt = parseIsoMs(serverApp.updated_at, Date.now());

  if (existing) {
    const merged: CareerApplication = {
      ...existing,
      stage: clientStage,
      coverNote: serverApp.cover_note?.trim() || existing.coverNote,
      appliedAt,
      updatedAt,
      withdrawnAt:
        clientStage === "withdrawn" || clientStage === "offer_declined"
          ? (existing.withdrawnAt ?? updatedAt)
          : existing.withdrawnAt,
      offerAcceptedAt:
        clientStage === "offer_accepted" || clientStage === "hired"
          ? (existing.offerAcceptedAt ?? updatedAt)
          : existing.offerAcceptedAt,
      hiredAt: clientStage === "hired" ? (existing.hiredAt ?? updatedAt) : existing.hiredAt,
      offeredAt:
        clientStage === "offered" || clientStage === "offer_accepted" || clientStage === "hired"
          ? (existing.offeredAt ?? updatedAt)
          : existing.offeredAt,
    };

    const next = apps.map((app) => (app.id === existing.id ? merged : app));
    writeLocalApps(next);
    return merged;
  }

  const stub = stubFromServer(serverApp);
  if (!stub) return null;
  writeLocalApps([stub, ...apps]);
  return stub;
}

let hydrateInFlight: Promise<CareerApplication[]> | null = null;
let lastHydrateAt = 0;
const HYDRATE_COOLDOWN_MS = 5_000;

/**
 * DB-authoritative hydrate: GET applications → merge into LS cache (DB wins).
 * Returns merged LS snapshot for the current employee (cache + server).
 * When auth off: returns LS only.
 */
export async function hydrateCareerApplicationsFromServer(): Promise<CareerApplication[]> {
  if (!isCareerApiSyncEnabled()) {
    return readLocalApps();
  }

  const now = Date.now();
  if (hydrateInFlight) return hydrateInFlight;
  if (now - lastHydrateAt < HYDRATE_COOLDOWN_MS) {
    return readLocalApps();
  }

  hydrateInFlight = (async () => {
    try {
      const serverApps = await careerGateApi.listMyApplications();
      for (const serverApp of serverApps) {
        mergeServerApplicationIntoLsCache(serverApp);
      }
      lastHydrateAt = Date.now();
    } catch {
      // Network/API failure → LS cache fallback
    } finally {
      hydrateInFlight = null;
    }
    return readLocalApps();
  })();

  return hydrateInFlight;
}

const postHydrateInFlight = new Map<string, Promise<void>>();

/** Employer: list applications for one post from DB → merge into LS. */
export async function hydrateCareerApplicationsForPostFromServer(
  localOrServerPostId: string,
): Promise<void> {
  if (!isCareerApiSyncEnabled()) return;

  const serverPostId = careerPostIdBridge.resolveServerPostId(localOrServerPostId);
  if (!serverPostId) return;

  const existing = postHydrateInFlight.get(serverPostId);
  if (existing) return existing;

  const run = (async () => {
    try {
      const serverApps = await careerGateApi.listApplicationsForPost(serverPostId);
      for (const serverApp of serverApps) {
        mergeServerApplicationIntoLsCache(serverApp);
      }
    } catch {
      // LS cache fallback
    } finally {
      postHydrateInFlight.delete(serverPostId);
    }
  })();

  postHydrateInFlight.set(serverPostId, run);
  return run;
}

/** Apply-success helper: merge DTO into the just-written local row. */
export function applyServerTruthAfterApply(
  localAppId: string,
  serverApp: ServerCareerApplicationDto,
): CareerApplication | null {
  return mergeServerApplicationIntoLsCache(serverApp, localAppId);
}

export function isCareerApplicationRecord(value: unknown): value is CareerApplication {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.jobId === "string" &&
    typeof value.stage === "string"
  );
}

export function requireCareerServerPostId(localOrServerPostId: string): string | null {
  return careerPostIdBridge.resolveServerPostId(localOrServerPostId);
}

export function requireCareerServerApplicationId(localOrServerAppId: string): string | null {
  return careerAppIdBridge.resolveServerApplicationId(localOrServerAppId);
}

export { isCareerServerUuid };
