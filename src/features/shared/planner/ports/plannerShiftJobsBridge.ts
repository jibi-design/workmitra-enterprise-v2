/**
 * Job Mitra | plannerShiftJobsBridge.ts
 * ShiftJobs-safe write + read surface for planner plan-group enrollment & posts grouping.
 *
 * employer/shiftJobs MUST import planner operations from here only (SEP-SJB-1).
 * Do not import employer/planner/* directly from shiftJobs.
 *
 * Const/object SoT bindings stay as live `export { x } from` (ESM TDZ-safe under
 * circular planner↔shift imports). Functions use thin wrappers.
 */

import {
  enrollConfirmedWorkerInPlanGroup as enrollConfirmedWorkerInPlanGroupImpl,
  unenrollWorkerFromPlanGroup as unenrollWorkerFromPlanGroupImpl,
} from "../../../employer/planner/services/planBroadcast.service";
import {
  splitEmployerPostsForMyPosts as splitEmployerPostsForMyPostsImpl,
  applyPlanPostsDisplayMode as applyPlanPostsDisplayModeImpl,
} from "../../../employer/planner/helpers/employerPlannerPostsGrouping";

export function enrollConfirmedWorkerInPlanGroup(
  ...args: Parameters<typeof enrollConfirmedWorkerInPlanGroupImpl>
): ReturnType<typeof enrollConfirmedWorkerInPlanGroupImpl> {
  return enrollConfirmedWorkerInPlanGroupImpl(...args);
}

export function unenrollWorkerFromPlanGroup(
  ...args: Parameters<typeof unenrollWorkerFromPlanGroupImpl>
): ReturnType<typeof unenrollWorkerFromPlanGroupImpl> {
  return unenrollWorkerFromPlanGroupImpl(...args);
}

export function splitEmployerPostsForMyPosts(
  ...args: Parameters<typeof splitEmployerPostsForMyPostsImpl>
): ReturnType<typeof splitEmployerPostsForMyPostsImpl> {
  return splitEmployerPostsForMyPostsImpl(...args);
}

export function applyPlanPostsDisplayMode(
  ...args: Parameters<typeof applyPlanPostsDisplayModeImpl>
): ReturnType<typeof applyPlanPostsDisplayModeImpl> {
  return applyPlanPostsDisplayModeImpl(...args);
}

export { fmtPlanDate } from "../../../employer/planner/helpers/plannerDateFormat.helpers";
export { demandPlannerStorage } from "../../../employer/planner/storage/demandPlannerStorage";
export { plannerPublicIndex } from "../../../employer/planner/storage/plannerPublicIndex.storage";

export type { EmployerPlannerPostGroup } from "../../../employer/planner/helpers/employerPlannerPostsGrouping";
