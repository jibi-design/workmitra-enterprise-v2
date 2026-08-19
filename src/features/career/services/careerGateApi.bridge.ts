import { getCurrentActorId, identityBridge } from "../../../app/identity/identity.adapter";
import { AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";
import { employeeProfileStorage } from "../../employee/profile/storage/employeeProfile.storage";
import { employerSettingsStorage } from "../../../shared/employerProfile/employerSettingsPublic";
import { CAREER_APPS_KEY, safeRead } from "../helpers/careerStoragePublic";
import { getCareerEmployeeAppsStorageKey } from "../helpers/careerStoragePublic";
import { careerAppIdBridge, isCareerServerUuid } from "../utils/careerAppIdBridge";
import { careerPostIdBridge } from "../utils/careerPostIdBridge";
import type { ServerCareerApplicationDto } from "./careerGateApi.types";

export function isCareerApiSyncEnabled(): boolean {
  return AUTH_BACKEND_ENABLED;
}

/** PROD AUTH: missing UUID rolls back. DEV: keep local writes for seeded E2E / demo posts. */
export function mustRollbackCareerLocalWrite(serverId: string | null | undefined): boolean {
  return !serverId && !import.meta.env.DEV;
}

export function resolveCareerGateApplicationId(localAppId: string): string | null {
  return careerAppIdBridge.resolveServerApplicationId(localAppId);
}

export function resolveCareerGatePostId(localPostId: string): string | null {
  return careerPostIdBridge.resolveServerPostId(localPostId);
}

export function syncActorIdentityBridge(role: "employee" | "employer"): void {
  const actor = getCurrentActorId(role);
  if (actor.source !== "auth" || !actor.authUserId) return;

  const legacyId =
    role === "employee"
      ? employeeProfileStorage.get().uniqueId?.trim()
      : employerSettingsStorage.get().uniqueId?.trim();

  if (legacyId) {
    identityBridge.upsert(role, legacyId, actor.authUserId);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mergeServerApplicationsIntoBridges(
  applications: ServerCareerApplicationDto[],
): void {
  let localApps: unknown[] = [];
  try {
    const raw = safeRead(getCareerEmployeeAppsStorageKey()) ?? safeRead(CAREER_APPS_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) localApps = parsed;
    }
  } catch {
    localApps = [];
  }

  for (const serverApp of applications) {
    careerPostIdBridge.upsert(serverApp.post_id, serverApp.post_id);

    const matchedLocal = localApps.find((item) => {
      if (!isRecord(item)) return false;
      const localId = typeof item.id === "string" ? item.id.trim() : "";
      const jobId = typeof item.jobId === "string" ? item.jobId.trim() : "";
      if (!localId || !jobId) return false;

      if (jobId === serverApp.post_id) return true;
      const bridgedPost = careerPostIdBridge.resolveServerPostId(jobId);
      return bridgedPost === serverApp.post_id;
    });

    if (matchedLocal && isRecord(matchedLocal) && typeof matchedLocal.id === "string") {
      careerAppIdBridge.upsert(matchedLocal.id.trim(), serverApp.id);
    } else if (isCareerServerUuid(serverApp.id)) {
      careerAppIdBridge.upsert(serverApp.id, serverApp.id);
    }
  }
}

let hydrateInFlight: Promise<void> | null = null;
let lastHydrateAt = 0;
const HYDRATE_COOLDOWN_MS = 5_000;

export async function hydrateCareerAppIdBridgeFromServer(): Promise<void> {
  if (!isCareerApiSyncEnabled()) return;

  const now = Date.now();
  if (hydrateInFlight) return hydrateInFlight;
  if (now - lastHydrateAt < HYDRATE_COOLDOWN_MS) return;

  hydrateInFlight = (async () => {
    try {
      const { hydrateCareerApplicationsFromServer } = await import("./careerDbTruth.service");
      await hydrateCareerApplicationsFromServer();
      lastHydrateAt = Date.now();
    } catch {
      // demo-safe: LS cache remains
    } finally {
      hydrateInFlight = null;
    }
  })();

  return hydrateInFlight;
}
