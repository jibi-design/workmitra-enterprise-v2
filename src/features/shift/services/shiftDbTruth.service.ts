/** Job Mitra | shiftDbTruth.service.ts — Phase 13 Shift DB→LS merge (auth on) */

import { isShiftApiSyncEnabled, shiftGateApi } from "./shiftGateApi.service";
import { buildShiftPostCreateBody } from "./shiftDbTruth.mappers.helpers";
import {
  mergeServerApplicationIntoLsCache,
  mergeServerApplicationsBatchIntoLsCache,
  mergeServerPostIntoLsCache,
  mergeServerPostsBatchIntoLsCache,
} from "./shiftDbTruth.merge.helpers";
import { isShiftServerUuid, shiftPostIdBridge } from "../utils/shiftIdBridge";

export {
  buildShiftPostCreateBody,
  mergeServerPostIntoLsCache,
  mergeServerApplicationIntoLsCache,
  mergeServerPostsBatchIntoLsCache,
  mergeServerApplicationsBatchIntoLsCache,
};

let postsHydrateInFlight: Promise<void> | null = null;
let appsHydrateInFlight: Promise<void> | null = null;
let lastPostsHydrate = 0;
let lastAppsHydrate = 0;
const COOLDOWN = 5_000;

export async function hydrateShiftPostsFromServer(force = false): Promise<boolean> {
  if (!isShiftApiSyncEnabled()) return true;
  const now = Date.now();
  if (postsHydrateInFlight) {
    await postsHydrateInFlight;
    if (!force) return true;
  }
  if (!force && now - lastPostsHydrate < COOLDOWN) return true;

  let ok = true;
  postsHydrateInFlight = (async () => {
    try {
      const posts = await shiftGateApi.listMyPosts();
      mergeServerPostsBatchIntoLsCache(posts);
      lastPostsHydrate = Date.now();
    } catch {
      ok = false;
    } finally {
      postsHydrateInFlight = null;
    }
  })();
  await postsHydrateInFlight;
  return ok;
}

export async function hydrateShiftApplicationsFromServer(force = false): Promise<boolean> {
  if (!isShiftApiSyncEnabled()) return true;
  const now = Date.now();
  if (appsHydrateInFlight) {
    await appsHydrateInFlight;
    if (!force) return true;
  }
  if (!force && now - lastAppsHydrate < COOLDOWN) return true;

  let ok = true;
  appsHydrateInFlight = (async () => {
    try {
      const apps = await shiftGateApi.listMyApplications();
      mergeServerApplicationsBatchIntoLsCache(apps);
      lastAppsHydrate = Date.now();
    } catch {
      ok = false;
    } finally {
      appsHydrateInFlight = null;
    }
  })();
  await appsHydrateInFlight;
  return ok;
}

const employerAppsHydrateInFlight = new Map<string, Promise<void>>();
const lastEmployerAppsHydrate = new Map<string, number>();

export async function hydrateEmployerPostApplicationsFromServer(
  postId: string,
): Promise<boolean> {
  if (!isShiftApiSyncEnabled()) return true;
  const serverId = isShiftServerUuid(postId)
    ? postId.trim()
    : (shiftPostIdBridge.resolveServerId(postId) ?? "");
  if (!serverId) return true;

  const inflight = employerAppsHydrateInFlight.get(serverId);
  if (inflight) {
    await inflight;
    return true;
  }
  const now = Date.now();
  if (now - (lastEmployerAppsHydrate.get(serverId) ?? 0) < COOLDOWN) return true;

  let ok = true;
  const run = (async () => {
    try {
      const apps = await shiftGateApi.listPostApplications(serverId);
      mergeServerApplicationsBatchIntoLsCache(apps, serverId);
      lastEmployerAppsHydrate.set(serverId, Date.now());
    } catch {
      ok = false;
    } finally {
      employerAppsHydrateInFlight.delete(serverId);
    }
  })();
  employerAppsHydrateInFlight.set(serverId, run);
  await run;
  return ok;
}
