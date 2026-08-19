/** Job Mitra | shiftDbTruth.merge.helpers.ts — persist wrappers + batch hydrate */

import {
  readEmployerPosts,
  writeEmployerPosts,
  syncToEmployeeSearch,
} from "../../employer/shiftJobs/storage/employerShift.postStorage";
import {
  readEmployeeApplications,
  writeEmployeeApplications,
} from "../../shared/shift/shiftEmployerPublic";
import type { EmployeeShiftApplication, ShiftPost } from "../../shared/shift/shiftEmployerPublic";
import type { ServerShiftApplicationDto, ServerShiftPostDto } from "./shiftGateApi.service";
import { invalidateAppsByPostIndex } from "../../employer/shiftJobs/helpers/appsByPostIndex";
import {
  applyServerApplicationMerge,
  applyServerPostMerge,
  foldLiveHiringStatuses,
} from "./shiftDbTruth.merge.apply";
import { isShiftServerUuid, shiftAppIdBridge, shiftPostIdBridge, shiftPostIdsMatch } from "../utils/shiftIdBridge";

function pruneUnlistedServerPosts(
  posts: ShiftPost[],
  serverIds: ReadonlySet<string>,
): ShiftPost[] {
  return posts.filter((post) => {
    const serverId = shiftPostIdBridge.resolveServerId(post.id);
    if (serverId && isShiftServerUuid(serverId)) return serverIds.has(serverId);
    if (isShiftServerUuid(post.id)) return serverIds.has(post.id);
    return true;
  });
}

function pruneUnlistedServerApps(
  apps: EmployeeShiftApplication[],
  serverIds: ReadonlySet<string>,
): EmployeeShiftApplication[] {
  return apps.filter((app) => {
    const serverId = shiftAppIdBridge.resolveServerId(app.id);
    if (serverId && isShiftServerUuid(serverId)) return serverIds.has(serverId);
    if (isShiftServerUuid(app.id)) return serverIds.has(app.id);
    return true;
  });
}

function pruneUnlistedServerAppsForPost(
  apps: EmployeeShiftApplication[],
  serverIds: ReadonlySet<string>,
  postId: string,
): EmployeeShiftApplication[] {
  return apps.filter((app) => {
    if (!shiftPostIdsMatch(app.postId, postId)) return true;
    const serverId = shiftAppIdBridge.resolveServerId(app.id);
    if (serverId && isShiftServerUuid(serverId)) return serverIds.has(serverId);
    if (isShiftServerUuid(app.id)) return serverIds.has(app.id);
    return true;
  });
}

export function mergeServerPostIntoLsCache(
  dto: ServerShiftPostDto,
  preferredLocalId?: string,
): ShiftPost | null {
  const { posts, merged } = applyServerPostMerge(readEmployerPosts(), dto, preferredLocalId);
  writeEmployerPosts(posts);
  syncToEmployeeSearch(posts);
  return merged;
}

/** SC-3 — single LS write + single search sync after full hydrate loop */
export function mergeServerPostsBatchIntoLsCache(dtos: readonly ServerShiftPostDto[]): number {
  const serverIds = new Set(dtos.map((dto) => dto.id));
  let posts = pruneUnlistedServerPosts(readEmployerPosts(), serverIds);
  for (const dto of dtos) {
    posts = applyServerPostMerge(posts, dto).posts;
  }
  writeEmployerPosts(posts);
  syncToEmployeeSearch(posts);
  return dtos.length;
}

export function mergeServerApplicationIntoLsCache(
  dto: ServerShiftApplicationDto,
  preferredLocalId?: string,
): EmployeeShiftApplication | null {
  const { apps, merged } = applyServerApplicationMerge(
    readEmployeeApplications(),
    dto,
    preferredLocalId,
  );
  writeEmployeeApplications(apps);
  invalidateAppsByPostIndex();
  return merged;
}

/** SC-3 — single LS write + single apps-changed event after full hydrate loop.
 * Pass forPostId when hydrating one post so other posts' applications are not wiped.
 */
export function mergeServerApplicationsBatchIntoLsCache(
  dtos: readonly ServerShiftApplicationDto[],
  forPostId?: string,
): number {
  if (forPostId && dtos.length === 0) return 0;
  const serverIds = new Set(dtos.map((dto) => dto.id));
  let apps = readEmployeeApplications();
  apps = forPostId
    ? pruneUnlistedServerAppsForPost(apps, serverIds, forPostId)
    : pruneUnlistedServerApps(apps, serverIds);
  for (const dto of dtos) {
    apps = applyServerApplicationMerge(apps, dto).apps;
  }
  apps = foldLiveHiringStatuses(apps, readEmployeeApplications());
  writeEmployeeApplications(apps);
  invalidateAppsByPostIndex();
  return dtos.length;
}
