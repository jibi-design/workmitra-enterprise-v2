/** Job Mitra | shiftDbTruth.service.ts — Phase 13 Shift DB→LS merge (auth on) */

import { employeeProfileStorage } from "../../employee/profile/storage/employeeProfile.storage";
import { isShiftApiSyncEnabled, shiftGateApi } from "./shiftGateApi.service";
import { buildShiftPostCreateBody } from "./shiftDbTruth.mappers.helpers";
import {
  mergeServerApplicationIntoLsCache,
  mergeServerApplicationsBatchIntoLsCache,
  mergeServerPostIntoLsCache,
  mergeServerPostsBatchIntoLsCache,
} from "./shiftDbTruth.merge.helpers";

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

export async function hydrateShiftPostsFromServer(): Promise<boolean> {
  if (!isShiftApiSyncEnabled()) return true;
  const now = Date.now();
  if (postsHydrateInFlight) {
    await postsHydrateInFlight;
    return true;
  }
  if (now - lastPostsHydrate < COOLDOWN) return true;

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

export async function hydrateShiftApplicationsFromServer(): Promise<boolean> {
  if (!isShiftApiSyncEnabled()) return true;
  const now = Date.now();
  if (appsHydrateInFlight) {
    await appsHydrateInFlight;
    return true;
  }
  if (now - lastAppsHydrate < COOLDOWN) return true;

  let ok = true;
  appsHydrateInFlight = (async () => {
    try {
      const wmId = employeeProfileStorage.get().uniqueId?.trim();
      const apps = await shiftGateApi.listMyApplications(wmId);
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
