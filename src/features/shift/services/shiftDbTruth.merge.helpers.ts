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
import { applyServerApplicationMerge, applyServerPostMerge } from "./shiftDbTruth.merge.apply";

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
  if (dtos.length === 0) return 0;
  let posts = readEmployerPosts();
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
  return merged;
}

/** SC-3 — single LS write + single apps-changed event after full hydrate loop */
export function mergeServerApplicationsBatchIntoLsCache(
  dtos: readonly ServerShiftApplicationDto[],
): number {
  if (dtos.length === 0) return 0;
  let apps = readEmployeeApplications();
  for (const dto of dtos) {
    apps = applyServerApplicationMerge(apps, dto).apps;
  }
  writeEmployeeApplications(apps);
  return dtos.length;
}
